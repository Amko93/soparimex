import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Plus, X, Loader, ArrowRight, Pencil, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';

const CategoryDetailsPage = () => {
  const { id } = useParams(); // ID de la catégorie parente
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // États Modales (Création / Modif)
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
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Infos de la catégorie parente
      const { data: catData } = await supabase.from('categories').select('*').eq('id', id).single();
      setCategory(catData);

      // 2. Les sous-catégories liées
      const { data: subData } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', id)
        .order('created_at', { ascending: true });
        
      setSubcategories(subData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await supabase.from('subcategories').delete().eq('id', itemToDelete);
    setShowDeleteConfirm(false);
    setItemToDelete(null);
    fetchData();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newName) return;
    setUploading(true);

    let finalImageUrl = editingSub ? editingSub.image_url : null;

    if (newImage) {
      const fileName = `${Date.now()}_${newImage.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      await supabase.storage.from('images').upload(fileName, newImage);
      const { data } = supabase.storage.from('images').getPublicUrl(fileName);
      finalImageUrl = data.publicUrl;
    }

    const payload = { 
      name: newName, 
      image_url: finalImageUrl,
      category_id: id // IMPORTANT : On lie à la catégorie parente
    };

    if (editingSub) {
      await supabase.from('subcategories').update(payload).eq('id', editingSub.id);
    } else {
      await supabase.from('subcategories').insert([payload]);
    }

    setShowModal(false);
    setUploading(false);
    fetchData();
  };

  if (loading) return <div className="flex justify-center h-[50vh] items-center"><Loader className="animate-spin text-blue-600" size={40}/></div>;
  if (!category) return <div className="p-10 text-center font-bold">Catégorie introuvable</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-sans min-h-screen">
      <Link to="/categories" className="inline-flex items-center text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Retour aux catégories
      </Link>

      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">{category.name}</h1>
        <p className="text-slate-500 text-lg font-medium">Sélectionnez une sous-catégorie</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Liste des sous-catégories */}
        {subcategories.map((sub) => (
          <div key={sub.id} className="relative group">
            {/* Clic = Aller vers la page Produits (prochaine étape) */}
            <Link to={`/subcategory/${sub.id}`} className="block bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-all h-full flex flex-col">
              <div className="h-56 bg-slate-50 relative overflow-hidden flex items-center justify-center p-6">
                {sub.image_url ? (
                  <img src={sub.image_url} alt={sub.name} className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform" />
                ) : (
                  <div className="text-slate-200 font-black text-4xl uppercase opacity-30">{sub.name.substring(0,2)}</div>
                )}
              </div>
              <div className="p-6 flex justify-between items-center bg-white border-t border-slate-50 flex-grow">
                <h3 className="text-lg font-black text-slate-900 uppercase">{sub.name}</h3>
                <div className="bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center text-blue-600"><ArrowRight size={16}/></div>
              </div>
            </Link>

            {/* Outils Admin */}
            {session && (
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={() => { setEditingSub(sub); setNewName(sub.name); setShowModal(true); }} className="bg-white p-2 rounded-xl text-slate-600 hover:text-blue-600 shadow-md"><Pencil size={16}/></button>
                <button onClick={() => { setItemToDelete(sub.id); setShowDeleteConfirm(true); }} className="bg-white p-2 rounded-xl text-red-500 hover:bg-red-50 shadow-md"><Trash2 size={16}/></button>
              </div>
            )}
          </div>
        ))}

        {/* Bouton Création (Visible seulement si connecté) */}
        {session && (
          <div onClick={() => { setEditingSub(null); setNewName(''); setNewImage(null); setShowModal(true); }} className="min-h-[250px] border-3 border-dashed border-blue-200 bg-blue-50/50 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition-all text-blue-400 hover:text-blue-600 group gap-4">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><Plus size={28}/></div>
            <span className="font-bold">Ajouter une sous-catégorie</span>
          </div>
        )}
      </div>

      {/* --- MODALES --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400"><X size={24}/></button>
            <h2 className="text-2xl font-bold mb-6">{editingSub ? 'Modifier' : 'Nouvelle Sous-Catégorie'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full border p-3 rounded-xl bg-slate-50 font-bold" placeholder="Nom" required />
              <input type="file" onChange={e => setNewImage(e.target.files[0])} className="w-full text-sm font-bold" />
              <button disabled={uploading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">{uploading ? <Loader className="animate-spin mx-auto"/> : "Enregistrer"}</button>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-10 text-center max-w-sm">
            <AlertTriangle size={40} className="text-red-500 mx-auto mb-4"/>
            <h2 className="text-xl font-bold mb-4">Supprimer ?</h2>
            <button onClick={confirmDelete} className="w-full bg-red-500 text-white font-bold py-3 rounded-xl mb-2">Oui, supprimer</button>
            <button onClick={() => setShowDeleteConfirm(false)} className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl">Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDetailsPage;