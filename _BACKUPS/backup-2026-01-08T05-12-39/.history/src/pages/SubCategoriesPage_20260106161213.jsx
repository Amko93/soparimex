import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Plus, X, Loader, ChevronRight, Pencil, Trash2, ArrowLeft, AlertTriangle } from 'lucide-react';

const SubCategoriesPage = () => {
  const { categoryId } = useParams();
  const [subcategories, setSubcategories] = useState([]);
  const [parentCategory, setParentCategory] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // États Modales
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [editingSub, setEditingSub] = useState(null);
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, [categoryId]);

  const fetchData = async () => {
    setLoading(true);
    const { data: parentData } = await supabase.from('categories').select('name').eq('id', categoryId).single();
    setParentCategory(parentData);

    const { data: subData } = await supabase.from('subcategories').select('*').eq('category_id', categoryId).order('created_at', { ascending: true });
    if (subData) setSubcategories(subData);
    setLoading(false);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { error } = await supabase.from('subcategories').delete().eq('id', itemToDelete);
    if (!error) fetchData();
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newName) return;
    setUploading(true);
    let finalImageUrl = editingSub ? editingSub.image_url : null;

    if (newImage) {
      try {
        const fileExt = newImage.name.split('.').pop();
        const sanitizedName = newImage.name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${Date.now()}_${sanitizedName}.${fileExt}`;
        await supabase.storage.from('images').upload(fileName, newImage);
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      } catch (error) { console.error(error); }
    }

    const { error } = editingSub 
      ? await supabase.from('subcategories').update({ name: newName, image_url: finalImageUrl }).eq('id', editingSub.id)
      : await supabase.from('subcategories').insert([{ name: newName, image_url: finalImageUrl, category_id: categoryId }]);

    if (!error) { setShowModal(false); fetchData(); }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/categories" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold transition">
          <ArrowLeft size={20} /> Retour aux catégories
        </Link>

        <h1 className="text-4xl font-extrabold text-slate-900 mb-12 uppercase">
          {parentCategory ? parentCategory.name : 'Chargement...'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subcategories.map((sub) => (
            <div key={sub.id} className="relative group">
              <Link to={`/products/${sub.id}`} className="block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all h-64 flex flex-col">
                <div className="h-40 bg-slate-100 overflow-hidden">
                  {sub.image_url ? <img src={sub.image_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt=""/> : <div className="w-full h-full flex items-center justify-center text-slate-300 italic">Pas d'image</div>}
                </div>
                <div className="p-4 flex justify-between items-center bg-white flex-grow border-t border-slate-50">
                  <h3 className="text-lg font-bold text-slate-800">{sub.name}</h3>
                  <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition" />
                </div>
              </Link>

              {session && (
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingSub(sub); setNewName(sub.name); setShowModal(true); }} className="bg-white p-2 rounded-xl text-slate-600 hover:text-blue-600 shadow-lg border border-slate-100 transition"><Pencil size={16} /></button>
                  <button onClick={() => { setItemToDelete(sub.id); setShowDeleteConfirm(true); }} className="bg-white p-2 rounded-xl text-red-500 hover:bg-red-50 shadow-lg border border-slate-100 transition"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          ))}

          {session && (
            <div onClick={() => { setEditingSub(null); setNewName(''); setNewImage(null); setShowModal(true); }} className="h-64 border-2 border-dashed border-blue-200 bg-white/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 text-blue-500 group transition-all">
              <Plus size={32} className="mb-2 group-hover:scale-110 transition" />
              <span className="font-bold">Ajouter une sous-catégorie</span>
            </div>
          )}
        </div>
      </div>

      {/* MODAL AJOUT / MODIF */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">{editingSub ? 'Modifier' : 'Nouveau'}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" placeholder="Nom..." required />
              <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:bg-blue-50 file:text-blue-700 file:border-0 font-bold" />
              <button disabled={uploading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition">
                {uploading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMATION (DESIGN PRO) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-10 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Confirmation</h2>
            <p className="text-slate-500 mb-10 leading-relaxed">Voulez-vous supprimer cette sous-catégorie ?</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-200">Oui, supprimer</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategoriesPage;