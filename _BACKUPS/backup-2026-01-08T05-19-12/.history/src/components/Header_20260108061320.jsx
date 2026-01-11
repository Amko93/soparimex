import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; 
import { Search, User, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Header = () => {
  const { texts, colors } = useTheme();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('client');
  
  // --- NOUVEAU : État pour la recherche ---
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

  // --- NOUVEAU : Fonction de recherche ---
  const handleSearch = (e) => {
    // Si l'utilisateur appuie sur Entrée et que le champ n'est pas vide
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm(''); // On vide le champ après la recherche (optionnel)
    }
  };

  return (
    <header 
      style={{ backgroundColor: colors.headerBg }} 
      className="border-b border-slate-100 sticky top-0 z-50 w-full font-sans transition-colors duration-300"
    >
      <div className="max-w-[1800px] mx-auto px-8 h-24 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4">
          <div className="bg-slate-900 p-2.5 rounded-lg shadow-md">
             <span className="text-amber-500 font-bold text-2xl">S</span>
          </div>
          <span style={{ color: colors.headerText }} className="text-2xl font-black tracking-tight italic">
            {texts.siteName}
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden xl:flex items-center gap-12 font-bold text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition-colors">Accueil</Link>
          <Link to="/categories" className="hover:text-blue-600 transition-colors">Catégories</Link>
          <Link to="/catalogues" className="hover:text-blue-600 transition-colors">Catalogues</Link>
          <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-6">
          
          {/* --- BARRE DE RECHERCHE MODIFIÉE --- */}
          <div className="relative w-64 xl:w-80">
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                {(userRole === 'admin' || userRole === 'developpeur') && (
                  <Link to="/admin" className="p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all">
                    <LayoutDashboard size={20} />
                  </Link>
                )}
                <Link to="/dashboard" className="p-3.5 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all">
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} className="p-3.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 border border-red-100 transition-all">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                style={{ backgroundColor: colors.primaryButton }} 
                className="px-8 py-3.5 text-white rounded-2xl font-black shadow-xl hover:opacity-90 transition-all flex items-center gap-2"
              >
                <LogIn size={18} />
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