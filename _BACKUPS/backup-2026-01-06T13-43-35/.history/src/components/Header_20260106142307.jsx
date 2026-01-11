import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, Building2 } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* PARTIE GAUCHE : LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          {/* Simulation du logo carré sombre de ta photo */}
          <div className="bg-slate-900 text-amber-500 p-2 rounded shadow-sm group-hover:bg-blue-700 transition">
            <Building2 size={24} />
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight">
            Soparimex
          </span>
        </Link>

        {/* PARTIE CENTRALE : NAVIGATION */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium transition">
            Accueil
          </Link>
          <Link to="/categories" className="text-slate-600 hover:text-blue-600 font-medium transition">
            Catégories
          </Link>
          <Link to="/catalogues" className="text-slate-600 hover:text-blue-600 font-medium transition">
            Catalogues
          </Link>
          <Link to="/contact" className="text-slate-600 hover:text-blue-600 font-medium transition">
            Contact
          </Link>
        </nav>

        {/* PARTIE DROITE : BOUTONS */}
        <div className="flex items-center gap-6">
          {/* Bouton Connexion */}
          <Link 
            to="/login" 
            className="hidden md:flex items-center gap-2 text-slate-700 font-medium hover:text-blue-600 transition"
          >
            <LogIn size={18} />
            <span>Connexion</span>
          </Link>

          {/* Bouton Inscription (Bleu) */}
          <Link 
            to="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-medium transition flex items-center gap-2 shadow-md shadow-blue-100"
          >
            <UserPlus size={18} />
            <span>Inscription</span>
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Header;