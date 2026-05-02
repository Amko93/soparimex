import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import AdminNav from '../components/AdminNav';
import {
  Users,
  Clock,
  Mail,
  ExternalLink,
  ChevronRight,
  Plus,
  UserCog,
  MessageSquare,
  History,
  Loader,
  AlertCircle,
  ClipboardList,
  Settings,
  Save,
  CheckCircle,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    unclaimedLeads: 0,
    unreadMessages: 0,
  });
  const [lastUsers, setLastUsers] = useState([]);
  const [notifEmail, setNotifEmail] = useState('');
  const [defaultProductDesc, setDefaultProductDesc] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    loadAdminProfile();
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const fallback = setTimeout(() => { setError(true); setLoading(false); }, 10000);
    return () => clearTimeout(fallback);
  }, []);

  const loadAdminProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    const { data } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single();
    if (data?.full_name?.trim()) {
      const first = data.full_name.trim().split(/\s+/)[0];
      setAdminName(first);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [
        totalUsersRes,
        pendingUsersRes,
        unclaimedLeadsRes,
        unreadMessagesRes,
        lastUsersRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .or('role.eq.pending,is_validated.eq.false'),
        supabase.from('lead_requests').select('*', { count: 'exact', head: true }).is('assigned_to', null),
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('statut', 'nouveau'),
        supabase
          .from('profiles')
          .select('id, full_name, societe, created_at, role, is_validated')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setStats({
        totalUsers: totalUsersRes.count ?? 0,
        pendingUsers: pendingUsersRes.count ?? 0,
        unclaimedLeads: unclaimedLeadsRes.count ?? 0,
        unreadMessages: unreadMessagesRes.count ?? 0,
      });
      setLastUsers(lastUsersRes.data ?? []);

      // Charger l'email de notification
      const { data: settingsData } = await supabase.from('site_settings').select('texts').eq('id', 'main').single();
      if (settingsData?.texts?.notificationEmail) {
        setNotifEmail(settingsData.texts.notificationEmail);
      }
      if (settingsData?.texts?.defaultProductDesc) {
        setDefaultProductDesc(settingsData.texts.defaultProductDesc);
      }
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    setSettingsSaved(false);
    const { data: current } = await supabase.from('site_settings').select('texts').eq('id', 'main').single();
    const updatedTexts = {
      ...(current?.texts || {}),
      notificationEmail: notifEmail.trim(),
      defaultProductDesc: defaultProductDesc.trim(),
    };
    await supabase.from('site_settings').update({ texts: updatedTexts }).eq('id', 'main');

    // Mettre à jour la description de tous les produits existants
    if (defaultProductDesc.trim()) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ description: defaultProductDesc.trim() })
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (updateError) console.error('Erreur maj produits:', updateError);
    }

    setSettingsSaving(false);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const todayFormatted = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const statusLabel = (user) => {
    const r = (user.role || '').toLowerCase();
    if (r === 'pending' || user.is_validated === false) return 'En attente';
    if (r === 'client') return 'Client';
    if (r === 'admin') return 'Admin';
    if (r === 'developpeur') return 'Développeur';
    return user.role || '—';
  };

  const getInitials = (name) => {
    if (!name || !name.trim()) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
    return name.trim().slice(0, 2).toUpperCase();
  };

  const statusBadgeClass = (user) => {
    const r = (user.role || '').toLowerCase();
    if (r === 'pending' || user.is_validated === false) return 'bg-amber-100 text-amber-700';
    if (r === 'client') return 'bg-blue-100 text-blue-700';
    if (r === 'admin') return 'bg-violet-100 text-violet-700';
    if (r === 'developpeur') return 'bg-slate-200 text-slate-700';
    return 'bg-slate-100 text-slate-600';
  };

  if (loading && stats.totalUsers === 0 && lastUsers.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (error && stats.totalUsers === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 font-medium mb-4">Impossible de charger le tableau de bord.</p>
          <button onClick={fetchDashboardData} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminNav />
        {/* En-tête */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Bonjour{adminName ? `, ${adminName}` : ''}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 capitalize">{todayFormatted}</p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition shadow-sm"
          >
            <ExternalLink size={18} />
            Aller sur le site
          </a>
        </header>

        {/* Cartes KPI */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Users className="text-blue-600" size={28} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Utilisateurs totaux</p>
            </div>
          </div>

          <div className={`bg-white rounded-2xl shadow-sm border p-6 flex items-center gap-4 ${stats.pendingUsers > 0 ? 'border-amber-200 bg-amber-50/40' : 'border-slate-100'}`}>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${stats.pendingUsers > 0 ? 'bg-amber-500 text-white' : 'bg-amber-100'}`}>
              <Clock className={stats.pendingUsers > 0 ? 'text-white' : 'text-amber-600'} size={28} />
            </div>
            <div>
              <p className={`text-3xl font-bold ${stats.pendingUsers > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {stats.pendingUsers}
              </p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">En attente de validation</p>
            </div>
          </div>

          <div className={`bg-white rounded-2xl shadow-sm border p-6 flex items-center gap-4 ${stats.unclaimedLeads > 0 ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-100'}`}>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${stats.unclaimedLeads > 0 ? 'bg-emerald-500 text-white' : 'bg-emerald-100'}`}>
              <ClipboardList className={stats.unclaimedLeads > 0 ? 'text-white' : 'text-emerald-600'} size={28} />
            </div>
            <div>
              <p className={`text-3xl font-bold ${stats.unclaimedLeads > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>{stats.unclaimedLeads}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Demandes non prises</p>
            </div>
          </div>

          <div className={`bg-white rounded-2xl shadow-sm border p-6 flex items-center gap-4 ${stats.unreadMessages > 0 ? 'border-violet-200 bg-violet-50/40' : 'border-slate-100'}`}>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${stats.unreadMessages > 0 ? 'bg-violet-500 text-white' : 'bg-violet-100'}`}>
              <Mail className={stats.unreadMessages > 0 ? 'text-white' : 'text-violet-600'} size={28} />
            </div>
            <div>
              <p className={`text-3xl font-bold ${stats.unreadMessages > 0 ? 'text-violet-600' : 'text-slate-900'}`}>
                {stats.unreadMessages}
              </p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Messages non lus</p>
            </div>
          </div>
        </section>

        {/* Section centrale : Dernières inscriptions + Actions rapides */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Dernières inscriptions */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Dernières inscriptions</h2>
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                Tout voir
                <ChevronRight size={16} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              {lastUsers.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-500 text-sm">Aucune inscription récente.</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Société</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lastUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-600 font-bold text-sm">
                              {getInitials(user.full_name)}
                            </div>
                            <span className="font-medium text-slate-900">{user.full_name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{user.societe || '—'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{formatDate(user.created_at)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md ${statusBadgeClass(user)}`}>
                            {(user.role || '').toLowerCase() === 'pending' || user.is_validated === false ? (
                              <><AlertCircle size={12} /> En attente</>
                            ) : (
                              statusLabel(user)
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Actions rapides - grille 2 colonnes */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Actions rapides</h2>
            <nav className="grid grid-cols-2 gap-3">
              <Link
                to="/admin/categories"
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-slate-100 bg-slate-50/50 text-slate-700 font-semibold text-sm hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Plus className="text-blue-600" size={24} />
                </div>
                <span className="text-center leading-tight">Ajouter un produit</span>
              </Link>
              <Link
                to="/admin/users"
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-slate-100 bg-slate-50/50 text-slate-700 font-semibold text-sm hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <UserCog className="text-emerald-600" size={24} />
                </div>
                <span className="text-center leading-tight">Gérer les utilisateurs</span>
              </Link>
              <Link
                to="/admin/messages"
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-slate-100 bg-slate-50/50 text-slate-700 font-semibold text-sm hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                  <MessageSquare className="text-violet-600" size={24} />
                </div>
                <span className="text-center leading-tight">Voir les messages</span>
              </Link>
              <Link
                to="/admin/leads"
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-slate-100 bg-slate-50/50 text-slate-700 font-semibold text-sm hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <ClipboardList className="text-amber-600" size={24} />
                </div>
                <span className="text-center leading-tight">Demandes clients</span>
              </Link>
              <Link
                to="/admin/deleted-users"
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-slate-100 bg-slate-50/50 text-slate-700 font-semibold text-sm hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
                  <History className="text-slate-600" size={24} />
                </div>
                <span className="text-center leading-tight">Historique suppressions</span>
              </Link>
            </nav>
          </div>
        </section>

        {/* Paramètres */}
        <section className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Settings size={20} className="text-slate-500" /> Paramètres
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Email de notification (messages de contact + nouvelles demandes)
              </label>
              <input
                type="email"
                value={notifEmail}
                onChange={(e) => setNotifEmail(e.target.value)}
                placeholder="soparimex@hotmail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Description par défaut des produits
              </label>
              <textarea
                value={defaultProductDesc}
                onChange={(e) => setDefaultProductDesc(e.target.value)}
                placeholder="Ex : Produit de qualité professionnelle, disponible sur commande. Contactez-nous pour un devis personnalisé."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">Cette description sera appliquée automatiquement aux nouveaux produits si vous ne remplissez pas le champ description.</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={saveSettings}
                disabled={settingsSaving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap"
              >
                {settingsSaving ? (
                  <Loader className="animate-spin" size={18} />
                ) : settingsSaved ? (
                  <><CheckCircle size={18} /> Enregistré</>
                ) : (
                  <><Save size={18} /> Enregistrer</>
                )}
              </button>
              {settingsSaved && (
                <p className="text-green-600 text-sm font-medium">Paramètres sauvegardés.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
