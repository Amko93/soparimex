import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useToast } from '../context/ToastContext';
import AdminNav from '../components/AdminNav';
import {
  ArrowLeft,
  Users,
  Loader,
  LayoutGrid,
  Mail,
  UserCheck,
  Pencil,
  Trash2,
  Search,
  X,
  Save,
  AlertTriangle,
  History,
} from 'lucide-react';

const AdminUsersPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // { id, role }

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      const { data } = await supabase.from('profiles').select('id, role').eq('id', session.user.id).single();
      if (data) setCurrentUser({ id: data.id, role: (data.role || '').toLowerCase() });
    };
    loadCurrentUser();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const q = searchTerm.toLowerCase().trim();
    return users.filter(
      (u) =>
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.societe || '').toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

  const isPending = (user) => {
    const r = (user.role || '').toLowerCase();
    if (r === 'admin' || r === 'developpeur') return false;
    return r === 'pending' || user.is_validated === false;
  };

  const handleValidate = async (user) => {
    setActionLoading(user.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'client', is_validated: true })
        .eq('id', user.id);
      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      console.error(err);
      toast('Erreur : ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteModal = (user) => {
    setDeleteModal({ user, reason: '' });
  };

  const confirmDelete = async (e) => {
    e.preventDefault();
    const reason = (deleteModal?.reason || '').trim();
    if (!reason) {
      toast('Veuillez indiquer la raison de la suppression.', 'info');
      return;
    }
    const user = deleteModal?.user;
    if (!user?.id) return;
    setActionLoading(user.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const deletedBy = session?.user?.id ?? null;
      const deletedByEmail = session?.user?.email ?? '';

      const { error: logError } = await supabase.from('deleted_users_logs').insert({
        deleted_at: new Date().toISOString(),
        email: user.email || '',
        full_name: user.full_name || '',
        societe: user.societe || '',
        reason,
        deleted_by: deletedBy,
        deleted_by_email: deletedByEmail,
      });
      if (logError) throw logError;

      const { error: delError } = await supabase.from('profiles').delete().eq('id', user.id);
      if (delError) throw delError;

      await fetchUsers();
      setDeleteModal(null);
      if (editModal?.user?.id === user.id) setEditModal(null);
    } catch (err) {
      console.error(err);
      toast('Erreur : ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (user) => {
    setEditModal({
      open: true,
      user: { ...user },
      form: {
        full_name: user.full_name || '',
        societe: user.societe || '',
        phone: user.phone || '',
        role: (user.role || 'client').toLowerCase(),
        is_validated: !!user.is_validated,
      },
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editModal?.user?.id) return;
    setActionLoading(editModal.user.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editModal.form.full_name || null,
          societe: editModal.form.societe || null,
          phone: editModal.form.phone || null,
          role: editModal.form.role || 'client',
          is_validated: editModal.form.is_validated,
        })
        .eq('id', editModal.user.id);
      if (error) throw error;
      await fetchUsers();
      setEditModal(null);
    } catch (err) {
      console.error(err);
      toast('Erreur : ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const roleLabel = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'pending') return 'En attente';
    if (r === 'client') return 'Client';
    if (r === 'admin') return 'Admin';
    if (r === 'developpeur') return 'Développeur';
    return role || '—';
  };

  const roleBadgeClass = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'pending') return 'bg-amber-100 text-amber-700';
    if (r === 'client') return 'bg-blue-50 text-blue-600';
    if (r === 'admin' || r === 'developpeur') return 'bg-purple-100 text-purple-600';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="min-h-screen bg-site py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation admin + Retour */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <AdminNav />
        </div>

        {/* Titre + Lien historique */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Gestion des utilisateurs</h1>
            <p className="text-slate-500 mt-1 text-sm">CRUD complet : recherche, validation, édition et suppression.</p>
          </div>
          <Link
            to="/admin/deleted-users"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-red-200 hover:text-red-600 transition w-fit"
          >
            <History size={18} /> Voir l'historique des suppressions
          </Link>
        </div>

        {/* Barre d'outils : recherche */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-800 font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                aria-label="Effacer"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <div className="text-sm text-slate-500 font-medium">
            {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader className="animate-spin text-blue-600" size={40} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Date</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Nom</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Société</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Email</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Rôle</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Statut</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center text-slate-500 font-medium">
                        {searchTerm ? 'Aucun résultat pour cette recherche.' : 'Aucun utilisateur.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      // Nettoyage agressif du rôle
                      const roleString = String(user.role || '').toLowerCase().trim();
                      
                      // Est-ce que c'est un admin ou dev ?
                      const isAdmin = roleString.includes('admin') || roleString.includes('developpeur');
                      
                      // Est-ce que c'est moi ?
                      const isSelf = user.id === currentUser?.id;

                      // On affiche les actions SI : Ce n'est pas moi ET Ce n'est pas un admin.
                      // Donc Commercial (même mal écrit) devrait passer car il n'est pas "admin".
                      const showActions = !isSelf && !isAdmin;

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                        >
                          <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(user.created_at)}</td>
                          <td className="px-4 py-4 font-semibold text-slate-800">{user.full_name || '—'}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{user.societe || '—'}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{user.email || '—'}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center text-xs font-bold uppercase px-2.5 py-1 rounded-md ${roleBadgeClass(user.role)}`}>
                              {roleLabel(user.role)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {user.is_validated ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                                <UserCheck size={14} /> Validé
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                                <AlertTriangle size={14} /> En attente
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right min-w-[120px]" onClick={(e) => e.stopPropagation()}>
                            {showActions ? (
                              <div className="flex items-center justify-end gap-1 flex-wrap">
                                {isPending(user) && (
                                  <button
                                    onClick={() => handleValidate(user)}
                                    disabled={actionLoading === user.id}
                                    className="p-2.5 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition disabled:opacity-50"
                                    title="Valider"
                                  >
                                    {actionLoading === user.id ? <Loader className="animate-spin" size={18} /> : <UserCheck size={18} />}
                                  </button>
                                )}
                                <button
                                  onClick={() => openEdit(user)}
                                  className="p-2.5 rounded-xl text-slate-600 bg-slate-100 hover:bg-blue-100 hover:text-blue-600 transition"
                                  title="Éditer"
                                >
                                  <Pencil size={18} />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(user)}
                                  disabled={actionLoading === user.id}
                                  className="p-2.5 rounded-xl text-slate-600 bg-slate-100 hover:bg-red-100 hover:text-red-600 transition disabled:opacity-50"
                                  title="Refuser / Supprimer"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Suppression (raison obligatoire) */}
      {deleteModal?.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Confirmer la suppression</h2>
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                aria-label="Fermer"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={confirmDelete} className="p-6 space-y-4">
              <p className="text-slate-600 font-medium">
                Utilisateur : <strong>{deleteModal.user.full_name || deleteModal.user.email || '—'}</strong>
                {deleteModal.user.email && <span className="text-slate-500"> ({deleteModal.user.email})</span>}
              </p>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">
                  Veuillez indiquer la raison de la suppression <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deleteModal.reason}
                  onChange={(e) => setDeleteModal({ ...deleteModal, reason: e.target.value })}
                  required
                  rows={4}
                  placeholder="Ex : refus d'inscription, demande du client..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading === deleteModal.user?.id}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition disabled:opacity-50"
                >
                  {actionLoading === deleteModal.user?.id ? <Loader className="animate-spin" size={20} /> : <Trash2 size={20} />}
                  Confirmer la suppression
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModal(null)}
                  className="px-6 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {editModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Éditer l'utilisateur</h2>
              <button
                type="button"
                onClick={() => setEditModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                aria-label="Fermer"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">Email (non modifiable)</label>
                <input
                  type="email"
                  value={editModal.user?.email || ''}
                  readOnly
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">Nom complet</label>
                <input
                  type="text"
                  value={editModal.form.full_name}
                  onChange={(e) => setEditModal({ ...editModal, form: { ...editModal.form, full_name: e.target.value } })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nom complet"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">Société</label>
                <input
                  type="text"
                  value={editModal.form.societe}
                  onChange={(e) => setEditModal({ ...editModal, form: { ...editModal.form, societe: e.target.value } })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Société"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  value={editModal.form.phone}
                  onChange={(e) => setEditModal({ ...editModal, form: { ...editModal.form, phone: e.target.value } })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Téléphone"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">Rôle</label>
                <select
                  value={editModal.form.role}
                  onChange={(e) => setEditModal({ ...editModal, form: { ...editModal.form, role: e.target.value } })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {(currentUser?.role === 'developpeur') && (
                    <option value="admin">Admin</option>
                  )}
                  <option value="client">Client</option>
                  <option value="commercial">Commercial</option>
                  <option value="pending">Pending (En attente)</option>
                  {(currentUser?.role === 'developpeur') && (
                    <option value="developpeur">Développeur</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1.5">Statut validé</label>
                <select
                  value={editModal.form.is_validated ? 'yes' : 'no'}
                  onChange={(e) => setEditModal({ ...editModal, form: { ...editModal.form, is_validated: e.target.value === 'yes' } })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="yes">Oui (Validé)</option>
                  <option value="no">Non (En attente)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading === editModal.user?.id}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-100"
                >
                  {actionLoading === editModal.user?.id ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="px-6 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                >
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

export default AdminUsersPage;
