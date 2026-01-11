import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Mail, Building2, Phone, MapPin, Hash, Save, Lock, Loader } from 'lucide-react';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  
  // États pour les champs du formulaire
  const [profile, setProfile] = useState({
    full_name: '',
    societe: '',
    siret: '',
    phone: '',
    zip_code: '',
    city: ''
  });

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Ici on récupère les infos depuis une table 'profiles' si tu l'as créée, 
        // sinon on initialise avec ce qu'on a
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile({
            full_name: data.full_name || '',
            societe: data.societe || '',
            siret: data.siret || '',
            phone: data.phone || '',
            zip_code: data.zip_code || '',
            city: data.city || ''
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        ...profile,
        updated_at: new Date()
      });
      if (error) throw error;
      alert("Profil mis à jour !");
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        <h1 className="text-4xl font-black text-[#1E293B] mb-12">Mon Compte</h1>

        {/* SECTION INFORMATIONS PERSONNELLES */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-10 mb-8">
          <h2 className="text-2xl font-bold text-[#1E293B] mb-8">Informations personnelles</h2>
          
          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Email (Lecture seule souvent) */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">Adresse e-mail</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={user?.email} 
                    disabled 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Nom Complet */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">Nom complet</label>
                <input 
                  type="text" 
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Ex: Nom Prénom"
                />
              </div>

              {/* Société */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">Société</label>
                <input 
                  type="text" 
                  value={profile.societe}
                  onChange={(e) => setProfile({...profile, societe: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Nom de l'entreprise"
                />
              </div>

              {/* SIRET */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">N° SIRET</label>
                <input 
                  type="text" 
                  value={profile.siret}
                  onChange={(e) => setProfile({...profile, siret: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="14 chiffres"
                />
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">Téléphone</label>
                <input 
                  type="text" 
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="06..."
                />
              </div>

              {/* Code Postal */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">Code Postal</label>
                <input 
                  type="text" 
                  value={profile.zip_code}
                  onChange={(e) => setProfile({...profile, zip_code: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="93220"
                />
              </div>

              {/* Ville */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">Ville</label>
                <input 
                  type="text" 
                  value={profile.city}
                  onChange={(e) => setProfile({...profile, city: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="GAGNY"
                />
              </div>

            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                disabled={saving}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-blue-100 flex items-center gap-2"
              >
                {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                Sauvegarder les modifications
              </button>
            </div>
          </form>
        </div>

        {/* SECTION MOT DE PASSE */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-10">
          <h2 className="text-2xl font-bold text-[#1E293B] mb-8">Changer le mot de passe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 ml-1">Nouveau mot de passe</label>
              <input 
                type="password" 
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="••••••••"
              />
            </div>
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-8 py-3.5 rounded-xl transition flex items-center justify-center gap-2">
              <Lock size={18} />
              Mettre à jour le mot de passe
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;