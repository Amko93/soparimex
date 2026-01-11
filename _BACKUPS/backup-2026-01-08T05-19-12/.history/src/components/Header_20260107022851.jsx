import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, User, LayoutDashboard, Search, ArrowRight, Layers, Hash, Package } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Header = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('client');
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({ products: [], subcats: [], cats: [] });
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
      else setUserRole('client');
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (data) setUserRole(data.role);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // ... (Garder la même logique useEffect pour la recherche que précédemment) ...

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 w-full">
      <div className="max-w-[1800px] mx-auto px-8 h-24 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-4">
          <div className="bg-slate-900 p-2.5 rounded-lg shadow-md">
             <span className="text-amber-500 font-bold text-2xl">S</span>
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tight">Soparimex</span>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden xl:flex items-center gap-16">
          <Link to="/" className="text-slate-500 hover:text-blue-600 font-semibold transition-colors">Accueil</Link>
          <Link to="/categories" className="text-slate-500 hover:text-blue-600 font-semibold transition-colors">Catégories</Link>
          <Link to="/contact" className="text-slate-500 hover:text-blue-600 font-semibold transition-colors">Contact</Link>
        </nav>

        {/* RECHERCHE ET ACTIONS */}
        <div className="flex items-center gap-8">
          <div className="relative w-72 xl:w-80" ref={searchRef}>
            <input 
              type="text"
              placeholder="Rechercher..."
              className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                {/* BOUTON ADMIN : Visible seulement pour Admin ou Dev */}
                {(userRole === 'admin' || userRole === 'developpeur') && (
                  <Link to="/admin" className="w-11 h-11 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all border border-blue-100">
                    <LayoutDashboard size={20} />
                  </Link>
                )}
                <Link to="/dashboard" className="w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all border border-slate-100">
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} className="w-11 h-11 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all border border-red-100">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Connexion</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;