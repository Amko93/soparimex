import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, LogOut, User, LayoutDashboard, Settings } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Header = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-slate-900 p-2 rounded shadow-sm transition">
             <span className="text-amber-500 font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight">
            Soparimex
          </span>
           {/* Badge ADMIN (Visuel pour l'instant) */}
           {session && (
            <span className="bg-amber-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full ml-2">
              ADMIN
            </span>
           )}
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium transition">Accueil</Link>
          <Link to="/categories" className="text-slate-600 hover:text-blue-600 font-medium transition">Catégories</Link>
          <Link to="/catalogues" className="text-slate-600 hover:text-blue-600 font-medium transition">Catalogues</Link>
          <Link to="/contact" className="text-slate-600 hover:text-blue-600 font-medium transition">Contact</Link>
        </nav>

        {/* BOUTONS DYNAMIQUES */}
        <div className="flex items-center gap-4">
          
          {session ? (
            <>
              {/* Bouton ADMIN -> Vers le nouveau Super Dashboard */}
              <Link to="/admin" className="hidden md:flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition">
                <LayoutDashboard size={18} />
                <span>Admin</span>
              </Link>
              
              {/* Bouton COMPTE -> Vers le Dashboard Client Classique */}
              <Link to="/dashboard" className="hidden md:flex items-center gap-2 text-slate-700 font-medium hover:text-blue-600 transition">
                <User size={18} />
                <span>Compte</span>
              </Link>

              {/* Déconnexion */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden md:flex items-center gap-2 text-slate-700 font-medium hover:text-blue-600 transition">
                <LogIn size={18} />
                <span>Connexion</span>
              </Link>
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-medium transition flex items-center gap-2 shadow-md shadow-blue-100">
                <UserPlus size={18} />
                <span>Inscription</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;