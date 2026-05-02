import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader, ArrowLeft, Mail, Phone, MessageSquare } from 'lucide-react';

const SubCategoryProductsPage = () => {
  const { id } = useParams();
  const [subcategory, setSubcategory] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: subData } = await supabase
          .from('subcategories')
          .select('*')
          .eq('id', id)
          .single();

        if (subData) {
          setSubcategory(subData);
          const { data: catData } = await supabase
            .from('categories')
            .select('*')
            .eq('id', subData.category_id)
            .single();
          setCategory(catData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center h-[50vh] items-center">
      <Loader className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (!subcategory) return (
    <div className="p-10 text-center font-bold text-slate-600">
      Sous-catégorie introuvable
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 font-sans min-h-screen">

      {/* Fil d'Ariane */}
      <div className="flex items-center gap-2 text-sm text-slate-400 font-medium mb-10">
        <Link to="/categories" className="hover:text-blue-600 transition-colors">Catégories</Link>
        <span>/</span>
        {category && (
          <>
            <Link to={`/category/${category.id}`} className="hover:text-blue-600 transition-colors">
              {category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-700 font-bold">{subcategory.name}</span>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">

        {/* Zone image */}
        <div className="bg-slate-50 flex items-center justify-center p-16 min-h-[320px]">
          {subcategory.image_url ? (
            <img
              src={subcategory.image_url}
              alt={subcategory.name}
              className="max-h-72 max-w-full object-contain mix-blend-multiply"
            />
          ) : (
            <div className="text-slate-200 font-black text-9xl uppercase select-none">
              {subcategory.name.substring(0, 2)}
            </div>
          )}
        </div>

        {/* Zone texte + CTA */}
        <div className="p-10 md:p-16 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight mb-6">
            {subcategory.name}
          </h1>

          <p className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Vous êtes intéressé par nos produits <span className="font-bold text-slate-700">{subcategory.name.toLowerCase()}</span> ?
            <br className="hidden md:block" />
            Contactez-nous pour recevoir une offre personnalisée, des fiches techniques ou un devis sur mesure.
          </p>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-3 bg-blue-800 hover:bg-blue-900 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5"
            >
              <MessageSquare size={20} />
              Faire une demande
            </Link>
            <a
              href="mailto:contact@soparimex.com"
              className="inline-flex items-center justify-center gap-3 border-2 border-blue-800 text-blue-800 hover:bg-blue-50 font-bold px-8 py-4 rounded-2xl text-base transition-all"
            >
              <Mail size={20} />
              Envoyer un email
            </a>
          </div>
        </div>
      </div>

      {/* Bloc info bas de page */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Phone size={22} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-800 text-base">Besoin d'une réponse rapide ?</p>
          <p className="text-slate-500 text-sm mt-0.5">
            Nous sourceons et négocions directement auprès des fournisseurs — livraison directe, sans stock intermédiaire.
          </p>
        </div>
      </div>

      {/* Retour */}
      <div className="mt-8">
        <Link
          to={category ? `/category/${category.id}` : '/categories'}
          className="inline-flex items-center text-slate-500 hover:text-blue-600 font-bold transition-colors gap-2"
        >
          <ArrowLeft size={18} />
          Retour à {category ? category.name : 'toutes les catégories'}
        </Link>
      </div>
    </div>
  );
};

export default SubCategoryProductsPage;
