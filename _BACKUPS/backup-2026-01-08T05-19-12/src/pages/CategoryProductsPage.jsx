import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader, ArrowLeft, PackageX } from 'lucide-react';

const CategoryProductsPage = () => {
  const { id } = useParams(); // On récupère l'ID depuis l'URL
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryDetails();
  }, [id]);

  const fetchCategoryDetails = async () => {
    setLoading(true);
    try {
      // 1. Récupérer les infos de la catégorie (Nom, Image)
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (catError) throw catError;
      setCategory(catData);

      // 2. Récupérer les produits de cette catégorie (Table 'products' à créer plus tard si inexistante)
      // Pour l'instant, on suppose que la table existe ou on gère l'erreur silencieusement
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', id);

      setProducts(prodData || []);

    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <Loader className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (!category) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-slate-700">Catégorie introuvable</h2>
      <Link to="/categories" className="text-blue-600 hover:underline mt-4 block">Retour aux catégories</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-sans min-h-screen">
      {/* Bouton Retour */}
      <Link to="/categories" className="inline-flex items-center text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        Retour aux catégories
      </Link>

      {/* En-tête de la catégorie */}
      <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 mb-12 flex flex-col md:flex-row items-center gap-8">
        {/* Image de la catégorie en petit */}
        <div className="w-32 h-32 bg-slate-50 rounded-2xl flex items-center justify-center p-4 border border-slate-100">
           {category.image_url ? (
             <img src={category.image_url} alt={category.name} className="w-full h-full object-contain mix-blend-multiply" />
           ) : (
             <span className="text-2xl font-black text-slate-200 uppercase">{category.name.substring(0, 2)}</span>
           )}
        </div>
        
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-2">
            {category.name}
          </h1>
          <p className="text-slate-500 font-medium">
            Découvrez tous les produits de la gamme {category.name.toLowerCase()}.
          </p>
        </div>
      </div>

      {/* Liste des produits (Vide pour l'instant) */}
      <div className="min-h-[200px]">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ici on affichera les produits plus tard */}
            {products.map(product => (
              <div key={product.id}>{product.name}</div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
              <PackageX size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun produit pour le moment</h3>
            <p className="text-slate-400">Les produits de cette catégorie seront ajoutés prochainement.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsPage;