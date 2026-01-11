import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, X, Loader, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // États pour la Modal (Pop-up)
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 1. Charger les données au démarrage
  useEffect(() => {
    fetchCategories();
    
    // Vérifier si connecté (pour afficher le bouton Admin)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) console.error('Erreur chargement:', error);
    else setCategories(data);
    setLoading(false);
  };

  // 2. Gérer l'ajout de catégorie (avec Image)
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newName) return;
    setUploading(true);

    let imageUrl = null;

    // A. Upload de l'image si présente
    if (newImage) {
      const fileName = `${Date.now()}-${newImage.name}`;
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, newImage);

      if (uploadError) {
        alert('Erreur upload image');
        setUploading(false);
        return;
      }

      // B. Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);
      
      imageUrl = publicUrl;
    }

    // C. Sauvegarder dans la base de données
    const { error: dbError } = await supabase
      .from('categories')
      .insert([{ name: newName, image_url: imageUrl }]);

    if (dbError) {
      alert("Erreur lors de la création");
    } else {
      // Succès : on ferme et on recharge
      setShowModal(false);
      setNewName('');
      setNewImage(null);
      fetchCategories();
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* TITRE */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-blue-700 mb-4">Nos Catégories</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Parcourez nos différentes catégories pour trouver les produits qui correspondent à vos besoins.
          </p>
        </div>

        {/* GRILLE DES CATÉGORIES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* A. Les cartes existantes */}
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/categories/${cat.id}`} // Lien vers sous-catégories (à faire plus tard)
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition group cursor-pointer h-72 flex flex-col"
            >
              {/* Image */}
              <div className="h-48 bg-slate-100 overflow-hidden relative">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">Pas d'image</div>
                )}
              </div>
              {/* Nom */}
              <div className="p-6 flex justify-between items-center bg-white flex-grow">
                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wide">{cat.name}</h3>
                <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition" />
              </div>
            </Link>
          ))}

          {/* B. La carte "AJOUTER" (Visible seulement si Admin connecté) */}
          {session && (
            <div 
              onClick={() => setShowModal(true)}
              className="h-72 border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition text-blue-500 group"
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Plus size={32} />
              </div>
              <span className="font-bold text-lg">Ajouter une catégorie</span>
            </div>
          )}

        </div>
      </div>

      {/* MODAL (POP-UP FORMULAIRE) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-200">
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-slate-800 mb-6">Nouvelle Catégorie</h2>
            
            <form onSubmit={handleAddCategory} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nom</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nom de la catégorie"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Image (optionnel)</label>
                <div className="border border-slate-300 rounded-lg px-4 py-3 bg-slate-50">
                    <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setNewImage(e.target.files[0])}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
              </div>

              <button 
                disabled={uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-200 flex justify-center items-center gap-2"
              >
                {uploading ? (
                    <>
                        <Loader className="animate-spin" size={20} /> Enregistrement...
                    </>
                ) : (
                    "Enregistrer"
                )}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default CategoriesPage;