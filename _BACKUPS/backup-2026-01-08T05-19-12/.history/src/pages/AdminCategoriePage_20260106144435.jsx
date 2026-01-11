import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Trash2, Package } from 'lucide-react';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Charger les catégories au démarrage
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) console.error('Erreur:', error);
    else setCategories(data);
  };

  // 2. Ajouter une catégorie
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from('categories')
      .insert([{ name: newCategory }]);

    if (error) {
      alert("Erreur lors de l'ajout !");
      console.error(error);
    } else {
      setNewCategory(''); // Vider le champ
      fetchCategories();  // Recharger la liste
    }
    setLoading(false);
  };

  // 3. Supprimer une catégorie
  const handleDelete = async (id) => {
    if (!window.confirm("Sûr de vouloir supprimer cette catégorie ?")) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) alert("Erreur suppression");
    else fetchCategories();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Gestion des Catégories</h1>

      {/* FORMULAIRE D'AJOUT */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-10">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Plus className="text-blue-600" /> Nouvelle Catégorie
        </h2>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="text"
            placeholder="Nom de la catégorie (ex: Plomberie)"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition disabled:opacity-50"
          >
            {loading ? 'Ajout...' : 'Ajouter'}
          </button>
        </form>
      </div>

      {/* LISTE DES CATÉGORIES */}
      <div className="grid md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-md text-blue-600">
                <Package size={20} />
              </div>
              <span className="font-bold text-slate-700">{cat.name}</span>
            </div>
            <button 
              onClick={() => handleDelete(cat.id)}
              className="text-slate-400 hover:text-red-500 p-2 transition"
              title="Supprimer"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        
        {categories.length === 0 && (
          <p className="text-slate-400 italic">Aucune catégorie pour l'instant.</p>
        )}
      </div>
    </div>
  );
};

export default AdminCategoriesPage;