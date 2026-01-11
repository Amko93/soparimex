import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, X, Loader, ArrowRight, Pencil, Trash2, AlertTriangle } from 'lucide-react';
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
    try {
      const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      if (data) setCategories(data);
    } catch (err) {
      console.error("Erreur fetch:", err);
    } finally {
      setLoading(false);
    }
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

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh]">
      <Loader className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-sans min-h-screen">
      {/* NOUVEAU HEADER (Style Bleu) */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-blue-600 mb-4 tracking-tight">
          Nos Catégories
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
          Parcourez nos différentes catégories pour trouver les produits qui correspondent à vos besoins.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <div key={cat.id} className="relative group">
            {/* CARTE STYLE IMAGE_3DADFB */}
            <Link 
              to={`/category/${cat.id}`} 
              className="block bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
            >
              {/* Zone Image */}
              <div className="h-64 bg-slate-50 relative overflow-hidden flex items-center justify-center p-8">
                {cat.image_url ? (
                  <img 
                    src={cat.image_url} 
                    alt={cat.name} 
                    className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-slate-200 font-black text-6xl uppercase opacity-30 select-none">
                    {cat.name.substring(0, 2)}
                  </div>
                )}
              </div>

              {/* Zone Titre et Flèche */}
              <div className="p-6 flex justify-between items-center bg-white border-t border-slate-50 flex-grow">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">
                  {cat.name}
                </h3>
                <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <ArrowRight size={20} strokeWidth={3} />
                </div>
              </div>
            </Link>

            {/* BOUTONS ADMIN (Modif/Suppr) - Apparaissent au survol */}
            {session && (
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                <button 
                  onClick={(e) => { e.preventDefault(); setEditingCategory(cat); setNewName(cat.name); setShowModal(true); }} 
                  className="bg-white p-3 rounded-xl text-slate-600 hover:text-blue-600 shadow-lg border border-slate-100 transition hover:scale-110"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); setItemToDelete(cat.id); setShowDeleteConfirm(true); }} 
                  className="bg-white p-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 shadow-lg border border-slate-100 transition hover:scale-110"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* CARTE D'AJOUT (Si Admin) */}
        {session && (
          <div 
            onClick={() => { setEditingCategory(null); setNewName(''); setNewImage(null); setShowModal(true); }} 
            className="min-h-[300px] border-3 border-dashed border-blue-200 bg-blue-50/50 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition-all text-blue-400 hover:text-blue-600 group gap-4"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Plus size={32} />
            </div>
            <span className="font-bold text-lg">Ajouter une catégorie</span>
          </div>
        )}
      </div>

      {/* --- MODAL AJOUT / MODIF (Code original conservé) --- */}
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

      {/* --- MODAL DE CONFIRMATION (Code original conservé) --- */}
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