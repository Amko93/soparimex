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

    // Timeout de sécurité absolu : débloque après 8s quoi qu'il arrive
    const safetyTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 8000);

    // Pattern officiel Supabase v2 : onAuthStateChange fire toujours
    // INITIAL_SESSION en premier (même sans réseau), puis les autres events.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        if (!mounted) return;

        try {
          if (event === 'INITIAL_SESSION') {
            // Toujours déclenché, même si pas de session
            if (s?.user) {
              const prof = await loadProfile(s.user.id);
              if (mounted) {
                setSession(s);
                setProfile(prof);
              }
            } else {
              if (mounted) {
                setSession(null);
                setProfile(null);
              }
            }
            // Auth initialisée — fin du chargement
            clearTimeout(safetyTimer);
            if (mounted) setLoading(false);
            return;
          }

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
              if (mounted) setProfile(prof);
            }
          }
        } catch (err) {
          console.error('AuthContext error:', err);
          if (mounted) {
            clearTimeout(safetyTimer);
            setLoading(false);
          }
        }
      }
    );

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
