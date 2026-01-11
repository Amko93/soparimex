import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; 
import { Search, User, LogIn, LogOut, LayoutDashboard, X, Loader, Package } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Header = () => {
  const { texts, colors } = useTheme();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('client');
  
  // --- ÉTATS RECHERCHE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [liveResults, setLiveResults] = useState([]); // Résultats instantanés
  const [isSearching, setIsSearching] = useState(false); // Indicateur de chargement
  const [showDropdown, setShowDropdown] = useState(false); // Afficher/Cacher le menu
  const searchRef = useRef(null); // Pour détecter le clic en dehors

  useEffect(() => {
    // Gestion Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
      else setUserRole('client');
    });

    // Gestion Clic en dehors pour fermer la recherche
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- LOGIQUE LIVE SEARCH ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 2) {
        setIsSearching(true);
        setShowDropdown(true);
        
        const { data, error } = await supabase
          .from('products')
          .select('id, name, image_url, product_code')
          .or(`name.ilike.%${searchTerm}%,product_code.ilike.%${searchTerm}%`)
          .limit(5); // On limite à 5 résultats pour le menu rapide

        if (!error) {
          setLiveResults(data || []);
        }
        setIsSearching(false);
      } else {
        setLiveResults([]);
        setShowDropdown(false);
      }
    }, 300); // On attend 300ms après la frappe pour ne pas surcharger la base

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchRole = async (userId) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (data) setUserRole(data.role);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      setShowDropdown(false); // On ferme le menu rapide
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setLiveResults([]);
    setShowDropdown(false);
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
          
          {/* --- BARRE DE RECHERCHE LIVE --- */}
          <div className="relative w-64 xl:w-96" ref={searchRef}>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Rechercher (ex: visseuse...)" 
                className="w-full bg-slate-50 border border-slate-200 pl-11 pr-10 py-3 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm focus:bg-white" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchSubmit}
                onFocus={() => { if(searchTerm.length > 2) setShowDropdown(true); }}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              
              {/* Bouton croix ou loader */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isSearching ? (
                  <Loader size={16} className="animate-spin text-blue-500" />
                ) : searchTerm ? (
                  <button onClick={clearSearch}><X size={16} className="text-slate-400 hover:text-red-500 transition"/></button>
                ) : null}
              </div>
            </div>

            {/* --- DROPDOWN RÉSULTATS RAPIDES --- */}
            {showDropdown && (
              <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                {liveResults.length > 0 ? (
                  <ul>
                    {liveResults.map((prod) => (
                      <li key={prod.id}>
                        <Link 
                          to={`/product/${prod.id}`} 
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-4 p-3 hover:bg-slate-50 transition border-b border-slate-50 last:border-0"
                        >
                          <div className="w-10 h-10 bg-white rounded-lg border border-slate-100 flex items-center justify-center p-1">
                            {prod.image_url ? (
                              <img src={prod.image_url} alt="" className="w-full h-full object-contain mix-blend-multiply"/>
                            ) : (
                              <Package size={16} className="text-slate-300"/>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{prod.name}</p>
                            {prod.product_code && <p className="text-[10px] text-blue-500 font-bold">{prod.product_code}</p>}
                          </div>
                        </Link>
                      </li>
                    ))}
                    <li className="p-2">
                       <button 
                         onClick={() => { setShowDropdown(false); navigate(`/search?q=${encodeURIComponent(searchTerm)}`); }}
                         className="w-full py-2 text-xs font-bold text-blue-600 text-center hover:bg-blue-50 rounded-xl transition"
                       >
                         Voir tous les résultats
                       </button>
                    </li>
                  </ul>
                ) : (
                  <div className="p-4 text-center text-slate-400 text-sm">
                    Aucun produit trouvé.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Boutons User */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                {(userRole === 'admin' || userRole === 'developpeur') && (
                  <Link to="/admin" className="p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">
                    <LayoutDashboard size={20} />
                  </Link>
                )}
                <Link to="/dashboard" className="p-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
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
                className="px-6 py-3.5 text-white rounded-2xl font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm"
              >
                <LogIn size={18} />
                <span className="hidden lg:inline">Connexion</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;