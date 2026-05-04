import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useToast } from '../../context/ToastContext';
import AdminNav from '../../components/AdminNav';
import {
  ArrowLeft,
  User,
  Building2,
  Mail,
  Phone,
  Hash,
  Calendar,
  Shield,
  CheckCircle,
  Clock,
  Loader,
  UserCheck,
  Trash2,
  MessageSquare,
  FileText,
  AlertTriangle,
  X,
  Save,
  Briefcase,
  MapPin,
} from 'lucide-react';

const AdminUserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [showEditRole, setShowEditRole] = useState(false);
  const [editRole, setEditRole] = useState('');
  const [editValidated, setEditValidated] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data } = await supabase.from('profiles').select('id, role').eq('id', session.user.id).single();
        if (data) setCurrentUser({ id: data.id, role: (data.role || '').toLowerCase() });
      }
    };
    init();
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, leadsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase
          .from('lead_requests')
          .select('id, title, status, created_at')
          .eq('client_id', id)
          .order('created_at', { ascending: false }),
      ]);

      if (profileRes.error || !profileRes.data) {
        toast('Utilisateur introuvable.', 'error');
        navigate('/admin/users');
        return;
      }

      setProfile(profileRes.data);
      setEditRole((profileRes.data.role || 'client').toLowerCase());
      setEditValidated(!!profileRes.data.is_validated);
      setLeads(leadsRes.data || []);
    } catch (err) {
      console.error(err);
      toast('Erreur chargement profil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'client', is_validated: true })
        .eq('id', id);
      if (error) throw error;
      toast('Compte validé avec succès.', 'success');
      fetchData();
    } catch (err) {
      toast('Erreur : ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveRole = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: editRole, is_validated: editValidated })
        .eq('id', id);
      if (error) throw error;
      toast('Profil mis à jour.', 'success');
      setShowEditRole(false);
      fetchData();
    } catch (err) {
      toast('Erreur : ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    const reason = deleteReason.trim();
    if (!reason) { toast('Veuillez indiquer une raison.', 'error'); return; }

    setActionLoading(true);
    try {
      // Edge Function : supprime le profil ET le compte auth en une seule opération
      const { error } = await supabase.functions.invoke('delete-user', {
        body: {
          userId: id,
          email: profile.email || '',
          fullName: profile.full_name || '',
          societe: profile.societe || '',
          reason,
        },
      });
      if (error) throw error;

      toast('Utilisateur supprimé définitivement.', 'success');
      navigate('/admin/users');
    } catch (err) {
      toast('Erreur : ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name?.trim()) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.trim().slice(0, 2).toUpperCase();
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const statusBadge = (status) => {
    const map = {
      nouveau:   { label: 'Nouveau',   cls: 'bg-blue-100 text-blue-700' },
      en_cours:  { label: 'En cours',  cls: 'bg-amber-100 text-amber-700' },
      cloture:   { label: 'Clôturé',   cls: 'bg-slate-100 text-slate-500' },
    };
    const s = map[status] || { label: status, cls: 'bg-slate-100 text-slate-500' };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${s.cls}`}>
        {s.label}
      </span>
    );
  };

  const roleBadge = (role) => {
    const r = (role || '').toLowerCase();
    const map = {
      admin:       'bg-purple-100 text-purple-700',
      developpeur: 'bg-slate-200 text-slate-700',
      commercial:  'bg-emerald-100 text-emerald-700',
      client:      'bg-blue-100 text-blue-700',
      pending:     'bg-amber-100 text-amber-700',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase ${map[r] || 'bg-slate-100 text-slate-500'}`}>
        <Shield size={12} /> {role || '—'}
      </span>
    );
  };

  const isAdmin = (role) => ['admin', 'developpeur'].includes((role || '').toLowerCase());
  const isSelf = profile?.id === currentUser?.id;
  const canAct = !isSelf && !isAdmin(profile?.role);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <AdminNav />

        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition mb-6"
        >
          <ArrowLeft size={18} /> Retour aux utilisateurs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── COLONNE GAUCHE ─── */}
          <div className="space-y-5">

            {/* Carte identité */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
              <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4 flex-shrink-0 border border-slate-200">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Profil'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white font-black text-2xl">
                    {getInitials(profile.full_name)}
                  </div>
                )}
              </div>
              <h1 className="text-xl font-black text-slate-900">{profile.full_name || '—'}</h1>
              {profile.job_title && (
                <p className="text-blue-600 font-bold text-sm mt-0.5">{profile.job_title}</p>
              )}
              {profile.societe && (
                <p className="text-slate-500 font-medium text-sm mt-1 flex items-center justify-center gap-1">
                  <Building2 size={14} /> {profile.societe}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {roleBadge(profile.role)}
                {profile.is_validated ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700">
                    <CheckCircle size={12} /> Validé
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700">
                    <Clock size={12} /> En attente
                  </span>
                )}
              </div>
            </div>

            {/* Coordonnées */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Coordonnées</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Email</p>
                    <p className="text-slate-800 font-medium text-sm">{profile.email || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Téléphone</p>
                    <p className="text-slate-800 font-medium text-sm">{profile.phone || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Hash size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">SIRET</p>
                    <p className="text-slate-800 font-medium text-sm font-mono">{profile.siret || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Inscrit le</p>
                    <p className="text-slate-800 font-medium text-sm">{formatDate(profile.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {canAct && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</h2>

                {!profile.is_validated && (
                  <button
                    onClick={handleValidate}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {actionLoading ? <Loader className="animate-spin" size={18} /> : <UserCheck size={18} />}
                    Valider le compte
                  </button>
                )}

                <button
                  onClick={() => setShowEditRole(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition border border-blue-200"
                >
                  <Shield size={18} /> Modifier le rôle
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition border border-red-200"
                >
                  <Trash2 size={18} /> Supprimer le compte
                </button>
              </div>
            )}
          </div>

          {/* ─── COLONNE DROITE ─── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Fiche profil commercial/admin */}
            {(['admin', 'developpeur', 'commercial'].includes((profile.role || '').toLowerCase())) && (
              (profile.job_title || profile.bio || profile.city) ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase size={14} /> Fiche profil
                  </h2>
                  <div className="flex gap-4 flex-wrap">
                    {profile.avatar_url && (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || 'Photo'}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      {profile.job_title && (
                        <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <Briefcase size={14} className="text-slate-400" /> {profile.job_title}
                        </p>
                      )}
                      {profile.email && (
                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                          <Mail size={14} className="text-slate-400" /> {profile.email}
                        </p>
                      )}
                      {profile.city && (
                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-400" /> {profile.city}
                        </p>
                      )}
                      {profile.bio && (
                        <p className="text-sm text-slate-600 leading-relaxed mt-2 whitespace-pre-wrap">{profile.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-5 text-center text-slate-400 text-sm">
                  <Briefcase size={20} className="mx-auto mb-2 opacity-40" />
                  Fiche profil non renseignée.
                </div>
              )
            )}

            {/* Stats rapides */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-3xl font-black text-slate-900">{leads.length}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 flex items-center gap-1">
                  <FileText size={13} /> Dossiers créés
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-3xl font-black text-slate-900">
                  {leads.filter(l => l.status === 'en_cours').length}
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 flex items-center gap-1">
                  <MessageSquare size={13} /> En cours
                </p>
              </div>
            </div>

            {/* Liste des dossiers */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={18} className="text-slate-500" /> Dossiers de ce client
                </h2>
              </div>
              {leads.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-400 text-sm">
                  Aucun dossier pour ce client.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <Link
                      key={lead.id}
                      to={`/admin/leads/${lead.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition">
                          {lead.title || 'Sans titre'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(lead.created_at)}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {statusBadge(lead.status)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal modification rôle */}
      {showEditRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900">Modifier le rôle</h2>
              <button onClick={() => setShowEditRole(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Rôle</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="client">Client</option>
                  <option value="commercial">Commercial</option>
                  <option value="pending">En attente (pending)</option>
                  {currentUser?.role === 'developpeur' && <option value="admin">Admin</option>}
                  {currentUser?.role === 'developpeur' && <option value="developpeur">Développeur</option>}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Statut</label>
                <select
                  value={editValidated ? 'yes' : 'no'}
                  onChange={(e) => setEditValidated(e.target.value === 'yes')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="yes">Validé</option>
                  <option value="no">En attente</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveRole}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {actionLoading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                  Enregistrer
                </button>
                <button onClick={() => setShowEditRole(false)} className="px-5 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Confirmer la suppression</h2>
              <button onClick={() => setShowDeleteModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleDelete} className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">
                  Vous allez supprimer <strong>{profile.full_name || profile.email}</strong>. Cette action est irréversible.
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">
                  Raison de la suppression <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  rows={3}
                  required
                  placeholder="Ex : refus d'inscription, demande du client..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition disabled:opacity-50"
                >
                  {actionLoading ? <Loader className="animate-spin" size={18} /> : <Trash2 size={18} />}
                  Supprimer
                </button>
                <button type="button" onClick={() => setShowDeleteModal(false)} className="px-5 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserProfilePage;
