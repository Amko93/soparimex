import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { User, Building2, Mail, Phone, Loader, LogOut, LayoutDashboard, ShieldCheck, Edit3, Save, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // État pour le formulaire de modification
  const [editForm, setEditForm] = useState({
    full_name: '',
    societe: '',
    siret: '',
    phone: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setEditForm({
        full_name: data.full_name || '',
        societe: data.societe || '',
        siret: data.siret || '',
        phone: data.phone || ''
      });
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          societe: editForm.societe,
          siret: editForm.siret,
          phone: editForm.phone
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 px-6 font-sans">
      <div className="max-w-4xl mx-auto text-left">
        
        {/* Alerte de message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl font-bold text-center animate-bounce ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* Header Profil */}
        <div className="bg-white rounded-[3rem] shadow-xl p-10 border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-lg">
              <User size={48} className="text-amber-500" />
            </div>
            <div className="flex-grow text-center md:text-left">
              {isEditing ? (
                <input 
                  className="text-3xl font-black text-slate-900 bg-slate-50 border-b-2 border-blue-500 outline-none w-full"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                />
              ) : (
                <h1 className="text-3xl font-black text-slate-900">{profile?.full_name}</h1>
              )}
              <div className="flex gap-3 mt-3 justify-center md:justify-start">
                <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                  <ShieldCheck size={12} /> {profile?.role}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="p-4 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-100 transition-all border border-amber-100" title="Modifier">
                  <Edit3 size={20} />
                </button>
              ) : (
                <button onClick={() => setIsEditing(false)} className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all border border-slate-200">
                  <X size={20} />
                </button>
              )}
              <button onClick={handleLogout} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all border border-red-100">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Formulaire / Détails */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bloc Société */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Building2 size={16} /> Société
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase">Entreprise</label>
                {isEditing ? (
                  <input className="w-full bg-slate-50 border p-2 rounded-lg font-bold" value={editForm.societe} onChange={(e) => setEditForm({...editForm, societe: e.target.value})} />
                ) : (
                  <p className="text-slate-800 font-bold">{profile?.societe}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase">SIRET</label>
                {isEditing ? (
                  <input className="w-full bg-slate-50 border p-2 rounded-lg font-bold" value={editForm.siret} onChange={(e) => setEditForm({...editForm, siret: e.target.value})} />
                ) : (
                  <p className="text-slate-800 font-bold">{profile?.siret}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bloc Contact */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Phone size={16} /> Contact
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase">Téléphone</label>
                {isEditing ? (
                  <input className="w-full bg-slate-50 border p-2 rounded-lg font-bold" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
                ) : (
                  <p className="text-slate-800 font-bold">{profile?.phone}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase">Email (non modifiable)</label>
                <p className="text-slate-400 font-bold">{profile?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <button 
            onClick={handleUpdateProfile} 
            disabled={saving}
            className="w-full mt-8 bg-blue-600 text-white font-black py-5 rounded-3xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
          >
            {saving ? <Loader className="animate-spin" /> : <><Save size={20} /> Enregistrer les modifications</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;