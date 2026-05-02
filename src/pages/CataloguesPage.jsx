import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useToast } from '../context/ToastContext';
import { Search, ArrowUpDown, Download, Plus, X, Loader, Trash2, Pencil, AlertTriangle, FileText, Image as ImageIcon } from 'lucide-react';

const CataloguesPage = () => {
  const [catalogues, setCatalogues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  // États Admin (Modales)
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Formulaire
  const [editingItem, setEditingItem] = useState(null);
  const [newName, setNewName] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [newImage, setNewImage] = useState(null); // Nouvelle image de couverture
  const toast = useToast();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCatalogues();
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s?.user?.id) {
        const { data } = await supabase.from('profiles').select('role').eq('id', s.user.id).single();
        if (data) setUserRole(data.role);
      }
    });
  }, []);

  const fetchCatalogues = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('catalogues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCatalogues(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newName) return;
    setUploading(true);

    let finalFileUrl = editingItem ? editingItem.file_url : null;
    let finalImageUrl = editingItem ? editingItem.image_url : null;

    // Upload du fichier PDF
    if (newFile) {
      if (newFile.type !== 'application/pdf') {
        toast('Le catalogue doit être un fichier PDF.', 'error');
        setUploading(false); return;
      }
      if (newFile.size > 20 * 1024 * 1024) {
        toast('Le PDF ne doit pas dépasser 20 Mo.', 'error');
        setUploading(false); return;
      }
      const fileExt = newFile.name.split('.').pop();
      const fileName = `catalogue_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, newFile);

      if (uploadError) {
        toast("Erreur upload PDF : " + uploadError.message, 'error');
        setUploading(false);
        return;
      }
      const { data } = supabase.storage.from('images').getPublicUrl(fileName);
      finalFileUrl = data.publicUrl;
    }

    // Upload de l'image de couverture
    if (newImage) {
      if (!newImage.type.startsWith('image/')) {
        toast('La couverture doit être une image (JPG, PNG, WebP…)', 'error');
        setUploading(false); return;
      }
      if (newImage.size > 5 * 1024 * 1024) {
        toast("L'image de couverture ne doit pas dépasser 5 Mo.", 'error');
        setUploading(false); return;
      }
      const fileExt = newImage.name.split('.').pop();
      const fileName = `cat_cover_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, newImage);
      
      if (uploadError) {
        toast("Erreur upload Image : " + uploadError.message, 'error');
        setUploading(false);
        return;
      }
      const { data } = supabase.storage.from('images').getPublicUrl(fileName);
      finalImageUrl = data.publicUrl;
    }

    const payload = { name: newName, file_url: finalFileUrl, image_url: finalImageUrl };

    if (editingItem) {
      await supabase.from('catalogues').update(payload).eq('id', editingItem.id);
    } else {
      await supabase.from('catalogues').insert([payload]);
    }

    setShowModal(false);
    setUploading(false);
    fetchCatalogues();
  };

  // Extrait le chemin Storage depuis une URL publique Supabase
  const extractStoragePath = (url) => {
    if (!url) return null;
    try {
      const parts = new URL(url).pathname.split('/');
      const bucketIndex = parts.indexOf('images');
      if (bucketIndex === -1) return null;
      return parts.slice(bucketIndex + 1).join('/');
    } catch {
      return null;
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete?.id) return;

    // Supprimer le PDF et l'image de couverture du Storage
    const filesToRemove = [
      extractStoragePath(itemToDelete.file_url),
      extractStoragePath(itemToDelete.image_url),
    ].filter(Boolean);
    if (filesToRemove.length > 0) {
      await supabase.storage.from('images').remove(filesToRemove);
    }

    await supabase.from('catalogues').delete().eq('id', itemToDelete.id);
    setShowDeleteConfirm(false);
    setItemToDelete(null);
    fetchCatalogues();
  };

  // Filtrage et Tri
  const filteredCatalogues = catalogues
    .filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  const openCreateModal = () => {
    setEditingItem(null);
    setNewName('');
    setNewFile(null);
    setNewImage(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setNewName(item.name);
    setNewFile(null);
    setNewImage(null);
    setShowModal(true);
  };

  const isAdmin = userRole === 'admin' || userRole === 'developpeur';

  if (loading) return <div className="flex justify-center h-[50vh] items-center"><Loader className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-sans min-h-screen">
      {/* En-tête */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-blue-600 mb-4 tracking-tight">
          Nos Catalogues
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
          Téléchargez nos catalogues pour découvrir notre gamme complète de produits et services.
        </p>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="max-w-3xl mx-auto mb-16 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un catalogue..."
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setSortAsc(!sortAsc)}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
        >
          <ArrowUpDown size={18} />
          <span>Trier par nom ({sortAsc ? 'A-Z' : 'Z-A'})</span>
        </button>
      </div>

      {/* Grille des catalogues */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        
        {/* LISTE DES CATALOGUES */}
        {filteredCatalogues.map((cat) => (
          <div key={cat.id} className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden">
            
            {/* Image de couverture */}
            <div className="h-56 w-full bg-slate-100 relative flex items-center justify-center overflow-hidden">
              {cat.image_url ? (
                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <FileText size={64} className="text-slate-300" />
              )}
            </div>

            {/* Contenu */}
            <div className="p-6 flex flex-col flex-grow border-t border-slate-100 bg-white">
              <h3 className="font-black text-xl text-slate-900 mb-4 truncate">{cat.name}</h3>
              
              {cat.file_url ? (
                <a
                  href={cat.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Download size={18} /> Télécharger
                </a>
              ) : (
                <span className="mt-auto w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                  <Download size={18} /> Fichier non disponible
                </span>
              )}
            </div>

            {/* Outils Admin */}
            {session && isAdmin && (
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={() => openEditModal(cat)} className="bg-white p-2 rounded-lg text-slate-600 hover:text-blue-600 shadow-md border border-slate-100"><Pencil size={16}/></button>
                <button onClick={() => { setItemToDelete(cat); setShowDeleteConfirm(true); }} className="bg-white p-2 rounded-lg text-red-500 hover:bg-red-50 shadow-md border border-slate-100"><Trash2 size={16}/></button>
              </div>
            )}
          </div>
        ))}

        {/* CARTE D'AJOUT (ADMIN) - Placée après les catalogues */}
        {session && isAdmin && (
          <div 
            onClick={openCreateModal}
            className="min-h-[350px] border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-blue-500 transition-all text-slate-500 hover:text-blue-600 gap-4 p-6 group"
          >
            <div className="w-16 h-16 border-2 border-current rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={32} />
            </div>
            <span className="font-bold text-lg">Ajouter un catalogue</span>
          </div>
        )}

        {filteredCatalogues.length === 0 && !(session && isAdmin) && (
          <div className="col-span-full text-center py-20">
            <p className="text-slate-400 text-lg font-medium">Aucun catalogue trouvé.</p>
          </div>
        )}
      </div>

      {/* --- MODAL AJOUT / MODIF --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={24}/></button>
            <h2 className="text-2xl font-bold mb-6 text-slate-900">{editingItem ? 'Modifier le catalogue' : 'Nouveau Catalogue'}</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom du catalogue</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Tarif Général 2026" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-2"><FileText size={14}/> Fichier PDF</label>
                <input type="file" accept=".pdf" onChange={e => setNewFile(e.target.files[0])} className="w-full text-sm font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />
                {editingItem && !newFile && <p className="text-xs text-green-600 mt-2 font-bold">Fichier actuel conservé</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-2"><ImageIcon size={14}/> Image de couverture</label>
                <input type="file" accept="image/*" onChange={e => setNewImage(e.target.files[0])} className="w-full text-sm font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />
                {editingItem && !newImage && editingItem.image_url && <p className="text-xs text-green-600 mt-2 font-bold">Image actuelle conservée</p>}
              </div>

              <button disabled={uploading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 mt-4 flex justify-center">
                {uploading ? <Loader className="animate-spin" /> : "Enregistrer le catalogue"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL SUPPRESSION --- */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-10 text-center max-w-sm">
            <AlertTriangle size={40} className="text-red-500 mx-auto mb-4"/>
            <h2 className="text-xl font-bold mb-4">Supprimer ce catalogue ?</h2>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-red-600 transition">Oui, supprimer</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CataloguesPage;