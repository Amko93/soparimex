import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader, ArrowLeft, Mail, Hash, Package } from 'lucide-react';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, subcategories(category_id)') 
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin text-blue-600" size={40}/></div>;
  if (!product) return <div className="p-10 text-center">Produit introuvable.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-sans min-h-screen">
      <Link 
        to={product.subcategory_id ? `/subcategory/${product.subcategory_id}` : '/categories'} 
        className="inline-flex items-center text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" /> Retour
      </Link>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[500px]">
        
        <div className="w-full md:w-1/2 bg-slate-50 p-10 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 relative">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain mix-blend-multiply max-h-[400px]" />
          ) : (
            <div className="text-slate-300 flex flex-col items-center">
              <Package size={80} />
              <span className="font-bold mt-4 uppercase">Pas d'image</span>
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
          
          {product.product_code && (
            <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider w-fit mb-4">
              <Hash size={12} /> Réf: {product.product_code}
            </span>
          )}

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase leading-tight mb-6">
            {product.name}
          </h1>

          <div className="w-20 h-1 bg-blue-600 rounded-full mb-8"></div>

          {/* ICI : ON AFFICHE LA DESCRIPTION DÉTAILLÉE (OU LA COURTE SI VIDE) */}
          <p className="text-slate-500 text-lg leading-relaxed mb-10 whitespace-pre-wrap">
            {product.long_description || product.description || "Aucune description disponible pour ce produit."}
          </p>

          <Link 
            to="/contact" 
            className="group w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg uppercase tracking-wide hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
          >
            <Mail className="group-hover:scale-110 transition-transform" />
            Nous contacter pour ce produit
          </Link>
          
          <p className="text-center text-slate-400 text-xs mt-4 font-medium">
            Réponse sous 24h garantie
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;