import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader } from 'lucide-react';

/**
 * Protège une route : vérifie la session, la validation du compte (is_validated) et optionnellement le rôle.
 * Sécurité B2B : On ne laisse entrer personne qui n'a pas is_validated === true.
 * @param {React.ReactNode} children - Contenu à afficher si autorisé
 * @param {boolean} requireAdmin - Si true, exige le rôle admin ou developpeur
 * @param {string[]} allowedRoles - Si fourni, exige que userRole soit dans cette liste (ex: ['admin','developpeur','commercial'])
 */
const ProtectedRoute = ({ children, requireAdmin = false, allowedRoles = null }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isValidated, setIsValidated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    let initialCheckDone = false;

    // Timeout de sécurité : si l'auth ne répond pas en 8s, on redirige vers login
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        setSession(null);
        setLoading(false);
      }
    }, 8000);

    const resolveSession = async (currentSession) => {
      if (!currentSession) {
        if (mounted) {
          setSession(null);
          setUserRole(null);
          setIsValidated(false);
          setLoading(false);
        }
        return;
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_validated, role')
          .eq('id', currentSession.user.id)
          .single();

        if (!mounted) return;

        if (profileError || !profile) {
          setSession(null);
          setUserRole(null);
          setIsValidated(false);
          setLoading(false);
          return;
        }

        if (!profile.is_validated) {
          // Pas de signOut : on redirige simplement, la session reste active
          setSession(null);
          setUserRole(null);
          setIsValidated(false);
          setLoading(false);
          return;
        }

        setSession(currentSession);
        setIsValidated(true);
        setUserRole(profile.role ?? null);
      } catch (err) {
        console.error('Erreur auth ProtectedRoute:', err);
        if (mounted) {
          setSession(null);
          setUserRole(null);
          setIsValidated(false);
        }
      } finally {
        clearTimeout(timeout);
        if (mounted) setLoading(false);
      }
    };

    // Écouter les changements d'auth (inclut INITIAL_SESSION)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      // L'événement INITIAL_SESSION remplace checkAuth — pas de double appel
      if (event === 'INITIAL_SESSION') {
        initialCheckDone = true;
        await resolveSession(newSession);
        return;
      }

      // Pour les autres événements (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
      await resolveSession(newSession);
    });

    // Fallback : si INITIAL_SESSION ne se déclenche pas après 2s, on fait un check manuel
    const fallback = setTimeout(async () => {
      if (!initialCheckDone && mounted) {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (mounted && !initialCheckDone) {
          initialCheckDone = true;
          await resolveSession(s);
        }
      }
    }, 2000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      clearTimeout(fallback);
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // Redirection si pas de session ou compte non validé
  if (!session || !isValidated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérification du rôle : allowedRoles prime sur requireAdmin
  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const role = (userRole || '').toLowerCase();
    if (!allowedRoles.map((r) => r.toLowerCase()).includes(role)) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  } else if (requireAdmin && userRole !== 'admin' && userRole !== 'developpeur') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
