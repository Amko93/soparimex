import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { User, Building2, Phone, Loader, LayoutDashboard, ShieldCheck, Edit3, Save, X, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [editForm, setEditForm] = useState({
    full_name: '',
    societe: '',
    siret: '',
    phone: ''
  });

  const [showSecurity, setShowSecurity] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const msgTimerRef = useRef(null);
  const pwMsgTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(msgTimerRef.current);
      clearTimeout(pwMsgTimerRef.current);
    };
  }, []);

  useEffect(() => {
    fetchProfile();
    const fallback = setTimeout(() => {
      setLoading(false);
      setLoadError(true); // timeout dépassé → profil non chargé
    }, 10000);
    return () => clearTimeout(fallback);
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
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // On ne met à jour QUE les infos autorisées (pas le rôle, pas l'email)
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
      setMessage({ type: 'success', text: 'Profil mis à jour !' });
      clearTimeout(msgTimerRef.current);
      msgTimerRef.current = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch {
      setMessage({ type: 'error', text: 'Erreur de mise à jour.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Veuillez remplir tous les champs.' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    setPasswordLoading(true);
    try {
      // 1. Vérifier l'ancien mot de passe via re-authentification
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: passwordForm.currentPassword,
      });
      if (signInError) {
        setPasswordMessage({ type: 'error', text: 'Mot de passe actuel incorrect.' });
        return;
      }

      // 2. Ancien mdp correct → mettre à jour
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
      if (error) throw error;

      setPasswordMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès !' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      clearTimeout(pwMsgTimerRef.current);
      pwMsgTimerRef.current = setTimeout(() => {
        setPasswordMessage({ type: '', text: '' });
        setShowSecurity(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setPasswordMessage({ type: 'error', text: err.message || 'Erreur lors de la mise à jour du mot de passe.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-site">
      <Loader className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (loadError || !profile) return (
    <div className="min-h-screen flex items-center justify-center bg-site px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center max-w-md">
        <p className="text-slate-700 font-bold text-lg mb-2">Impossible de charger votre profil.</p>
        <p className="text-slate-500 text-sm mb-6">Vérifiez votre connexion et réessayez.</p>
        <button
          onClick={() => { setLoadError(false); setLoading(true); fetchProfile(); }}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
        >
          Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-site py-16 px-6 font-sans">
      <div className="max-w-4xl mx-auto text-left">
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl font-bold text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* Header Profil */}
        <div className="bg-white rounded-[3rem] shadow-xl p-10 border border-slate-100 mb-8 transition-colors">
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
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{profile?.full_name}</h1>
              )}
              <div className="flex gap-3 mt-3 justify-center md:justify-start">
                <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                  <ShieldCheck size={12} /> {profile?.role}
                </span>
                <span className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 flex items-center gap-2">
                  <Lock size={12} /> Rôle protégé
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              {(profile?.role === 'admin' || profile?.role === 'developpeur') && (
                <Link to="/admin" className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all">
                  <LayoutDashboard size={20} />
                </Link>
              )}
              <button onClick={() => setIsEditing(!isEditing)} className="p-4 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                {isEditing ? <X size={20} /> : <Edit3 size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Grille Infos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Building2 size={16} /> Société</h3>
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

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Phone size={16} /> Contact</h3>
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
                <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">Email <Lock size={8}/> </label>
                <p className="text-slate-400 font-bold italic">{profile?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Sécurité */}
        <div className="mt-6 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Lock size={16} /> Sécurité
            </h3>
            <button
              onClick={() => setShowSecurity(!showSecurity)}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition"
            >
              {showSecurity ? 'Masquer' : 'Changer mon mot de passe'}
            </button>
          </div>

          {showSecurity && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordMessage.text && (
                <div className={`p-4 rounded-xl font-bold ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {passwordMessage.text}
                </div>
              )}
              
              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase block mb-2">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full bg-slate-50 border p-3 pr-10 rounded-lg font-bold"
                    placeholder="Votre mot de passe actuel"
                    disabled={passwordLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase block mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full bg-slate-50 border p-3 pr-10 rounded-lg font-bold"
                    placeholder="Minimum 8 caractères"
                    disabled={passwordLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase block mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full bg-slate-50 border p-3 pr-10 rounded-lg font-bold"
                    placeholder="Répétez le mot de passe"
                    disabled={passwordLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={passwordLoading}
                style={{ backgroundColor: colors.primaryButton }}
                className="w-full text-white font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? <Loader className="animate-spin" /> : <><Lock size={18} /> Mettre à jour le mot de passe</>}
              </button>
            </form>
          )}
        </div>

        {isEditing && (
          <button 
            onClick={handleUpdateProfile} 
            disabled={saving}
            style={{ backgroundColor: colors.primaryButton }}
            className="w-full mt-8 text-white font-black py-5 rounded-[1.5rem] shadow-xl flex items-center justify-center gap-3 transition-all"
          >
            {saving ? <Loader className="animate-spin" /> : <><Save size={20} /> Enregistrer</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;