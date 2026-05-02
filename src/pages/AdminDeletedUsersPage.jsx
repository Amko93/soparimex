import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  ArrowLeft,
  Users,
  Loader,
  LayoutGrid,
  Mail,
  Search,
  X,
} from 'lucide-react';

const AdminDeletedUsersPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deleted_users_logs')
        .select('*')
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs;
    const q = searchTerm.toLowerCase().trim();
    return logs.filter(
      (log) =>
        (log.full_name || '').toLowerCase().includes(q) ||
        (log.email || '').toLowerCase().includes(q)
    );
  }, [logs, searchTerm]);

  const formatDate = (log) => {
    const dateString = log.deleted_at || log.created_at;
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-site py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation admin + Retour */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            to="/admin"
            className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition w-fit"
          >
            <ArrowLeft size={20} /> Retour Dashboard
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/categories"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-blue-200 transition"
            >
              <LayoutGrid size={16} /> Catalogue
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-blue-200 transition"
            >
              <Users size={16} /> Utilisateurs
            </Link>
            <Link
              to="/admin/messages"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-purple-200 transition"
            >
              <Mail size={16} /> Messages
            </Link>
          </nav>
        </div>

        {/* Titre + Retour utilisateurs actifs */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Historique des suppressions</h1>
            <p className="text-slate-500 mt-1 text-sm">Comptes supprimés et raisons enregistrées.</p>
          </div>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-blue-600 transition w-fit"
          >
            <Users size={18} /> Retour aux utilisateurs actifs
          </Link>
        </div>

        {/* Barre de recherche */}
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
            {filteredLogs.length} entrée{filteredLogs.length !== 1 ? 's' : ''}
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
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Date de suppression</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Email</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Nom</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Société</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Raison</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Supprimé par</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center text-slate-500 font-medium">
                        {searchTerm ? 'Aucun résultat pour cette recherche.' : 'Aucune suppression enregistrée.'}
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(log)}</td>
                        <td className="px-4 py-4 text-sm text-slate-600">{log.email || '—'}</td>
                        <td className="px-4 py-4 font-semibold text-slate-800">{log.full_name || '—'}</td>
                        <td className="px-4 py-4 text-sm text-slate-600">{log.societe || '—'}</td>
                        <td className="px-4 py-4 text-sm text-slate-700 max-w-xs">
                          <span className="line-clamp-3" title={log.reason || ''}>{log.reason || '—'}</span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">{log.deleted_by_email || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDeletedUsersPage;
