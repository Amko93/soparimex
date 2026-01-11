import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, X, Loader, ChevronRight, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États Modales
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [editingCategory, setEditingCategory] = useState(null);
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
    if (data) setCategories(data);
    setLoading(false);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { error } = await supabase.from('categories').delete().eq('id', itemToDelete);
    if (!error) fetchCategories();
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newName) return;
    setUploading(true);
    let finalImageUrl = editingCategory ? editingCategory.image_url : null;

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

    const { error } = editingCategory 
      ? await supabase.from('categories').update({ name: newName, image_url: finalImageUrl }).eq('id', editingCategory.id)
      : await supabase.from('categories').insert([{ name: newName, image_url: finalImageUrl }]);

    if (!error) { setShowModal(false); fetchCategories(); }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-12 text-center">Nos Catégories</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <div key={cat.id} className="relative group">
               <Link to={`/categories/${cat.id}`} className="block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all h-80 flex flex-col">
                  <div className="h-56 bg-slate-100 overflow-hidden">
                    {cat.image_url ? <img src={cat.image_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt=""/> : <div className="w-full h-full flex items-center justify-center text-slate-300 italic">Pas d'image</div>}
                  </div>
                  <div className="p-6 flex justify-between items-center bg-white flex-grow border-t border-slate-50">
                    <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wide">{cat.name}</h3>
                    <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition" />
                  </div>
               </Link>

               {session && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingCategory(cat); setNewName(cat.name); setShowModal(true); }} className="bg-white p-2.5 rounded-xl text-slate-600 hover:text-blue-600 shadow-lg border border-slate-100 transition"><Pencil size={18} /></button>
                  <button onClick={() => { setItemToDelete(cat.id); setShowDeleteConfirm(true); }} className="bg-white p-2.5 rounded-xl text-red-500 hover:bg-red-50 shadow-lg border border-slate-100 transition"><Trash2 size={18} /></button>
                </div>
               )}
            </div>
          ))}

          {session && (
            <div onClick={() => { setEditingCategory(null); setNewName(''); setNewImage(null); setShowModal(true); }} className="h-80 border-2 border-dashed border-blue-200 bg-white/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-blue-500 transition-all text-blue-500 group">
              <Plus size={40} className="mb-4 group-hover:scale-110 transition" />
              <span className="font-bold text-lg">Ajouter une catégorie</span>
            </div>
          )}
        </div>
      </div>

      {/* MODAL AJOUT / MODIF */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">{editingCategory ? 'Modifier la catégorie' : 'Nouvelle Catégorie'}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nom de la catégorie</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Image illustrative</label>
                <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:bg-blue-50 file:text-blue-700 file:border-0 font-bold cursor-pointer" />
              </div>
              <button disabled={uploading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-blue-200 flex justify-center items-center">
                {uploading ? <Loader className="animate-spin" /> : "Enregistrer la catégorie"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMATION DE SUPPRESSION (LA BELLE PAGE) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-10 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Confirmation</h2>
            <p className="text-slate-500 mb-10 leading-relaxed">
              Voulez-vous vraiment supprimer cet élément ? <br/> 
              <span className="text-red-500 font-bold">Cette action est irréversible.</span>
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-200">
                Oui, supprimer
              </button>
              <button onClick={() => { setShowDeleteConfirm(false); setItemToDelete(null); }} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;