import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, LogOut, User, LayoutDashboard, Search, Package, ArrowRight, Layers, Hash } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Header = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({ products: [], subcats: [], cats: [] });
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.length < 2) {
        setResults({ products: [], subcats: [], cats: [] });
        return;
      }
      // Recherche Produits
      const { data: prodData } = await supabase
        .from('products')
        .select('id, name, product_code, subcategory_id, image_url')
        .or(`name.ilike.%${searchTerm}%,product_code.ilike.%${searchTerm}%`)
        .limit(5);

      // Recherche Sous-Catégories
      const { data: subData } = await supabase
        .from('subcategories')
        .select('id, name, image_url')
        .ilike('name', `%${searchTerm}%`)
        .limit(3);

      // Recherche Catégories
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name, image_url')
        .ilike('name', `%${searchTerm}%`)
        .limit(3);

      setResults({
        products: prodData || [],
        subcats: subData || [],
        cats: catData || []
      });
      setShowResults(true);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleResultClick = () => {
    setShowResults(false);
    setSearchTerm('');
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
        
        {/* 1. LOGO */}
        <Link to="/" className="flex items-center gap-2 min-w-max">
          <div className="bg-slate-900 p-2 rounded shadow-sm">
             <span className="text-amber-500 font-bold text-xl">S</span>
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight hidden lg:block">
            Soparimex
          </span>
        </Link>

        {/* 2. NAVIGATION (Centrée) */}
        <nav className="hidden md:flex items-center gap-6 mx-4">
          <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium text-sm">Accueil</Link>
          <Link to="/categories" className="text-slate-600 hover:text-blue-600 font-medium text-sm">Catégories</Link>
          <Link to="/catalogues" className="text-slate-600 hover:text-blue-600 font-medium text-sm">Catalogues</Link>
          <Link to="/contact" className="text-slate-600 hover:text-blue-600 font-medium text-sm">Contact</Link>
        </nav>

        {/* 3. RECHERCHE & USER (Droite) */}
        <div className="flex items-center gap-3">
          
          {/* BARRE DE RECHERCHE (Plus petite et alignée) */}
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <input 
                type="text"
                placeholder="Rechercher..."
                className="w-40 lg:w-56 bg-slate-50 border border-slate-200 text-slate-700 pl-9 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            </div>

            {/* RÉSULTATS DÉROULANTS (Ajustés) */}
            {showResults && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden w-64 max-h-[80vh] overflow-y-auto z-50">
                
                {/* Catégories */}
                {results.cats.length > 0 && (
                  <div className="p-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1">Catégories</h4>
                    {results.cats.map(cat => (
                      <Link key={cat.id} to={`/categories/${cat.id}`} onClick={handleResultClick} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-slate-700">
                        <div className="w-6 h-6 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                          {cat.image_url ? <img src={cat.image_url} className="w-full h-full object-cover"/> : <Layers size={14} className="text-blue-500 m-auto mt-1"/>}
                        </div>
                        <span className="font-medium text-xs truncate">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Sous-Catégories */}
                {results.subcats.length > 0 && (
                  <div className="p-2 border-t border-slate-50">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1">Sous-Catégories</h4>
                    {results.subcats.map(sub => (
                      <Link key={sub.id} to={`/products/${sub.id}`} onClick={handleResultClick} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-slate-700">
                        <div className="w-6 h-6 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                          {sub.image_url ? <img src={sub.image_url} className="w-full h-full object-cover"/> : <ArrowRight size={14} className="text-slate-400 m-auto mt-1"/>}
                        </div>
                        <span className="font-medium text-xs truncate">{sub.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Produits */}
                {results.products.length > 0 && (
                  <div className="p-2 border-t border-slate-50">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1">Produits</h4>
                    {results.products.map(prod => (
                      <Link key={prod.id} to={`/products/${prod.subcategory_id}`} onClick={handleResultClick} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-slate-700">
                         <div className="w-6 h-6 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                          {prod.image_url ? <img src={prod.image_url} className="w-full h-full object-cover"/> : <Package size={14} className="text-slate-400 m-auto mt-1"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs text-slate-800 truncate">{prod.name}</div>
                          {prod.product_code && (
                             <div className="text-[10px] text-blue-600 flex items-center gap-1">
                               <Hash size={8}/> {prod.product_code}
                             </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                {/* Aucun résultat */}
                {results.cats.length === 0 && results.subcats.length === 0 && results.products.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-400">Rien trouvé...</div>
                )}
              </div>
            )}
          </div>

          {/* BOUTONS */}
          <div className="flex items-center gap-2">
            {session ? (
              <>
                <Link to="/admin" className="hidden lg:flex items-center justify-center w-9 h-9 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition" title="Admin">
                  <LayoutDashboard size={18} />
                </Link>
                <Link to="/dashboard" className="hidden md:flex items-center justify-center w-9 h-9 bg-slate-100 text-slate-700 rounded-lg hover:text-blue-600 transition" title="Compte">
                  <User size={18} />
                </Link>
                <button onClick={handleLogout} className="flex items-center justify-center w-9 h-9 border border-slate-200 text-slate-700 rounded-lg hover:bg-red-50 hover:text-red-600">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center justify-center w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition" title="Connexion">
                <LogIn size={18} />
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;