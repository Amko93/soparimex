import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, ChevronRight, ArrowLeft,
  Package, Layers, LayoutGrid, AlertTriangle, X, Loader, FolderInput, Download
} from 'lucide-react';
import AdminNav from '../components/AdminNav';

const AdminCategoriesPage = () => {
  const [view, setView] = useState('categories'); // 'categories', 'subcategories', 'products'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState({ category: null, subcategory: null });

  // États Modales
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showBulkDesc, setShowBulkDesc] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [bulkDesc, setBulkDesc] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  // Déplacement
  const [showMove, setShowMove] = useState(false);
  const [moveItem, setMoveItem] = useState(null);
  const [moveTargetId, setMoveTargetId] = useState('');
  const [moveOptions, setMoveOptions] = useState([]);
  const [moveLoading, setMoveLoading] = useState(false);

  // Formulaire unique
  const toast = useToast();
  const [formData, setFormData] = useState({ name: '', code: '', desc: '', image: null });
  const [defaultDesc, setDefaultDesc] = useState('');

  useEffect(() => {
    fetchData();
    const fallback = setTimeout(() => setLoading(false), 10000);
    return () => clearTimeout(fallback);
  }, [view, selection.category?.id, selection.subcategory?.id]);

  useEffect(() => {
    supabase.from('site_settings').select('texts').eq('id', 'main').single().then(({ data }) => {
      if (data?.texts?.defaultProductDesc) setDefaultDesc(data.texts.defaultProductDesc);
    });
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let res = [];
      if (view === 'categories') {
        const { data } = await supabase.from('categories').select('*').order('name');
        res = data || [];
      } else if (view === 'subcategories' && selection.category?.id) {
        const { data } = await supabase.from('subcategories').select('*').eq('category_id', selection.category.id).order('name');
        res = data || [];
      } else if (view === 'products' && selection.subcategory?.id) {
        const { data } = await supabase.from('products').select('*').eq('subcategory_id', selection.subcategory.id).order('name');
        res = data || [];
      }
      setData(res);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (view === 'products') setView('subcategories');
    else if (view === 'subcategories') setView('categories');
  };

  const openForm = (item = null) => {
    if (item) {
      setActiveItem(item);
      setFormData({ 
        name: item.name, 
        code: item.product_code || '', 
        desc: item.description || '', 
        image: null 
      });
    } else {
      setActiveItem(null);
      setFormData({ name: '', code: '', desc: view === 'products' ? defaultDesc : '', image: null });
    }
    setShowForm(true);
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

  const handleDelete = async () => {
    const table = view === 'categories' ? 'categories' : view === 'subcategories' ? 'subcategories' : 'products';

    // Supprimer l'image du Storage avant la ligne BDD
    if (activeItem.image_url) {
      const path = extractStoragePath(activeItem.image_url);
      if (path) await supabase.storage.from('images').remove([path]);
    }

    const { error } = await supabase.from(table).delete().eq('id', activeItem.id);
    if (error) {
      toast('Erreur lors de la suppression : ' + (error.message || 'erreur inconnue'), 'error');
      return;
    }
    setShowDelete(false);
    fetchData();
  };

  const openMove = async (item) => {
    setMoveItem(item);
    setMoveTargetId('');
    // Sous-catégorie → liste toutes les catégories sauf celle actuelle
    if (view === 'subcategories') {
      const { data } = await supabase.from('categories').select('id, name').order('name');
      setMoveOptions((data || []).filter(c => c.id !== selection.category?.id));
    }
    // Produit → liste toutes les sous-catégories de toutes les catégories
    if (view === 'products') {
      const { data } = await supabase
        .from('subcategories')
        .select('id, name, categories(name)')
        .order('name');
      setMoveOptions((data || []).filter(s => s.id !== selection.subcategory?.id));
    }
    setShowMove(true);
  };

  const handleMove = async () => {
    if (!moveTargetId || !moveItem) return;
    setMoveLoading(true);
    let error;
    if (view === 'subcategories') {
      ({ error } = await supabase.from('subcategories').update({ category_id: moveTargetId }).eq('id', moveItem.id));
    } else if (view === 'products') {
      ({ error } = await supabase.from('products').update({ subcategory_id: moveTargetId }).eq('id', moveItem.id));
    }
    setMoveLoading(false);
    if (!error) { setShowMove(false); fetchData(); }
  };

  const handleBulkDesc = async () => {
    if (!bulkDesc.trim() || !selection.subcategory?.id) return;
    setBulkLoading(true);
    const { error } = await supabase
      .from('products')
      .update({ description: bulkDesc.trim() })
      .eq('subcategory_id', selection.subcategory.id);
    setBulkLoading(false);
    if (!error) {
      setShowBulkDesc(false);
      setBulkDesc('');
      fetchData();
    }
  };

  const exportCSV = async () => {
    let rows = [];
    let fileName = '';

    if (view === 'products' && selection.subcategory?.id) {
      // Exporter les produits de la sous-catégorie
      const { data } = await supabase.from('products').select('name, product_code, description, image_url').eq('subcategory_id', selection.subcategory.id).order('name');
      rows = (data || []).map(p => [p.name, p.product_code || '', p.description || '', p.image_url || '']);
      rows.unshift(['Nom', 'Référence', 'Description', 'Image URL']);
      fileName = `${selection.subcategory.name.replace(/[^a-zA-Z0-9]/g, '_')}_produits.csv`;
    } else if (view === 'subcategories' && selection.category?.id) {
      // Exporter toutes les sous-catégories + leurs produits
      const { data: subs } = await supabase.from('subcategories').select('id, name').eq('category_id', selection.category.id).order('name');
      rows.push(['Sous-catégorie', 'Nom produit', 'Référence', 'Description', 'Image URL']);
      for (const sub of (subs || [])) {
        const { data: prods } = await supabase.from('products').select('name, product_code, description, image_url').eq('subcategory_id', sub.id).order('name');
        for (const p of (prods || [])) {
          rows.push([sub.name, p.name, p.product_code || '', p.description || '', p.image_url || '']);
        }
      }
      fileName = `${selection.category.name.replace(/[^a-zA-Z0-9]/g, '_')}_catalogue.csv`;
    } else if (view === 'categories') {
      // Exporter toutes les catégories
      const { data: cats } = await supabase.from('categories').select('id, name').order('name');
      rows.push(['Catégorie', 'Sous-catégorie', 'Nom produit', 'Référence', 'Description']);
      for (const cat of (cats || [])) {
        const { data: subs } = await supabase.from('subcategories').select('id, name').eq('category_id', cat.id).order('name');
        for (const sub of (subs || [])) {
          const { data: prods } = await supabase.from('products').select('name, product_code, description').eq('subcategory_id', sub.id).order('name');
          for (const p of (prods || [])) {
            rows.push([cat.name, sub.name, p.name, p.product_code || '', p.description || '']);
          }
        }
      }
      fileName = 'catalogue_complet.csv';
    }

    if (rows.length === 0) return;
    const csvContent = rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    let imageUrl = activeItem?.image_url || null;

    if (formData.image) {
      if (!formData.image.type.startsWith('image/')) {
        toast('Le fichier doit être une image (JPG, PNG, WebP…)', 'error');
        setUploading(false); return;
      }
      if (formData.image.size > 5 * 1024 * 1024) {
        toast("L'image ne doit pas dépasser 5 Mo.", 'error');
        setUploading(false); return;
      }
      const fileName = `${Date.now()}_${formData.image.name}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, formData.image);
      if (uploadError) {
        toast("Erreur upload image : " + uploadError.message, 'error');
        setUploading(false);
        return;
      }
      const { data: publicRes } = supabase.storage.from('images').getPublicUrl(fileName);
      imageUrl = publicRes.publicUrl;
    }

    const table = view === 'categories' ? 'categories' : view === 'subcategories' ? 'subcategories' : 'products';
    const payload = { 
      name: formData.name, 
      image_url: imageUrl,
      ...(view === 'subcategories' && selection.category?.id && { category_id: selection.category.id }),
      ...(view === 'products' && selection.subcategory?.id && { 
        subcategory_id: selection.subcategory.id, 
        product_code: formData.code, 
        description: formData.desc 
      })
    };

    const { error } = activeItem 
      ? await supabase.from(table).update(payload).eq('id', activeItem.id)
      : await supabase.from(table).insert([payload]);

    if (!error) {
      setShowForm(false);
      fetchData();
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-site py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        <AdminNav />
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            {view !== 'categories' && (
              <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition w-fit">
                <ArrowLeft size={20} /> Retour
              </button>
            )}
          </div>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-slate-900 capitalize">Gestion {view}</h1>
              <p className="text-slate-500 mt-2">
                {view === 'subcategories' && selection.category && `Dans : ${selection.category.name}`}
                {view === 'products' && selection.subcategory && `Dans : ${selection.subcategory.name}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={exportCSV} className="bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 hover:border-blue-200 transition">
                <Download size={18} /> Exporter CSV
              </button>
              {view === 'products' && (
                <button onClick={() => setShowBulkDesc(true)} className="bg-slate-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition">
                  <Pencil size={18} /> Description en masse
                </button>
              )}
              <button onClick={() => openForm()} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition">
                <Plus size={20} /> Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Liste Items */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? <Loader className="animate-spin mx-auto mt-20 text-blue-600" size={40} /> : 
            data.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                    {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : <div className="m-auto h-full flex items-center justify-center text-slate-300"><Package size={24}/></div>}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{item.name}</h3>
                    {item.product_code && <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">#{item.product_code}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => openForm(item)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
                    <Pencil size={18} />
                  </button>
                  {(view === 'subcategories' || view === 'products') && (
                    <button onClick={() => openMove(item)} className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition" title="Déplacer">
                      <FolderInput size={18} />
                    </button>
                  )}
                  <button onClick={() => { setActiveItem(item); setShowDelete(true); }} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition">
                    <Trash2 size={18} />
                  </button>
                  {view !== 'products' && (
                    <button 
                      onClick={() => {
                        if (view === 'categories') { setSelection({...selection, category: item}); setView('subcategories'); }
                        else { setSelection({...selection, subcategory: item}); setView('products'); }
                      }}
                      className="ml-4 p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition"
                    >
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* MODALE FORMULAIRE */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600"><X size={24} /></button>
            <h2 className="text-2xl font-black mb-8">{activeItem ? 'Modifier' : 'Ajouter'} {view.slice(0, -1)}</h2>
            <form onSubmit={handleSave} className="space-y-5">
              {view === 'products' && <input type="text" placeholder="Référence" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500" />}
              <input type="text" placeholder="Nom" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500" required />
              {view === 'products' && <textarea placeholder="Description" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500" rows="3" />}
              <input type="file" onChange={e => setFormData({...formData, image: e.target.files[0]})} className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:bg-blue-50 file:text-blue-700 file:border-0 font-bold" />
              <button disabled={uploading} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-lg hover:bg-blue-700 transition">
                {uploading ? <Loader className="animate-spin mx-auto" /> : 'Enregistrer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DÉPLACEMENT */}
      {showMove && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 relative">
            <button onClick={() => setShowMove(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600"><X size={24} /></button>
            <h2 className="text-2xl font-black mb-2">Déplacer</h2>
            <p className="text-slate-500 mb-6 text-sm">
              Déplacer <strong>"{moveItem?.name}"</strong> vers{' '}
              {view === 'subcategories' ? 'une autre catégorie' : 'une autre sous-catégorie'}.
            </p>
            <select
              value={moveTargetId}
              onChange={e => setMoveTargetId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-amber-400 mb-6 text-slate-700 font-medium"
            >
              <option value="">— Sélectionner une destination —</option>
              {moveOptions.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {view === 'products' && opt.categories ? `${opt.categories.name} › ${opt.name}` : opt.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleMove}
              disabled={moveLoading || !moveTargetId}
              className="w-full bg-amber-500 text-white font-black py-5 rounded-2xl shadow-lg hover:bg-amber-600 transition disabled:opacity-50"
            >
              {moveLoading ? <Loader className="animate-spin mx-auto" size={22} /> : 'Confirmer le déplacement'}
            </button>
          </div>
        </div>
      )}

      {/* MODALE DESCRIPTION EN MASSE */}
      {showBulkDesc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 relative">
            <button onClick={() => setShowBulkDesc(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600"><X size={24} /></button>
            <h2 className="text-2xl font-black mb-2">Description en masse</h2>
            <p className="text-slate-500 mb-6 text-sm">Cette description sera appliquée à <strong>tous les produits</strong> de la sous-catégorie <strong>"{selection.subcategory?.name}"</strong>.</p>
            <textarea
              value={bulkDesc}
              onChange={e => setBulkDesc(e.target.value)}
              placeholder="Ex : Cylindres de sécurité haute performance pour tous types de serrures..."
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-6"
            />
            <button
              onClick={handleBulkDesc}
              disabled={bulkLoading || !bulkDesc.trim()}
              className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {bulkLoading ? <Loader className="animate-spin mx-auto" size={22} /> : 'Appliquer à tous les produits'}
            </button>
          </div>
        </div>
      )}

      {/* MODALE SUPPRESSION */}
      {showDelete && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40} /></div>
            <h2 className="text-2xl font-black mb-4">Supprimer ?</h2>
            <p className="text-slate-500 mb-8 font-medium">Cette action est définitive pour cet élément et tout son contenu.</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} className="py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition shadow-lg shadow-red-100">Confirmer la suppression</button>
              <button onClick={() => setShowDelete(false)} className="py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;