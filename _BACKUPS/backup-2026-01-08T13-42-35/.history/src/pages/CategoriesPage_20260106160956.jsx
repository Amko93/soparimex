import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, X, Loader, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
    const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
    if (!error) setCategories(data);
    setLoading(false);
  };

  // --- NOUVELLE FONCTION SUPPRIMER ---
  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation(); // Empêche d'ouvrir la catégorie en cliquant sur supprimer
    if (window.confirm("Voulez-vous vraiment supprimer cette catégorie ? Cela supprimera aussi les sous-catégories et produits associés.")) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) alert("Erreur lors de la suppression");
      else fetchCategories();
    }
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
        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, newImage);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      } catch (error) {
        console.error(error);
        setUploading(false);
        return;
      }
    }

    const { error } = editingCategory 
      ? await supabase.from('categories').update({ name: newName, image_url: finalImageUrl }).eq('id', editingCategory.id)
      : await supabase.from('categories').insert([{ name: newName, image_url: finalImageUrl }]);

    if (!error) {
      setShowModal(false);
      fetchCategories();
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-blue-700 mb-4">Nos Catégories</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/categories/${cat.id}`} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition group h-72 flex flex-col relative">
              
              {/* BOUTONS ACTIONS ADMIN */}
              {session && (
                <div className="absolute top-3 right-3 z-10 flex gap-2">
                  <button onClick={(e) => { e.preventDefault(); setEditingCategory(cat); setNewName(cat.name); setShowModal(true); }} className="bg-white/90 p-2 rounded-full text-slate-600 hover:text-blue-600 shadow-sm border border-slate-200 transition">
                    <Pencil size={16} />
                  </button>
                  <button onClick={(e) => handleDelete(e, cat.id)} className="bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 shadow-sm border border-slate-200 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <div className="h-48 bg-slate-100 overflow-hidden">
                {cat.image_url ? <img src={cat.image_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt=""/> : <div className="w-full h-full flex items-center justify-center text-slate-300">Pas d'image</div>}
              </div>
              <div className="p-6 flex justify-between items-center bg-white flex-grow">
                <h3 className="text-xl font-bold text-slate-800 uppercase">{cat.name}</h3>
                <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition" />
              </div>
            </Link>
          ))}

          {session && (
            <div onClick={() => { setEditingCategory(null); setNewName(''); setNewImage(null); setShowModal(true); }} className="h-72 border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 text-blue-500 group">
              <Plus size={32} className="mb-4 group-hover:scale-110 transition" />
              <span className="font-bold text-lg">Ajouter une catégorie</span>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{editingCategory ? 'Modifier la catégorie' : 'Nouvelle Catégorie'}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nom</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Image</label>
                <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-50 file:text-blue-700 file:border-0 font-semibold" />
              </div>
              <button disabled={uploading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition">
                {uploading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;