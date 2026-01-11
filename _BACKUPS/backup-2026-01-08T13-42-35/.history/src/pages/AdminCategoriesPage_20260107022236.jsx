import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Plus, Pencil, Trash2, ChevronRight, ArrowLeft, 
  Package, Layers, LayoutGrid, AlertTriangle, X, Loader 
} from 'lucide-react';

const AdminCategoriesPage = () => {
  const [view, setView] = useState('categories'); // 'categories', 'subcategories', 'products'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState({ category: null, subcategory: null });

  // États Modales
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Formulaire unique
  const [formData, setFormData] = useState({ name: '', code: '', desc: '', image: null });

  useEffect(() => {
    fetchData();
  }, [view, selection]);

  const fetchData = async () => {
    setLoading(true);
    let query;
    if (view === 'categories') {
      query = supabase.from('categories').select('*').order('name');
    } else if (view === 'subcategories') {
      query = supabase.from('subcategories').select('*').eq('category_id', selection.category.id).order('name');
    } else {
      query = supabase.from('products').select('*').eq('subcategory_id', selection.subcategory.id).order('name');
    }
    const { data: res } = await query;
    setData(res || []);
    setLoading(false);
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
      setFormData({ name: '', code: '', desc: '', image: null });
    }
    setShowForm(true);
  };

  const handleDelete = async () => {
    const table = view === 'categories' ? 'categories' : view === 'subcategories' ? 'subcategories' : 'products';
    const { error } = await supabase.from(table).delete().eq('id', activeItem.id);
    if (!error) {
      setShowDelete(false);
      fetchData();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    let imageUrl = activeItem?.image_url || null;

    if (formData.image) {
      const fileName = `${Date.now()}_${formData.image.name}`;
      await supabase.storage.from('images').upload(fileName, formData.image);
      const { data: publicRes } = supabase.storage.from('images').getPublicUrl(fileName);
      imageUrl = publicRes.publicUrl;
    }

    const table = view === 'categories' ? 'categories' : view === 'subcategories' ? 'subcategories' : 'products';
    const payload = { 
      name: formData.name, 
      image_url: imageUrl,
      ...(view === 'subcategories' && { category_id: selection.category.id }),
      ...(view === 'products' && { 
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
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation / Header */}
        <div className="mb-10">
          <button onClick={() => view === 'categories' ? window.history.back() : handleBack()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition mb-4">
            <ArrowLeft size={20} /> {view === 'categories' ? 'Retour Dashboard' : 'Retour'}
          </button>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-slate-900 capitalize">Gestion {view}</h1>
              <p className="text-slate-500 mt-2">
                {view === 'subcategories' && `Dans : ${selection.category.name}`}
                {view === 'products' && `Dans : ${selection.subcategory.name}`}
              </p>
            </div>
            <button onClick={() => openForm()} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition">
              <Plus size={20} /> Ajouter
            </button>
          </div>
        </div>

        {/* Liste Items */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? <Loader className="animate-spin mx-auto mt-20 text-blue-600" size={40} /> : 
            data.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                    {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <div className="m-auto h-full flex items-center justify-center text-slate-300"><Package size={24}/></div>}
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