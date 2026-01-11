import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader, Package, Search, Hash } from 'lucide-react';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q'); // Récupère le mot tapé dans l'URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      // Recherche insensible à la casse (%query%)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`); 

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-sans min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Résultats de recherche</h1>
        <p className="text-slate-500">
          Pour : <span className="font-bold text-blue-600">"{query}"</span>
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center mt-20"><Loader className="animate-spin text-blue-600" size={40}/></div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((prod) => (
            <div key={prod.id} className="group relative bg-white rounded-3xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all overflow-hidden flex flex-col">
              
              <div className="h-48 bg-white p-6 flex items-center justify-center relative overflow-hidden">
                {prod.image_url ? (
                  <img src={prod.image_url} alt={prod.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <Package size={48} className="text-slate-200" />
                )}
              </div>

              <div className="p-5 flex flex-col flex-grow bg-slate-50 border-t border-slate-100">
                {prod.product_code && (
                  <div className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Hash size={10} /> Réf: {prod.product_code}
                  </div>
                )}
                
                <h3 className="text-lg font-black text-slate-800 uppercase leading-tight mb-2">{prod.name}</h3>
                <p className="text-sm text-slate-500 font-medium line-clamp-2">{prod.description || "Pas de description"}</p>
                
                <Link 
                  to={`/product/${prod.id}`}
                  className="mt-4 w-full py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors block text-center"
                >
                  VOIR LE PRODUIT
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
          <Search size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700">Aucun résultat trouvé</h3>
          <p className="text-slate-400">Essayez avec un autre mot-clé.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;