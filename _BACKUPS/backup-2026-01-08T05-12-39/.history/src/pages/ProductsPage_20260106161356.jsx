import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Plus, X, Loader, Pencil, Trash2, ArrowLeft, Package, Hash, AlertTriangle } from 'lucide-react';

const ProductsPage = () => {
  const { subcategoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [subCategoryInfo, setSubCategoryInfo] = useState(null);
  const [parentCategoryName, setParentCategoryName] = useState('Catégories');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // États Modales
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', product_code: '', image: null });

  useEffect(() => {
    fetchData();
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, [subcategoryId]);

  const fetchData = async () => {
    setLoading(true);
    const { data: subData } = await supabase.from('subcategories').select('name, category_id').eq('id', subcategoryId).single();
    if (subData) {
      setSubCategoryInfo(subData);
      const { data: catData } = await supabase.from('categories').select('name').eq('id', subData.category_id).single();
      if (catData) setParentCategoryName(catData.name);
    }
    const { data: prodData } = await supabase.from('products').select('*').eq('subcategory_id', subcategoryId).order('created_at', { ascending: true });
    if (prodData) setProducts(prodData);
    setLoading(false);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { error } = await supabase.from('products').delete().eq('id', itemToDelete);
    if (!error) fetchData();
    setShowDeleteConfirm(false);
    setItemToDelete(null);
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
        await supabase.storage.from('images').upload(fileName, formData.image);
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      } catch (error) { console.error(error); }
    }

    const payload = { name: formData.name, description: formData.description, product_code: formData.product_code, image_url: finalImageUrl, subcategory_id: subcategoryId };
    const { error } = editingProduct 
      ? await supabase.from('products').update(payload).eq('id', editingProduct.id)
      : await supabase.from('products').insert([payload]);

    if (!error) { setShowModal(false); fetchData(); }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <Link to={subCategoryInfo ? `/categories/${subCategoryInfo.category_id}` : '/categories'} className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 uppercase font-black text-sm transition">
          <ArrowLeft size={18} /> Retour à {parentCategoryName}
        </Link>

        <h1 className="text-3xl font-black text-slate-900 mb-12">
          {subCategoryInfo ? subCategoryInfo.name : 'Chargement...'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((prod) => (
            <div key={prod.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition relative flex flex-col group h-full">
              {session && (
                <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingProduct(prod); setFormData({ name: prod.name, description: prod.description || '', product_code: prod.product_code || '', image: null }); setShowModal(true); }} className="bg-white p-2 rounded-xl text-slate-600 shadow-sm border border-slate-100 transition hover:text-blue-600"><Pencil size={14} /></button>
                  <button onClick={() => { setItemToDelete(prod.id); setShowDeleteConfirm(true); }} className="bg-white p-2 rounded-xl text-red-500 shadow-sm border border-slate-100 transition hover:bg-red-50"><Trash2 size={14} /></button>
                </div>
              )}
              <div className="h-48 bg-white p-4 flex items-center justify-center border-b border-slate-50">
                {prod.image_url ? <img src={prod.image_url} className="max-h-full max-w-full object-contain" alt=""/> : <Package size={32} className="text-slate-200"/>}
              </div>
              <div className="p-5 flex flex-col flex-grow">
                {prod.product_code && <div className="text-[10px] font-black text-blue-600 mb-1 uppercase tracking-widest">Ref: {prod.product_code}</div>}
                <h3 className="font-bold text-slate-800 mb-2 leading-tight">{prod.name}</h3>
                <p className="text-slate-500 text-xs line-clamp-3">{prod.description}</p>
              </div>
            </div>
          ))}

          {session && (
            <div onClick={() => { setEditingProduct(null); setFormData({ name: '', description: '', product_code: '', image: null }); setShowModal(true); }} className="min-h-[300px] border-2 border-dashed border-blue-200 bg-white/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 text-blue-500 transition-all group">
              <Plus size={32} className="mb-2 group-hover:scale-110 transition" />
              <span className="font-bold">Ajouter un produit</span>
            </div>
          )}
        </div>
      </div>

      {/* MODAL FORMULAIRE */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={24} /></button>
            <h2 className="text-2xl font-black text-slate-900 mb-6">{editingProduct ? 'Modifier' : 'Nouveau'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input type="text" placeholder="Référence..." value={formData.product_code} onChange={(e) => setFormData({...formData, product_code: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 font-mono text-sm" />
              <input type="text" placeholder="Nom du produit..." value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50" required />
              <textarea placeholder="Description..." rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50" />
              <input type="file" accept="image/*" onChange={(e) => setFormData({...formData, image: e.target.files[0]})} className="w-full text-xs font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:bg-blue-50 file:text-blue-700 file:border-0" />
              <button disabled={uploading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition">
                {uploading ? <Loader className="animate-spin mx-auto" /> : "Enregistrer"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMATION */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-10 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40} /></div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Confirmation</h2>
            <p className="text-slate-500 mb-10 leading-relaxed">Voulez-vous supprimer ce produit ?</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg">Supprimer définitivement</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;