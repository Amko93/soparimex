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
    
    // Fermer la recherche si on clique ailleurs
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

  // 2. Moteur de Recherche (3 Tables en même temps)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.length < 2) {
        setResults({ products: [], subcats: [], cats: [] });
        return;
      }

      // Recherche Produits (Nom ou Code)
      const { data: prodData } = await supabase
        .from('products')
        .select('id, name, product_code, subcategory_id')
        .or(`name.ilike.%${searchTerm}%,product_code.ilike.%${searchTerm}%`)
        .limit(5);

      // Recherche Sous-Catégories
      const { data: subData } = await supabase
        .from('subcategories')
        .select('id, name')
        .ilike('name', `%${searchTerm}%`)
        .limit(3);

      // Recherche Catégories
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('name', `%${searchTerm}%`)
        .limit(3);

      setResults({
        products: prodData || [],
        subcats: subData || [],
        cats: catData || []
      });
      setShowResults(true);
    }, 300); // Petit délai pour ne pas surcharger la base

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Fonction pour vider la recherche après un clic
  const handleResultClick = () => {
    setShowResults(false);
    setSearchTerm('');
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-8">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 min-w-max">
          <div className="bg-slate-900 p-2 rounded shadow-sm">
             <span className="text-amber-500 font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight hidden md:block">
            Soparimex
          </span>
           {session && (
            <span className="bg-amber-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full ml-1 hidden lg:block">
              ADMIN
            </span>
           )}
        </Link>

        {/* BARRE DE RECHERCHE CENTRALE */}
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <div className="relative">
            <input 
              type="text"
              placeholder="Rechercher un produit, une référence, une catégorie..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          </div>

          {/* RÉSULTATS DÉROULANTS */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden max-h-[80vh] overflow-y-auto">
              
              {/* 1. Résultats Catégories */}
              {results.cats.length > 0 && (
                <div className="p-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase px-2 mb-1">Catégories</h4>
                  {results.cats.map(cat => (
                    <Link key={cat.id} to={`/categories/${cat.id}`} onClick={handleResultClick} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-slate-700">
                      <Layers size={16} className="text-blue-500"/>
                      <span className="font-medium">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* 2. Résultats Sous-Catégories */}
              {results.subcats.length > 0 && (
                <div className="p-2 border-t border-slate-50">
                  <h4 className="text-xs font-bold text-slate-400 uppercase px-2 mb-1">Sous-Catégories</h4>
                  {results.subcats.map(sub => (
                    <Link key={sub.id} to={`/products/${sub.id}`} onClick={handleResultClick} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-slate-700">
                      <ArrowRight size={16} className="text-slate-400"/>
                      <span>{sub.name}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* 3. Résultats Produits */}
              {results.products.length > 0 && (
                <div className="p-2 border-t border-slate-50">
                  <h4 className="text-xs font-bold text-slate-400 uppercase px-2 mb-1">Produits</h4>
                  {results.products.map(prod => (
                    <div key={prod.id} className="p-2 hover:bg-slate-50 rounded-lg cursor-default">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-800">{prod.name}</div>
                          {prod.product_code && (
                             <div className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                               <Hash size={10}/> {prod.product_code}
                             </div>
                          )}
                        </div>
                        {/* Lien pour aller voir la catégorie du produit */}
                        <Link to={`/products/${prod.subcategory_id}`} onClick={handleResultClick} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 hover:bg-blue-100 hover:text-blue-600">
                          Voir
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Aucun résultat */}
              {results.cats.length === 0 && results.subcats.length === 0 && results.products.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  Aucun résultat trouvé pour "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* NAVIGATION DROITE */}
        <div className="flex items-center gap-4 min-w-max">
          {session ? (
            <>
              <Link to="/admin" className="hidden lg:flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition">
                <LayoutDashboard size={18} /> <span className="hidden xl:inline">Admin</span>
              </Link>
              <Link to="/dashboard" className="hidden md:flex items-center gap-2 text-slate-700 font-medium hover:text-blue-600 transition">
                <User size={18} /> <span className="hidden xl:inline">Compte</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden md:flex items-center gap-2 text-slate-700 font-medium hover:text-blue-600 transition">
                <LogIn size={18} /> Connexion
              </Link>
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-md shadow-blue-100">
                <UserPlus size={18} /> <span className="hidden md:inline">Inscription</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;