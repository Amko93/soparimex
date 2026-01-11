import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, User, LayoutDashboard, Search, ArrowRight, Layers, Hash, Package } from 'lucide-react';
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
      <div className="max-w-[1600px] mx-auto px-6 h-24 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-4 flex-shrink-0">
          <div className="bg-slate-900 p-2.5 rounded-lg shadow-md">
             <span className="text-amber-500 font-bold text-2xl">S</span>
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tight">Soparimex</span>
        </Link>

        {/* NAVIGATION CENTRALE (Aérée) */}
        <nav className="hidden lg:flex items-center gap-10">
          <Link to="/" className="text-slate-500 hover:text-blue-600 font-semibold transition-colors">Accueil</Link>
          <Link to="/categories" className="text-slate-500 hover:text-blue-600 font-semibold transition-colors">Catégories</Link>
          <Link to="/catalogues" className="text-slate-600 hover:text-blue-600 font-semibold transition-colors">Catalogues</Link>
          <Link to="/contact" className="text-slate-600 hover:text-blue-600 font-semibold transition-colors">Contact</Link>
        </nav>

        {/* BLOC RECHERCHE ET ACTIONS */}
        <div className="flex items-center gap-6">
          
          {/* BARRE DE RECHERCHE */}
          <div className="relative w-72 xl:w-96" ref={searchRef}>
            <div className="relative group">
              <input 
                type="text"
                placeholder="Rechercher un produit..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            </div>

            {/* RÉSULTATS (Bien attachés et larges) */}
            {showResults && (
              <div className="absolute top-[calc(100%+8px)] right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden w-full min-w-[320px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-[70vh] overflow-y-auto p-3 space-y-4">
                  
                  {/* Catégories */}
                  {results.cats.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Catégories</h4>
                      {results.cats.map(cat => (
                        <Link key={cat.id} to={`/categories/${cat.id}`} onClick={() => {setShowResults(false); setSearchTerm('');}} className="flex items-center gap-3 p-2.5 hover:bg-blue-50 rounded-xl transition-colors group">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                            {cat.image_url ? <img src={cat.image_url} className="w-full h-full object-cover" alt=""/> : <Layers size={18} className="text-blue-500 m-auto h-full w-fit flex items-center"/>}
                          </div>
                          <span className="font-semibold text-sm text-slate-700 group-hover:text-blue-700">{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Sous-Catégories */}
                  {results.subcats.length > 0 && (
                    <div className="pt-2 border-t border-slate-50">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Sous-Catégories</h4>
                      {results.subcats.map(sub => (
                        <Link key={sub.id} to={`/products/${sub.id}`} onClick={() => {setShowResults(false); setSearchTerm('');}} className="flex items-center gap-3 p-2.5 hover:bg-blue-50 rounded-xl transition-colors group">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                            {sub.image_url ? <img src={sub.image_url} className="w-full h-full object-cover" alt=""/> : <ArrowRight size={18} className="text-slate-400 m-auto h-full w-fit flex items-center"/>}
                          </div>
                          <span className="font-semibold text-sm text-slate-700 group-hover:text-blue-700">{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Produits */}
                  {results.products.length > 0 && (
                    <div className="pt-2 border-t border-slate-50">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Produits</h4>
                      {results.products.map(prod => (
                        <Link key={prod.id} to={`/products/${prod.subcategory_id}`} onClick={() => {setShowResults(false); setSearchTerm('');}} className="flex items-center gap-3 p-2.5 hover:bg-blue-50 rounded-xl transition-colors group">
                           <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-slate-200 p-1">
                            {prod.image_url ? <img src={prod.image_url} className="w-full h-full object-contain" alt=""/> : <Package size={18} className="text-slate-400 m-auto h-full w-fit flex items-center"/>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-slate-800 truncate group-hover:text-blue-700">{prod.name}</div>
                            {prod.product_code && <div className="text-[11px] text-blue-600 font-mono">#{prod.product_code}</div>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {results.cats.length === 0 && results.subcats.length === 0 && results.products.length === 0 && (
                      <div className="p-6 text-center text-sm text-slate-400">Aucun résultat trouvé</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ACTIONS UTILISATEUR */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
            {session ? (
              <>
                <Link to="/admin" className="w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100" title="Admin">
                  <LayoutDashboard size={20} />
                </Link>
                <Link to="/dashboard" className="w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100" title="Compte">
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} className="w-11 h-11 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all border border-red-100">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link to="/login" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200 text-sm">
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