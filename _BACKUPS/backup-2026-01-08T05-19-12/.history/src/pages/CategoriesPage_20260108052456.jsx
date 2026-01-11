import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loader, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // On récupère les catégories depuis Supabase
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh]">
      <Loader className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-sans">
      {/* En-tête centré (Style exact de votre image) */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-blue-600 mb-4 tracking-tight">
          Nos Catégories
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
          Parcourez nos différentes catégories pour trouver les produits qui correspondent à vos besoins
        </p>
      </div>

      {/* Grille des catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            to={`/category/${category.id}`}
            className="group block bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Zone Image (Grise/Blanche comme sur l'image) */}
            <div className="h-64 bg-slate-50 relative overflow-hidden flex items-center justify-center p-8">
              {category.image_url ? (
                <img 
                  src={category.image_url} 
                  alt={category.name} 
                  className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                // Si pas d'image, on affiche les 2 premières lettres
                <div className="text-slate-200 font-black text-6xl uppercase opacity-30 select-none">
                  {category.name.substring(0, 2)}
                </div>
              )}
            </div>

            {/* Zone Titre et Flèche (Bas de la carte) */}
            <div className="p-6 flex justify-between items-center bg-white relative z-10">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">
                {category.name}
              </h3>
              
              {/* Bouton Flèche Bleue */}
              <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <ArrowRight size={20} strokeWidth={3} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Message si vide */}
      {categories.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
          <p className="text-slate-400 font-bold text-lg">Aucune catégorie disponible pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;