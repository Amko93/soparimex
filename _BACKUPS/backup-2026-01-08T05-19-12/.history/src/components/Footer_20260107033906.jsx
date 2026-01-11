import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    /* Utilisation de la variable --footer-bg */
    <footer style={{ backgroundColor: 'var(--footer-bg)' }} className="text-white py-16 transition-colors duration-300">
      <div className="max-w-[1800px] mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-lg">
               <span className="text-slate-900 font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-black tracking-tight italic">Soparimex</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Votre partenaire de confiance pour la fourniture industrielle.
          </p>
        </div>

        <div>
          <h4 className="font-black uppercase text-xs tracking-widest mb-6">Navigation</h4>
          <ul className="space-y-4 text-slate-400 font-bold text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
            <li><Link to="/categories" className="hover:text-white transition-colors">Catégories</Link></li>
            <li><Link to="/catalogues" className="hover:text-white transition-colors">Catalogues</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-black uppercase text-xs tracking-widest mb-6">Légal</h4>
          <ul className="space-y-4 text-slate-400 font-bold text-sm">
            <li><Link to="/mentions" className="hover:text-white transition-colors">Mentions légales</Link></li>
            <li><Link to="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-black uppercase text-xs tracking-widest mb-6">Contact</h4>
          <ul className="space-y-4 text-slate-400 font-bold text-sm">
            <li>formulaire@soparimex.com</li>
            <li>+33 1 23 45 67 88</li>
          </ul>
        </div>

      </div>
      <div className="max-w-[1800px] mx-auto px-8 mt-16 pt-8 border-t border-white/10 text-center text-slate-500 text-xs font-bold">
        © 2026 Soparimex. Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;