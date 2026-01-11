import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Plus, X, Loader, Pencil, ArrowLeft, Package, Hash } from 'lucide-react';

const ProductsPage = () => {
  const { subcategoryId } = useParams();
  const [products, setProducts] = useState([]);
  
  // On stocke les infos de la Sous-Catégorie ET de la Catégorie Parente
  const [subCategoryInfo, setSubCategoryInfo] = useState(null);
  const [parentCategoryName, setParentCategoryName] = useState('Catégories'); // Par défaut
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal & Édition
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    product_code: '',
    image: null
  });

  useEffect(() => {
    fetchData();
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, [subcategoryId]);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Info de la Sous-Catégorie actuelle
    const { data: subData, error: subError } = await supabase
      .from('subcategories')
      .select('name, category_id')
      .eq('id', subcategoryId)
      .single();
    
    if (subData) {
      setSubCategoryInfo(subData);

      // 2. Info de la Grande Catégorie (pour le bouton retour)
      const { data: catData } = await supabase
        .from('categories')
        .select('name')
        .eq('id', subData.category_id)
        .single();
      
      if (catData) setParentCategoryName(catData.name);
    }

    // 3. Liste des Produits
    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('subcategory_id', subcategoryId)
      .order('created_at', { ascending: true });

    if (prodError) console.error(prodError);
    else setProducts(prodData);
    
    setLoading(false);
  };

  // --- GESTION DU FORMULAIRE ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', product_code: '', image: null });
    setShowModal(true);
  };

  const openEditModal = (e, prod) => {
    e.preventDefault();
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description || '',
      product_code: prod.product_code || '',
      image: null
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setUploading(true);

    let finalImageUrl = editingProduct ? editingProduct.image_url : null;

    if (formData.image) {
      try {
        const fileExt = formData.image.name.split('.').pop();
        const sanitizedName = formData.image.name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${Date.now()}_${sanitizedName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, formData.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(fileName);
        
        finalImageUrl = publicUrl;
      } catch (error) {
        alert("Erreur upload : " + error.message);
        setUploading(false);
        return;
      }
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      product_code: formData.product_code,
      image_url: finalImageUrl,
      subcategory_id: subcategoryId
    };

    let error;
    if (editingProduct) {
      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert([productData]);
      error = insertError;
    }

    if (error) alert("Erreur base : " + error.message);
    else {
      setShowModal(false);
      fetchData();
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation Retour INTELLIGENTE */}
        <Link 
          to={subCategoryInfo ? `/categories/${subCategoryInfo.category_id}` : '/categories'} 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition uppercase font-bold text-sm"
        >
          <ArrowLeft size={18} /> Retour à {parentCategoryName}
        </Link>

        {/* Titre */}
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold text-slate-900">
            {subCategoryInfo ? subCategoryInfo.name : 'Chargement...'}
          </h1>
          <p className="text-slate-500">Liste des produits disponibles</p>
        </div>

        {/* Grille des Produits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {products.map((prod) => (
            <div key={prod.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition group relative flex flex-col h-full">
              
              {/* Bouton Modifier */}
              {session && (
                <button
                  onClick={(e) => openEditModal(e, prod)}
                  className="absolute top-3 right-3 z-10 bg-white/90 p-2 rounded-full text-slate-600 hover:text-blue-600 hover:bg-white shadow-sm border border-slate-200 transition"
                >
                  <Pencil size={16} />
                </button>
              )}

              {/* Image */}
              <div className="h-48 bg-white p-4 flex items-center justify-center border-b border-slate-50">
                {prod.image_url ? (
                  <img src={prod.image_url} alt={prod.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="text-slate-300 flex flex-col items-center">
                    <Package size={40} />
                    <span className="text-xs mt-2">Pas d'image</span>
                  </div>
                )}
              </div>
              
              {/* Infos */}
              <div className="p-5 flex flex-col flex-grow">
                {prod.product_code && (
                  <div className="flex items-center gap-1 text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">
                    <Hash size={12} />
                    Ref: {prod.product_code}
                  </div>
                )}
                
                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{prod.name}</h3>
                <p className="text-slate-500 text-sm line-clamp-3">{prod.description}</p>
              </div>
            </div>
          ))}

          {/* Carte AJOUTER */}
          {session && (
            <div 
              onClick={openCreateModal}
              className="min-h-[300px] border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition text-blue-500"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <Plus size={24} />
              </div>
              <span className="font-bold">Ajouter un produit</span>
            </div>
          )}
        </div>
      </div>

      {/* MODAL FORMULAIRE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{editingProduct ? 'Modifier Produit' : 'Nouveau Produit'}</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Code Produit / Référence (Optionnel)</label>
                <input 
                  name="product_code" 
                  type="text" 
                  value={formData.product_code} 
                  onChange={handleChange} 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" 
                  placeholder="Ex: REF-12345" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nom du produit</label>
                <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Caractéristiques techniques..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-50 file:text-blue-700 file:border-0 font-semibold" />
              </div>

              <button disabled={uploading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition mt-4 flex justify-center">
                {uploading ? <Loader className="animate-spin" /> : "Enregistrer le produit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;