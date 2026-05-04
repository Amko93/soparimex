import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useToast } from '../context/ToastContext';
import AdminNav from '../components/AdminNav';
import {
  User,
  Camera,
  Save,
  Loader,
  Briefcase,
  Phone,
  MapPin,
  FileText,
  X,
} from 'lucide-react';

const CommercialProfilePage = () => {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    job_title: '',
    phone: '',
    city: '',
    bio: '',
    avatar_url: '',
  });

  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) { setLoading(false); return; }

      const { data } = await supabase
        .from('profiles')
        .select('id, role, full_name, job_title, phone, city, bio, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setCurrentUser({ id: data.id, role: data.role });
        setForm({
          full_name:  data.full_name  || '',
          job_title:  data.job_title  || '',
          phone:      data.phone      || '',
          city:       data.city       || '',
          bio:        data.bio        || '',
          avatar_url: data.avatar_url || '',
        });
        if (data.avatar_url) setPreviewUrl(data.avatar_url);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      toast('La photo ne doit pas dépasser 5 Mo.', 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast('Veuillez sélectionner une image.', 'error');
      return;
    }

    setUploadingPhoto(true);
    try {
      // Supprimer l'ancienne photo si elle existe
      if (form.avatar_url) {
        const oldPath = form.avatar_url.split('/storage/v1/object/public/images/')[1];
        if (oldPath) await supabase.storage.from('images').remove([oldPath]);
      }

      const ext = file.name.split('.').pop();
      const path = `avatars/${currentUser.id}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('images').getPublicUrl(path);
      const newUrl = urlData?.publicUrl || '';

      setForm((f) => ({ ...f, avatar_url: newUrl }));
      setPreviewUrl(newUrl);
      toast('Photo mise à jour.', 'success');
    } catch (err) {
      toast('Erreur upload photo : ' + err.message, 'error');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!form.avatar_url || !currentUser?.id) return;
    setUploadingPhoto(true);
    try {
      const oldPath = form.avatar_url.split('/storage/v1/object/public/images/')[1];
      if (oldPath) await supabase.storage.from('images').remove([oldPath]);
      setForm((f) => ({ ...f, avatar_url: '' }));
      setPreviewUrl(null);
      toast('Photo supprimée.', 'success');
    } catch (err) {
      toast('Erreur suppression photo : ' + err.message, 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser?.id || saving) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name:  form.full_name.trim()  || null,
          job_title:  form.job_title.trim()  || null,
          phone:      form.phone.trim()      || null,
          city:       form.city.trim()       || null,
          bio:        form.bio.trim()        || null,
          avatar_url: form.avatar_url        || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);

      if (error) throw error;
      toast('Profil enregistré.', 'success');
    } catch (err) {
      toast('Erreur : ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-site flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'developpeur';

  return (
    <div className="min-h-screen bg-site py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto">
        {isAdmin && (
          <div className="mb-6">
            <AdminNav />
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <User className="text-blue-600" size={32} />
            Mon profil
          </h1>
          <p className="text-slate-500 mt-1">
            Votre fiche visible par l'équipe et les clients.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Photo de profil */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2">
              <Camera size={20} className="text-blue-600" /> Photo de profil
            </h2>

            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Photo de profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-slate-300" />
                  )}
                </div>
                {uploadingPhoto && (
                  <div className="absolute inset-0 rounded-2xl bg-white/70 flex items-center justify-center">
                    <Loader className="animate-spin text-blue-600" size={24} />
                  </div>
                )}
              </div>

              {/* Boutons */}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  <Camera size={16} />
                  {previewUrl ? 'Changer la photo' : 'Ajouter une photo'}
                </button>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={uploadingPhoto}
                    className="px-4 py-2.5 bg-slate-100 text-red-500 font-bold rounded-xl hover:bg-red-50 transition text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    <X size={16} /> Supprimer
                  </button>
                )}
                <p className="text-xs text-slate-400">JPG, PNG, WebP — 5 Mo max</p>
              </div>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600" /> Informations
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">
                  Nom complet
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    placeholder="Prénom Nom"
                    className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">
                  Poste / Titre
                </label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={form.job_title}
                    onChange={(e) => setForm((f) => ({ ...f, job_title: e.target.value }))}
                    placeholder="Ex : Responsable commercial"
                    className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+33 6 00 00 00 00"
                    className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">
                  Ville
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="Paris"
                    className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-bold text-slate-600 mb-1.5">
                <FileText size={14} className="inline mr-1" />
                Présentation courte
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={4}
                placeholder="Décrivez votre rôle, votre expertise, comment vous pouvez aider les clients..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                maxLength={500}
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{form.bio.length}/500</p>
            </div>
          </div>

          {/* Bouton enregistrer */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-100 text-base"
          >
            {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
            Enregistrer le profil
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommercialProfilePage;
