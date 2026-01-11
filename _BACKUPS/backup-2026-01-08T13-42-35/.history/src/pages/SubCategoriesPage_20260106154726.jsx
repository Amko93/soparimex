import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Plus, X, Loader, ChevronRight, Pencil, ArrowLeft } from 'lucide-react';

const SubCategoriesPage = () => {
  const { categoryId } = useParams(); // On récupère l'ID de la catégorie dans l'URL
  const [subcategories, setSubcategories] = useState([]);
  const [parentCategory, setParentCategory] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // États pour la Modal
  const [showModal, setShowModal] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  
  // Formulaire
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, [categoryId]);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Récupérer le nom de la catégorie parente (ex: "Plomberie")
    const { data: parentData } = await supabase
      .from('categories')
      .select('name')
      .eq('id', categoryId)
      .single();
    setParentCategory(parentData);

    // 2. Récupérer les sous-catégories liées (ex: "Robinets", "Tuyaux")
    const { data: subData, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', categoryId) // Filtre important !
      .order('created_at', { ascending: true });

    if (error) console.error(error);
    else setSubcategories(subData);
    
    setLoading(false);
  };

  // --- MODAL & GESTION ---
  const openCreateModal = () => {
    setEditingSub(null);
    setNewName('');
    setNewImage(null);
    setShowModal(true);
  };

  const openEditModal = (e, sub) => {
    e.preventDefault();
    setEditingSub(sub);
    setNewName(sub.name);
    setNewImage(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newName) return;
    setUploading(true);

    let finalImageUrl = editingSub ? editingSub.image_url : null;

    // Upload Image (Version Corrigée)
    if (newImage) {
      try {
        const fileExt = newImage.name.split('.').pop();
        const sanitizedName = newImage.name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${Date.now()}_${sanitizedName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, newImage);

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

    // Sauvegarde en base
    let error;
    if (editingSub) {
      // UPDATE
      const { error: updateError } = await supabase
        .from('subcategories')
        .update({ name: newName, image_url: finalImageUrl })
        .eq('id', editingSub.id);
      error = updateError;
    } else {
      // INSERT (On n'oublie pas le category_id !)
      const { error: insertError } = await supabase
        .from('subcategories')
        .insert([{ 
          name: newName, 
          image_url: finalImageUrl,
          category_id: categoryId 
        }]);
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
        
        {/* Navigation Retour */}
        <Link to="/categories" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition">
          <ArrowLeft size={20} /> Retour aux catégories
        </Link>

        {/* Titre Dynamique */}
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold text-slate-900">
            {parentCategory ? parentCategory.name : 'Chargement...'}
          </h1>
          <p className="text-slate-500">Sélectionnez une sous-catégorie</p>
        </div>

        {/* Grille */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {subcategories.map((sub) => (
            <Link 
              key={sub.id} 
              to={`/products/${sub.id}`} // Vers la future page produits
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition group cursor-pointer h-64 flex flex-col relative"
            >
              {/* Bouton Modifier */}
              {session && (
                <button
                  onClick={(e) => openEditModal(e, sub)}
                  className="absolute top-3 right-3 z-10 bg-white/90 p-2 rounded-full text-slate-600 hover:text-blue-600 hover:bg-white shadow-sm border border-slate-200 transition"
                >
                  <Pencil size={18} />
                </button>
              )}

              <div className="h-40 bg-slate-100 overflow-hidden relative">
                {sub.image_url ? (
                  <img src={sub.image_url} alt={sub.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">Pas d'image</div>
                )}
              </div>
              
              <div className="p-4 flex justify-between items-center bg-white flex-grow">
                <h3 className="text-lg font-bold text-slate-800">{sub.name}</h3>
                <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition" />
              </div>
            </Link>
          ))}

          {/* Bouton Ajouter */}
          {session && (
            <div 
              onClick={openCreateModal}
              className="h-64 border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition text-blue-500 group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Plus size={24} />
              </div>
              <span className="font-bold">Ajouter une sous-catégorie</span>
            </div>
          )}
        </div>
      </div>

      {/* MODAL (Identique à celle des catégories) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{editingSub ? 'Modifier' : 'Nouvelle Sous-Catégorie'}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nom</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Image</label>
                <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-50 file:text-blue-700 file:border-0 font-semibold" />
              </div>
              <button disabled={uploading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-200 flex justify-center gap-2">
                {uploading ? <Loader className="animate-spin" /> : "Enregistrer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategoriesPage;