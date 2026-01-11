import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { User, Building2, Mail, Phone, Loader, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // On récupère les infos dans la table profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Erreur de chargement du profil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête du Profil style Soparimex */}
        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/60 p-10 border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-lg">
              <User size={48} className="text-amber-500" />
            </div>
            <div className="text-center md:text-left flex-grow">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{profile?.full_name || 'Utilisateur'}</h1>
              <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
                <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                  {profile?.role === 'developpeur' && <ShieldCheck size={12} />}
                  {profile?.role || 'Client'}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  profile?.status === 'validé' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {profile?.status || 'En attente'}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              {(profile?.role === 'admin' || profile?.role === 'developpeur') && (
                <Link to="/admin" className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100" title="Aller à l'administration">
                  <LayoutDashboard size={20} />
                </Link>
              )}
              <button onClick={handleLogout} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all border border-red-100" title="Se déconnecter">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Grille d'informations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bloc Société */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Building2 size={18} /></div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">Société</h3>
            </div>
            <div className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase">Nom de l'entreprise</label>
                <p className="text-slate-800 font-bold text-lg">{profile?.societe || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase">Numéro SIRET</label>
                <p className="text-slate-800 font-bold tracking-wider">{profile?.siret || 'Non renseigné'}</p>
              </div>
            </div>
          </div>

          {/* Bloc Contact */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Mail size={18} /></div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">Contact</h3>
            </div>
            <div className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase">Email professionnel</label>
                <p className="text-slate-800 font-bold">{profile?.email || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase">Téléphone</label>
                <p className="text-slate-800 font-bold">{profile?.phone || 'Non renseigné'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;