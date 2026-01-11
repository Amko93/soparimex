import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, LogOut, User, LayoutDashboard, Search, Package, ArrowRight, Layers, Hash } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Header = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  
  // --- ÉTATS POUR LA RECHERCHE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({ products: [], subcats: [], cats: [] });
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // 1. Gestion Session
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

  // 2. Moteur de Recherche (3 Tables + IMAGES)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.length < 2) {
        setResults({ products: [], subcats: [], cats: [] });
        return;
      }

      // Recherche Produits (Nom, Code + IMAGE)
      const { data: prodData } = await supabase
        .from('products')
        .select('id, name, product_code, subcategory_id, image_url') // On récupère l'image
        .or(`name.ilike.%${searchTerm}%,product_code.ilike.%${searchTerm}%`)
        .limit(5);

      // Recherche Sous-Catégories (+ IMAGE)
      const { data: subData } = await supabase
        .from('subcategories')
        .select('id, name, image_url') // On récupère l'image
        .ilike('name', `%${searchTerm}%`)
        .limit(3);

      // Recherche Catégories (+ IMAGE)
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name, image_url') // On récupère l'image
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
        
        {/* 1. LOGO (Gauche) */}
        <Link to="/" className="flex items-center gap-3 min-w-max">
          <div className="bg-slate-900 p-2 rounded shadow-sm">
             <span className="text-amber-500 font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight hidden lg:block">
            Soparimex
          </span>
           {session && (
            <span className="bg-amber-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full ml-1 hidden xl:block">
              ADMIN
            </span>
           )}
        </Link>

        {/* 2. NAVIGATION (Centre - RESTAURÉE) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 mx-4">
          <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium transition text-sm lg:text-base">Accueil</Link>
          <Link to="/categories" className="text-slate-600 hover:text-blue-600 font-medium transition text-sm lg:text-base">Catégories</Link>
          <Link to="/catalogues" className="text-slate-600 hover:text-blue-600 font-medium transition text-sm lg:text-base">Catalogues</Link>
          <Link to="/contact" className="text-slate-600 hover:text-blue-600 font-medium transition text-sm lg:text-base">Contact</Link>
        </nav>

        {/* 3. RECHERCHE & USER (Droite) */}
        <div className="flex items-center gap-3">
          
          {/* BARRE DE RECHERCHE (Plus petite) */}
          <div className="relative w-48 lg:w-64" ref={searchRef}>
            <div className="relative">
              <input 
                type="text"
                placeholder="Rechercher..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 pl-9 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition focus:w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            </div>

            {/* RÉSULTATS DÉROULANTS (Avec Images) */}
            {showResults && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden w-80 max-h-[80vh] overflow-y-auto z-50">
                
                {/* Catégories */}
                {results.cats.length > 0 && (
                  <div className="p-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase px-2 mb-1">Catégories</h4>
                    {results.cats.map(cat => (
                      <Link key={cat.id} to={`/categories/${cat.id}`} onClick={handleResultClick} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-slate-700">
                        {/* IMAGE CATEGORIE */}
                        <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                          {cat.image_url ? (
                            <img src={cat.image_url} alt="" className="w-full h-full object-cover"/>
                          ) : (
                            <Layers size={16} className="text-blue-500 m-auto mt-2"/>
                          )}
                        </div>
                        <span className="font-medium text-sm">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Sous-Catégories */}
                {results.subcats.length > 0 && (
                  <div className="p-2 border-t border-slate-50">
                    <h4 className="text-xs font-bold text-slate-400 uppercase px-2 mb-1">Sous-Catégories</h4>
                    {results.subcats.map(sub => (
                      <Link key={sub.id} to={`/products/${sub.id}`} onClick={handleResultClick} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-slate-700">
                        {/* IMAGE SOUS-CAT */}
                        <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                          {sub.image_url ? (
                            <img src={sub.image_url} alt="" className="w-full h-full object-cover"/>
                          ) : (
                            <ArrowRight size={16} className="text-slate-400 m-auto mt-2"/>
                          )}
                        </div>
                        <span className="font-medium text-sm">{sub.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Produits */}
                {results.products.length > 0 && (
                  <div className="p-2 border-t border-slate-50">
                    <h4 className="text-xs font-bold text-slate-400 uppercase px-2 mb-1">Produits</h4>
                    {results.products.map(prod => (
                      <Link key={prod.id} to={`/products/${prod.subcategory_id}`} onClick={handleResultClick} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-slate-700">
                         {/* IMAGE PRODUIT */}
                         <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                          {prod.image_url ? (
                            <img src={prod.image_url} alt="" className="w-full h-full object-cover"/>
                          ) : (
                            <Package size={16} className="text-slate-400 m-auto mt-2"/>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-slate-800 truncate">{prod.name}</div>
                          {prod.product_code && (
                             <div className="text-xs text-blue-600 flex items-center gap-1">
                               <Hash size={10}/> {prod.product_code}
                             </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BOUTONS ACTIONS */}
          <div className="flex items-center gap-2">
            {session ? (
              <>
                <Link to="/admin" className="hidden lg:flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition" title="Admin">
                  <LayoutDashboard size={20} />
                </Link>
                <Link to="/dashboard" className="hidden md:flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-700 rounded-lg hover:text-blue-600 transition" title="Compte">
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} className="flex items-center justify-center w-10 h-10 border border-slate-200 text-slate-700 rounded-lg hover:bg-red-50 hover:text-red-600" title="Déconnexion">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-md shadow-blue-100" title="Connexion">
                <LogIn size={20} />
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;