import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Plus, X, Loader, ArrowLeft, Pencil, Trash2, AlertTriangle, Package, Hash } from 'lucide-react';

const SubCategoryProductsPage = () => {
  const { id } = useParams(); 
  const [subcategory, setSubcategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // États Modales
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // États Formulaire
  const [editingProduct, setEditingProduct] = useState(null);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: subData } = await supabase.from('subcategories').select('*').eq('id', id).single();
      setSubcategory(subData);

      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('subcategory_id', id)
        .order('created_at', { ascending: true });
        
      setProducts(prodData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await supabase.from('products').delete().eq('id', itemToDelete);
    setShowDeleteConfirm(false);
    setItemToDelete(null);
    fetchData();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newName) return;
    setUploading(true);

    let finalImageUrl = editingProduct ? editingProduct.image_url : null;

    if (newImage) {
      const fileName = `prod_${Date.now()}_${newImage.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      await supabase.storage.from('images').upload(fileName, newImage);
      const { data } = supabase.storage.from('images').getPublicUrl(fileName);
      finalImageUrl = data.publicUrl;
    }

    const payload = { 
      name: newName, 
      product_code: newCode,
      description: newDescription,
      image_url: finalImageUrl,
      subcategory_id: id 
    };

    if (editingProduct) {
      await supabase.from('products').update(payload).eq('id', editingProduct.id);
    } else {
      await supabase.from('products').insert([payload]);
    }

    setShowModal(false);
    setUploading(false);
    fetchData();
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setNewName(prod.name);
    setNewCode(prod.product_code || '');
    setNewDescription(prod.description || '');
    setNewImage(null);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setNewName('');
    setNewCode('');
    setNewDescription('');
    setNewImage(null);
    setShowModal(true);
  };

  if (loading) return <div className="flex justify-center h-[50vh] items-center"><Loader className="animate-spin text-blue-600" size={40}/></div>;
  if (!subcategory) return <div className="p-10 text-center font-bold">Sous-catégorie introuvable</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-sans min-h-screen">
      <Link to={`/category/${subcategory.category_id}`} className="inline-flex items-center text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Retour
      </Link>

      <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 mb-12 flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 bg-slate-50 rounded-2xl flex items-center justify-center p-4 border border-slate-100 flex-shrink-0">
           {subcategory.image_url ? (
             <img src={subcategory.image_url} alt={subcategory.name} className="w-full h-full object-contain mix-blend-multiply" />
           ) : (
             <span className="text-2xl font-black text-slate-200 uppercase">{subcategory.name.substring(0, 2)}</span>
           )}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-2">
            {subcategory.name}
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Découvrez tous les produits de la gamme {subcategory.name.toLowerCase()}.
          </p>
        </div>
      </div>

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
              
              {/* --- LE BOUTON EST MAINTENANT UN LIEN FONCTIONNEL --- */}
              <Link 
                to={`/product/${prod.id}`}
                className="mt-4 w-full py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors text-center block"
              >
                VOIR LE PRODUIT
              </Link>
            </div>

            {session && (
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={() => openEditModal(prod)} className="bg-white p-2 rounded-lg text-slate-600 hover:text-blue-600 shadow-md border border-slate-100"><Pencil size={14} /></button>
                <button onClick={() => { setItemToDelete(prod.id); setShowDeleteConfirm(true); }} className="bg-white p-2 rounded-lg text-red-500 hover:bg-red-50 shadow-md border border-slate-100"><Trash2 size={14} /></button>
              </div>
            )}
          </div>
        ))}

        {session && (
          <div onClick={openCreateModal} className="min-h-[300px] border-3 border-dashed border-blue-200 bg-blue-50/30 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition-all text-blue-500 group gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-blue-600"><Plus size={24} strokeWidth={3}/></div>
            <span className="font-bold text-sm uppercase tracking-wide">Ajouter un produit</span>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative animate-in zoom-in">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={24}/></button>
            <h2 className="text-2xl font-bold mb-6 text-slate-900">{editingProduct ? 'Modifier le produit' : 'Nouveau Produit'}</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom du produit</label>
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Cylindre Européen" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Code Produit (Référence)</label>
                  <input type="text" value={newCode} onChange={e => setNewCode(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: REF-12345" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea rows="3" value={newDescription} onChange={e => setNewDescription(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Caractéristiques techniques..."></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Image</label>
                <input type="file" onChange={e => setNewImage(e.target.files[0])} className="w-full text-sm font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />
              </div>
              <button disabled={uploading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 mt-4 flex justify-center">
                {uploading ? <Loader className="animate-spin" /> : "Enregistrer le produit"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-10 text-center max-w-sm">
            <AlertTriangle size={40} className="text-red-500 mx-auto mb-4"/>
            <h2 className="text-xl font-bold mb-4 text-slate-900">Supprimer ce produit ?</h2>
            <p className="text-slate-500 text-sm mb-8">Cette action est définitive.</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-200 hover:bg-red-600 transition">Oui, supprimer</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategoryProductsPage;