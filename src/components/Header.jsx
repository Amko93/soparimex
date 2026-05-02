import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; 
import { Search, User, LogIn, LogOut, LayoutDashboard, X, Loader, Package, Menu, ShoppingBag, ClipboardList, FileText, Mail } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useSelection } from '../context/SelectionContext';

const Header = () => {
  const { texts, colors } = useTheme();
  const { selectedItems } = useSelection();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('client');
  
  // --- ÉTATS RECHERCHE & MENU ---
  const [searchTerm, setSearchTerm] = useState('');
  const [liveResults, setLiveResults] = useState([]); 
  const [isSearching, setIsSearching] = useState(false); 
  const [showDropdown, setShowDropdown] = useState(false); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Nouvel état pour le menu mobile
  const searchRef = useRef(null);

  const fetchRole = async (userId) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (data) setUserRole(data.role);
  };

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
          .limit(5);

        if (!error) {
          setLiveResults(data || []);
        }
        setIsSearching(false);
      } else {
        setLiveResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      setShowDropdown(false); 
      setIsMobileMenuOpen(false);
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
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between">
        
        {/* --- LOGO --- */}
        <Link to="/" className="flex items-center gap-2 md:gap-4 z-50">
          <div className="bg-slate-900 p-2 md:p-2.5 rounded-lg shadow-md">
             <span className="text-amber-500 font-bold text-xl md:text-2xl">S</span>
          </div>
          <span style={{ color: colors.headerText }} className="text-xl md:text-2xl font-black tracking-tight italic">
            {texts.siteName}
          </span>
        </Link>

        {/* --- NAVIGATION DESKTOP (Caché sur mobile) --- */}
        <nav className="hidden md:flex items-center gap-12 font-bold text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition-colors">Accueil</Link>
          <Link to="/categories" className="hover:text-blue-600 transition-colors">Catégories</Link>
          <Link to="/catalogues" className="hover:text-blue-600 transition-colors">Catalogues</Link>
          <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
        </nav>

        {/* --- ACTIONS DESKTOP (Recherche + User) --- */}
        <div className="hidden md:flex items-center gap-6">
          {/* BARRE DE RECHERCHE */}
          <div className="relative w-96" ref={searchRef}>
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
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isSearching ? (
                  <Loader size={16} className="animate-spin text-blue-500" />
                ) : searchTerm ? (
                  <button onClick={clearSearch}><X size={16} className="text-slate-400 hover:text-red-500 transition"/></button>
                ) : null}
              </div>
            </div>

            {/* Dropdown Desktop */}
            {showDropdown && (
              <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                {liveResults.length > 0 ? (
                  <ul>
                    {liveResults.map((prod) => (
                      <li key={prod.id}>
                        <Link 
                          to={`/product/${prod.id}`} 
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-4 p-3 hover:bg-slate-50 transition border-b border-slate-50"
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
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-slate-400 text-sm">Aucun produit trouvé.</div>
                )}
              </div>
            )}
          </div>

          {/* BOUTONS USER */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                {(userRole === 'admin' || userRole === 'developpeur') && (
                  <Link to="/admin" className="p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg" title="Dashboard">
                    <LayoutDashboard size={20} />
                  </Link>
                )}
                {(userRole === 'admin' || userRole === 'developpeur' || userRole === 'commercial') && (
                  <Link to="/admin/leads" className="p-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all" title="Demandes clients">
                    <ClipboardList size={20} />
                  </Link>
                )}
                {(userRole === 'admin' || userRole === 'developpeur' || userRole === 'commercial') && (
                  <Link to="/admin/messages" className="p-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-all" title="Messages contact">
                    <Mail size={20} />
                  </Link>
                )}
                {(userRole === 'client' || userRole === 'admin' || userRole === 'developpeur' || userRole === 'commercial') && (
                  <Link to="/mes-demandes" className="p-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all" title="Mes demandes">
                    <FileText size={20} />
                  </Link>
                )}
                <Link to="/selection" className="p-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all relative" title="Ma sélection">
                  <ShoppingBag size={20} />
                  {selectedItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold rounded-full px-1">
                      {selectedItems.length > 99 ? '99+' : selectedItems.length}
                    </span>
                  )}
                </Link>
                <Link to="/dashboard" className="p-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all">
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} className="p-3.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 border border-red-100 transition-all">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link to="/login" style={{ backgroundColor: colors.primaryButton }} className="px-6 py-3.5 text-white rounded-2xl font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm">
                <LogIn size={18} />
                <span>Connexion</span>
              </Link>
            )}
          </div>
        </div>

        {/* --- MENU MOBILE HAMBURGER (Visible uniquement sur mobile) --- */}
        <button 
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* --- MENU MOBILE PLEIN ÉCRAN --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white overflow-y-auto">
          {/* Bouton Fermer en haut à droite */}
          <div className="flex justify-end p-4 border-b border-slate-100">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Fermer le menu"
            >
              <X size={28} />
            </button>
          </div>

          {/* Contenu du menu */}
          <div className="flex flex-col p-6 gap-6">
            {/* Recherche Mobile */}
            <div className="relative w-full" ref={searchRef}>
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchSubmit}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              
              {/* Dropdown Mobile */}
              {showDropdown && (
                <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                  {liveResults.length > 0 ? (
                    <ul>
                      {liveResults.map((prod) => (
                        <li key={prod.id}>
                          <Link 
                            to={`/product/${prod.id}`} 
                            onClick={() => {
                              setShowDropdown(false);
                              setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center gap-4 p-3 hover:bg-slate-50 transition border-b border-slate-50"
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
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-sm">Aucun produit trouvé.</div>
                  )}
                </div>
              )}
            </div>

            {/* Liens de navigation empilés verticalement */}
            <nav className="flex flex-col gap-4 text-lg font-bold text-slate-600">
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="py-3 hover:text-blue-600 transition-colors border-b border-slate-100"
              >
                Accueil
              </Link>
              <Link 
                to="/categories" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="py-3 hover:text-blue-600 transition-colors border-b border-slate-100"
              >
                Catégories
              </Link>
              <Link 
                to="/catalogues" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="py-3 hover:text-blue-600 transition-colors border-b border-slate-100"
              >
                Catalogues
              </Link>
              <Link 
                to="/contact" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="py-3 hover:text-blue-600 transition-colors border-b border-slate-100"
              >
                Contact
              </Link>
            </nav>

            {/* Séparateur */}
            <div className="h-px bg-slate-200 w-full my-2"></div>

            {/* Boutons Auth selon l'état de session */}
            <div className="flex flex-col gap-3">
              {session ? (
                <>
                  {(userRole === 'client' || userRole === 'admin' || userRole === 'developpeur' || userRole === 'commercial') && (
                    <Link 
                      to="/mes-demandes" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <FileText size={20} /> Mes demandes
                    </Link>
                  )}
                  <Link 
                    to="/selection" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <ShoppingBag size={20} /> Ma sélection {selectedItems.length > 0 && `(${selectedItems.length})`}
                  </Link>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <User size={20} /> Mon Compte
                  </Link>
                  {(userRole === 'admin' || userRole === 'developpeur') && (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="flex items-center gap-3 p-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
                    >
                      <LayoutDashboard size={20} /> Administration
                    </Link>
                  )}
                  {(userRole === 'admin' || userRole === 'developpeur' || userRole === 'commercial') && (
                    <Link
                      to="/admin/leads"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                    >
                      <ClipboardList size={20} /> Demandes clients
                    </Link>
                  )}
                  {(userRole === 'admin' || userRole === 'developpeur' || userRole === 'commercial') && (
                    <Link
                      to="/admin/messages"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    >
                      <Mail size={20} /> Messages contact
                    </Link>
                  )}
                  <button
                    onClick={handleLogout} 
                    className="flex items-center gap-3 p-4 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-colors text-left"
                  >
                    <LogOut size={20} /> Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    style={{ backgroundColor: colors.primaryButton }} 
                    className="w-full py-4 text-white rounded-xl font-black text-center shadow-lg hover:shadow-xl transition-all"
                  >
                    Se connecter
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-black text-center hover:bg-slate-50 transition-all"
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;