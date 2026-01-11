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

  // Logique de recherche (reprise des versions précédentes)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.length < 2) {
        setResults({ products: [], subcats: [], cats: [] });
        return;
      }
      const { data: prodData } = await supabase.from('products').select('id, name, product_code, subcategory_id, image_url').or(`name.ilike.%${searchTerm}%,product_code.ilike.%${searchTerm}%`).limit(5);
      const { data: subData } = await supabase.from('subcategories').select('id, name, image_url').ilike('name', `%${searchTerm}%`).limit(3);
      const { data: catData } = await supabase.from('categories').select('id, name, image_url').ilike('name', `%${searchTerm}%`).limit(3);

      setResults({ products: prodData || [], subcats: subData || [], cats: catData || [] });
      setShowResults(true);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

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

        {/* NAVIGATION - CATALOGUES RÉINTÉGRÉ */}
        <nav className="hidden xl:flex items-center gap-16">
          <Link to="/" className="text-slate-500 hover:text-blue-600 font-semibold transition-colors">Accueil</Link>
          <Link to="/categories" className="text-slate-500 hover:text-blue-600 font-semibold transition-colors">Catégories</Link>
          <Link to="/catalogues" className="text-slate-500 hover:text-blue-600 font-semibold transition-colors">Catalogues</Link>
          <Link to="/contact" className="text-slate-500 hover:text-blue-600 font-semibold transition-colors">Contact</Link>
        </nav>

        {/* RECHERCHE ET ACTIONS */}
        <div className="flex items-center gap-8">
          <div className="relative w-72 xl:w-80" ref={searchRef}>
            <div className="relative">
              <input 
                type="text"
                placeholder="Rechercher..."
                className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>

            {/* RÉSULTATS DE RECHERCHE */}
            {showResults && (
              <div className="absolute top-[calc(100%+12px)] right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden w-full min-w-[350px] z-50">
                <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
                  {/* ... (Contenu des résultats identique aux versions précédentes) ... */}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                {(userRole === 'admin' || userRole === 'developpeur') && (
                  <Link to="/admin" className="w-11 h-11 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all border border-blue-100" title="Admin">
                    <LayoutDashboard size={20} />
                  </Link>
                )}
                <Link to="/dashboard" className="w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all border border-slate-100" title="Compte">
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} className="w-11 h-11 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all border border-red-100">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md">Connexion</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;