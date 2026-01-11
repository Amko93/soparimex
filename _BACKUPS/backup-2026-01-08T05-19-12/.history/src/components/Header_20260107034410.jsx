import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; // <--- Import du hook

const Header = () => {
  const { texts, colors } = useTheme(); // <--- On récupère textes et couleurs

  return (
    <header style={{ backgroundColor: colors.headerBg }} className="border-b transition-colors h-24 flex items-center px-8">
      <Link to="/" className="flex items-center gap-4">
        <div className="bg-slate-900 p-2 rounded-lg">
           <span className="text-amber-500 font-bold text-2xl">S</span>
        </div>
        {/* Le texte devient dynamique ici ! */}
        <span style={{ color: colors.headerText }} className="text-2xl font-black italic">
          {texts.siteName} 
        </span>
      </Link>
      
      {/* ... reste du code ... */}
    </header>
  );
};