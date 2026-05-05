import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

const loadProfile = async (userId) => {
  if (!userId) return null;
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id, role, full_name, is_validated, status, email, phone, city, societe, job_title, avatar_url, bio, bio_visible')
      .eq('id', userId)
      .single();
    return data || null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Timeout de sécurité : si ça bloque plus de 6s, on débloque quand même
    const safetyTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 6000);

    const init = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (s?.user) {
          const prof = await loadProfile(s.user.id);
          if (mounted) {
            setSession(s);
            setProfile(prof);
          }
        } else {
          if (mounted) setSession(null);
        }
      } catch (err) {
        console.error('AuthContext init error:', err);
        if (mounted) setSession(null);
      } finally {
        clearTimeout(safetyTimer);
        if (mounted) setLoading(false);
      }
    };

    init();

    // Écouter les changements de session (connexion, déconnexion, refresh token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (s?.user) {
          setSession(s);
          const prof = await loadProfile(s.user.id);
          if (mounted) {
            setProfile(prof);
            setLoading(false);
          }
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, loading, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
