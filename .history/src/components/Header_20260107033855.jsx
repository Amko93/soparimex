import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, User, LayoutDashboard, Search } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Header = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('client');
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    /* Utilisation de la variable --header-bg */
    <header style={{ backgroundColor: 'var(--header-bg)' }} className="border-b border-gray-100 sticky top-0 z-50 w-full font-sans transition-colors duration-300">
      <div className="max-w-[1800px] mx-auto px-8 h-24 flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-4">
          <div className="bg-slate-900 p-2.5 rounded-lg shadow-md">
             <span className="text-amber-500 font-bold text-2xl">S</span>
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tight italic">Soparimex</span>
        </Link>

        <nav className="hidden xl:flex items-center gap-12 font-bold text-slate-500">
          <Link to="/" className="hover:text-blue-600">Accueil</Link>
          <Link to="/categories" className="hover:text-blue-600">Catégories</Link>
          <Link to="/catalogues" className="hover:text-blue-600">Catalogues</Link>
          <Link to="/contact" className="hover:text-blue-600">Contact</Link>
        </nav>

        <div className="flex items-center gap-6">
          <div className="relative w-64 xl:w-80">
            <input 
              type="text"
              placeholder="Rechercher..."
              className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-2xl text-sm outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                {(userRole === 'admin' || userRole === 'developpeur') && (
                  <Link to="/admin" style={{ backgroundColor: 'var(--primary-button)' }} className="w-12 h-12 flex items-center justify-center text-white rounded-xl shadow-lg transition-all">
                    <LayoutDashboard size={20} />
                  </Link>
                )}
                <Link to="/dashboard" className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200">
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 border border-red-100">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link to="/login" style={{ backgroundColor: 'var(--primary-button)' }} className="px-8 py-3.5 text-white rounded-2xl font-black shadow-xl transition-all">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;