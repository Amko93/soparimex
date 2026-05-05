import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

/**
 * Charge le profil complet d'un utilisateur depuis Supabase.
 * Appelé une seule fois au démarrage — partagé via contexte.
 */
const loadProfile = async (userId) => {
  if (!userId) return null;
  const { data } = await supabase
    .from('profiles')
    .select('id, role, full_name, is_validated, status, email, phone, city, societe, job_title, avatar_url, bio, bio_visible')
    .eq('id', userId)
    .single();
  return data || null;
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(undefined); // undefined = en cours de chargement
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // getSession() lit depuis localStorage — quasi-instantané (pas de réseau)
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
      if (mounted) setLoading(false);
    };

    init();

    // Écouter les changements de session (connexion, déconnexion, refresh token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
        return;
      }

      if (s?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        setSession(s);
        const prof = await loadProfile(s.user.id);
        if (mounted) setProfile(prof);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, loading, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook pour accéder au contexte d'authentification.
 * profile contient : id, role, full_name, is_validated, status, email,
 *                    phone, city, societe, job_title, avatar_url, bio, bio_visible
 */
export const useAuth = () => useContext(AuthContext);
