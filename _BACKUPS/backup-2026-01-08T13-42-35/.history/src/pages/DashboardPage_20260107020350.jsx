import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Save, Lock, Loader, CheckCircle2, AlertCircle } from 'lucide-react';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingPw, setUpdatingPw] = useState(false);
  const [user, setUser] = useState(null);
  
  const [profile, setProfile] = useState({
    full_name: '', societe: '', siret: '', phone: '', zip_code: '', city: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile({
          full_name: data.full_name || '',
          societe: data.societe || '',
          siret: data.siret || '',
          phone: data.phone || '',
          zip_code: data.zip_code || '',
          city: data.city || ''
        });
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  // Validations
  const isSiretValid = profile.siret.length === 14;
  const isPhoneValid = profile.phone.length === 10;
  const isZipValid = profile.zip_code.length === 5;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!isSiretValid || !isPhoneValid || !isZipValid) {
      alert("Veuillez remplir correctement les champs SIRET (14 chiffres), Téléphone (10) et Code Postal (5).");
      return;
    }
    
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...profile,
      updated_at: new Date()
    });
    
    if (error) alert("Erreur: " + error.message);
    else alert("Profil mis à jour !");
    setSaving(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setUpdatingPw(true);
    // Vérification de l'ancien mdp
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: passwordData.oldPassword,
    });

    if (authError) {
      alert("L'ancien mot de passe est incorrect.");
    } else {
      const { error: updateError } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (updateError) alert(updateError.message);
      else {
        alert("Mot de passe modifié !");
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    }
    setUpdatingPw(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-[#1E293B] mb-12">Mon Compte</h1>

        {/* 1. INFORMATIONS PERSONNELLES */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-10 mb-8">
          <h2 className="text-2xl font-bold text-[#1E293B] mb-8">Informations personnelles</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">Adresse e-mail</label>
                <input type="email" value={user?.email} disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-400 cursor-not-allowed" />
              </div>

              {/* Nom Complet */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">Nom complet</label>
                <input type="text" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>

              {/* Société */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">Société</label>
                <input type="text" value={profile.societe} onChange={(e) => setProfile({...profile, societe: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              {/* SIRET */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 flex justify-between">
                  N° SIRET {profile.siret && (isSiretValid ? <CheckCircle2 size={16} className="text-green-500"/> : <AlertCircle size={16} className="text-red-400"/>)}
                </label>
                <input type="text" maxLength="14" value={profile.siret} onChange={(e) => setProfile({...profile, siret: e.target.value.replace(/\D/g, '')})} className="w-full border border-slate-200 rounded-xl px-4 py-3.5" placeholder="14 chiffres" />
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 flex justify-between">
                  Téléphone {profile.phone && (isPhoneValid ? <CheckCircle2 size={16} className="text-green-500"/> : <AlertCircle size={16} className="text-red-400"/>)}
                </label>
                <input type="text" maxLength="10" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value.replace(/\D/g, '')})} className="w-full border border-slate-200 rounded-xl px-4 py-3.5" placeholder="06..." />
              </div>

              {/* Code Postal */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 flex justify-between">
                  Code Postal {profile.zip_code && (isZipValid ? <CheckCircle2 size={16} className="text-green-500"/> : <AlertCircle size={16} className="text-red-400"/>)}
                </label>
                <input type="text" maxLength="5" value={profile.zip_code} onChange={(e) => setProfile({...profile, zip_code: e.target.value.replace(/\D/g, '')})} className="w-full border border-slate-200 rounded-xl px-4 py-3.5" placeholder="93220" />
              </div>

              {/* Ville */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">Ville</label>
                <input type="text" value={profile.city} onChange={(e) => setProfile({...profile, city: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="GAGNY" />
              </div>

            </div>
            <div className="flex justify-end">
              <button disabled={saving} className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition flex items-center gap-2">
                {saving ? <Loader className="animate-spin" /> : <Save size={20} />} Sauvegarder les modifications
              </button>
            </div>
          </form>
        </div>

        {/* 2. SÉCURITÉ */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-10">
          <h2 className="text-2xl font-bold text-[#1E293B] mb-8">Changer le mot de passe</h2>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input type="password" placeholder="Ancien mot de passe" value={passwordData.oldPassword} onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500" required />
              <input type="password" placeholder="Nouveau mot de passe" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500" required />
              <input type="password" placeholder="Confirmation" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="flex justify-end">
              <button disabled={updatingPw} className="bg-slate-800 hover:bg-black text-white font-bold px-8 py-4 rounded-xl transition flex items-center gap-2">
                {updatingPw ? <Loader className="animate-spin" /> : <Lock size={18} />} Mettre à jour le mot de passe
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;