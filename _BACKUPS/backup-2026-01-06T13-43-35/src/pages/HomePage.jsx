import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, FileText, Wrench, Truck } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="bg-white">
      
      {/* 1. HERO SECTION (Bannière du haut) */}
      <section className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Votre partenaire expert en <br/>
            <span className="text-blue-500">solutions industrielles</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Soparimex accompagne les professionnels avec une large gamme de produits de plomberie et d'équipements industriels de haute qualité.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/categories" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold transition flex items-center justify-center gap-2">
              Voir nos produits <ArrowRight size={20} />
            </Link>
            <Link to="/contact" className="bg-transparent border border-slate-600 hover:bg-slate-800 text-white px-8 py-4 rounded-lg font-bold transition">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SECTION L'EXPERTISE SOPARIMEX */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Texte d'introduction */}
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">L'expertise Soparimex</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Depuis notre création, nous nous efforçons de fournir aux entreprises les meilleurs équipements du marché. Notre force réside dans notre capacité à sélectionner des produits durables et performants.
              </p>
              <p>
                Que vous soyez dans le bâtiment, l'industrie ou la maintenance, nos équipes sont là pour vous conseiller et vous fournir les solutions adaptées à vos chantiers.
              </p>
            </div>
          </div>
          
          {/* Photo (Image d'illustration industrielle) */}
          <div className="relative hidden md:block">
            <div className="absolute -inset-4 bg-blue-100 rounded-xl transform rotate-2"></div>
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800" 
              alt="Entrepôt industriel" 
              className="relative rounded-xl shadow-lg w-full h-80 object-cover"
            />
          </div>
        </div>

        {/* LES 3 CARTES (Nouvelle section) */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Carte 1 : Vaste Catalogue */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-6 bg-blue-50">
              <Package size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Vaste Catalogue de Produits</h3>
            <p className="text-slate-500 leading-relaxed">
              Explorez des milliers de références en visserie, boulonnerie, outillage et bien plus.
            </p>
          </div>

          {/* Carte 2 : Solutions sur Mesure */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-green-600 mb-6 bg-green-50">
              <Wrench size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Solutions sur Mesure</h3>
            <p className="text-slate-500 leading-relaxed">
              Nous trouvons des solutions adaptées à vos besoins spécifiques, même pour les demandes les plus exigeantes.
            </p>
          </div>

          {/* Carte 3 : Logistique Efficace */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-orange-600 mb-6 bg-orange-50">
              <Truck size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Logistique Efficace</h3>
            <p className="text-slate-500 leading-relaxed">
              Bénéficiez d'une livraison rapide et fiable pour maintenir votre productivité sans interruption.
            </p>
          </div>
        </div>
      </section>

      {/* 3. ACCÈS RAPIDE (Catégories & Catalogues) */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Accès Rapide</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Carte Catégories */}
            <Link to="/categories" className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
              <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition">
                <Package size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Nos Catégories</h3>
              <p className="text-slate-500 mb-6">
                Explorez notre large gamme de produits : robinetterie, tuyauterie, vannes et équipements spécialisés.
              </p>
              <span className="text-blue-600 font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                Parcourir le catalogue <ArrowRight size={18} />
              </span>
            </Link>

            {/* Carte Catalogues */}
            <Link to="/catalogues" className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
              <div className="bg-indigo-100 w-16 h-16 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition">
                <FileText size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Nos Catalogues PDF</h3>
              <p className="text-slate-500 mb-6">
                Téléchargez nos brochures complètes et fiches techniques pour consulter nos références hors ligne.
              </p>
              <span className="text-indigo-600 font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                Voir les documents <ArrowRight size={18} />
              </span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;