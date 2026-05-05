import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Protège une route : lit la session depuis AuthContext (pas de requête réseau supplémentaire).
 * @param {React.ReactNode} children
 * @param {boolean} requireAdmin - Exige le rôle admin ou developpeur
 * @param {string[]} allowedRoles - Liste de rôles autorisés
 */
const ProtectedRoute = ({ children, requireAdmin = false, allowedRoles = null }) => {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // Pas de session ou compte non validé → login
  if (!session || !profile?.is_validated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = (profile.role || '').toLowerCase();

  // Vérification du rôle
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.map((r) => r.toLowerCase()).includes(role)) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  } else if (requireAdmin && role !== 'admin' && role !== 'developpeur') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
