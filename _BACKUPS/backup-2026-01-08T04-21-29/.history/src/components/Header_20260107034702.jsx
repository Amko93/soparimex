import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; 
import { Search, User, LogIn } from 'lucide-react';

const Header = () => {
  const { texts, colors } = useTheme(); 

  return (
    <header 
      style={{ backgroundColor: colors.headerBg }} 
      className="border-b border-slate-100 sticky top-0 z-50 w-full font-sans transition-colors duration-300"
    >
      <div className="max-w-[1800px] mx-auto px-8 h-24 flex items-center justify-between">
        
        {/* Logo et Nom du site dynamique */}
        <Link to="/" className="flex items-center gap-4">
          <div className="bg-slate-900 p-2.5 rounded-lg shadow-md">
             <span className="text-amber-500 font-bold text-2xl">S</span>
          </div>
          <span 
            style={{ color: colors.headerText }} 
            className="text-2xl font-black tracking-tight italic"
          >
            {texts.siteName}
          </span>
        </Link>

        {/* Navigation principale */}
        <nav className="hidden xl:flex items-center gap-12 font-bold text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition-colors">Accueil</Link>
          <Link to="/categories" className="hover:text-blue-600 transition-colors">Catégories</Link>
          <Link to="/catalogues" className="hover:text-blue-600 transition-colors">Catalogues</Link>
          <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
        </nav>

        {/* Barre de recherche et Actions */}
        <div className="flex items-center gap-6">
          <div className="relative w-64 xl:w-80">
            <input 
              type="text"
              placeholder="Rechercher..."
              className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              style={{ backgroundColor: colors.primaryButton }} 
              className="px-8 py-3.5 text-white rounded-2xl font-black shadow-xl hover:opacity-90 transition-all flex items-center gap-2"
            >
              <LogIn size={18} />
              Connexion
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

// LA LIGNE CI-DESSOUS EST CELLE QUI MANQUAIT ET CAUSAIT LA PAGE BLANCHE
export default Header;