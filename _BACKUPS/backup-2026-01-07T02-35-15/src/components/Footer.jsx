import React from 'react';
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Grille des 4 colonnes */}
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          
          {/* Colonne 1 : Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white mb-4">
              <Building2 size={24} className="text-blue-400"/>
              <span className="text-xl font-bold">Soparimex</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Votre partenaire de confiance pour la fourniture industrielle.
            </p>
          </div>

          {/* Colonne 2 : Navigation */}
          <div>
            <h4 className="text-white font-bold mb-6">Navigation</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-white transition">Accueil</Link></li>
              <li><Link to="/categories" className="hover:text-white transition">Catégories</Link></li>
              <li><Link to="/catalogues" className="hover:text-white transition">Catalogues</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          {/* Colonne 3 : Légal */}
          <div>
            <h4 className="text-white font-bold mb-6">Légal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="#" className="hover:text-white transition">Mentions légales</Link></li>
              <li><Link to="#" className="hover:text-white transition">Politique de confidentialité</Link></li>
            </ul>
          </div>

          {/* Colonne 4 : Contact */}
          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:formulaire@soparimex.com" className="hover:text-white transition">
                  formulaire@soparimex.com
                </a>
              </li>
              <li>
                <a href="tel:+33123456788" className="hover:text-white transition">
                  +33 1 23 45 67 88
                </a>
              </li>
            </ul>
          </div>

        </div>
        
        {/* Ligne de copyright bas */}
        <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
          © 2026 Soparimex. Tous droits réservés.
        </div>

      </div>
    </footer>
  );
};

export default Footer;