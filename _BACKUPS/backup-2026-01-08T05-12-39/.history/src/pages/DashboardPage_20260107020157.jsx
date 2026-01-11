import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Save, Lock, Loader, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

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
        if (data) setProfile(data);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  // --- FONCTIONS DE VALIDATION VISUELLE ---
  const isSiretValid = profile.siret.length === 14;
  const isPhoneValid = profile.phone.replace(/\s/g, '').length === 10;
  const isZipValid = profile.zip_code.length === 5;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!isSiretValid || !isPhoneValid || !isZipValid) {
      alert("Veuillez corriger les erreurs dans le formulaire avant de sauvegarder.");
      return;
    }
    
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...profile,
      updated_at: new Date()
    });
    
    if (error) alert("Erreur: " + error.message);
    else alert("Profil mis à jour avec succès !");
    setSaving(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setUpdatingPw(true);

    // Étape 1 : Vérifier l'ancien mot de passe en tentant une re-connexion
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: passwordData.oldPassword,
    });

    if (signInError) {
      alert("L'ancien mot de passe est incorrect.");
      setUpdatingPw(false);
      return;
    }

    // Étape 2 : Si l'ancien est correct, on met à jour avec le nouveau
    const { error: updateError } = await supabase.auth.updateUser({ 
      password: passwordData.newPassword 
    });

    if (updateError) {
      alert("Erreur lors de la mise à jour : " + updateError.message);
    } else {
      alert("Mot de passe modifié avec succès !");
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    }
    setUpdatingPw(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-[#1E293B] mb-12">Mon Compte</h1>

        {/* SECTION INFOS PERSONNELLES */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-10 mb-8">
          <h2 className="text-2xl font-bold text-[#1E293B] mb-8">Informations personnelles</h2>
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500">Nom complet</label>
              <input type="text" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
            </div>

            {/* SIRET avec validation visuelle */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 flex justify-between">
                N° SIRET (14 chiffres)
                {profile.siret && (isSiretValid ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-400" />)}
              </label>
              <input 
                type="text" 
                maxLength="14" 
                value={profile.siret} 
                onChange={(e) => setProfile({...profile, siret: e.target.value.replace(/\D/g, '')})} 
                className={`w-full border rounded-xl px-4 py-3.5 outline-none transition-all ${profile.siret && !isSiretValid ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>

            {/* Téléphone avec validation visuelle */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 flex justify-between">
                Téléphone (10 chiffres)
                {profile.phone && (isPhoneValid ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-400" />)}
              </label>
              <input 
                type="text" 
                maxLength="10" 
                value={profile.phone} 
                onChange={(e) => setProfile({...profile, phone: e.target.value.replace(/\D/g, '')})} 
                className={`w-full border rounded-xl px-4 py-3.5 outline-none transition-all ${profile.phone && !isPhoneValid ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>

            {/* Code Postal avec validation visuelle */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 flex justify-between">
                Code Postal (5 chiffres)
                {profile.zip_code && (isZipValid ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-400" />)}
              </label>
              <input 
                type="text" 
                maxLength="5" 
                value={profile.zip_code} 
                onChange={(e) => setProfile({...profile, zip_code: e.target.value.replace(/\D/g, '')})} 
                className={`w-full border rounded-xl px-4 py-3.5 outline-none transition-all ${profile.zip_code && !isZipValid ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>

            <div className="md:col-span-2 flex justify-end pt-4">
              <button disabled={saving} className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-xl shadow-lg transition flex items-center gap-2">
                {saving ? <Loader className="animate-spin" /> : <Save size={20} />} Sauvegarder les modifications
              </button>
            </div>
          </form>
        </div>

        {/* SECTION SÉCURITÉ (MOT DE PASSE) */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-10">
          <h2 className="text-2xl font-bold text-[#1E293B] mb-8">Changer le mot de passe</h2>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Ancien mot de passe</label>
                <input 
                  type="password" 
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nouveau mot de passe</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Confirmation</label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none" 
                  required 
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button disabled={updatingPw} className="bg-slate-800 hover:bg-black text-white font-bold px-8 py-4 rounded-xl transition flex items-center gap-2 shadow-md">
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