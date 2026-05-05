import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import AdminNav from '../components/AdminNav';
import {
  Loader,
  UserCheck,
  Eye,
  Archive,
} from 'lucide-react';

const FILTER_ALL = 'all';
const FILTER_NEW = 'new';
const FILTER_MINE = 'mine';

const AdminLeadsPage = () => {
  const toast = useToast();
  const { profile: currentUser } = useAuth();
  const [leads, setLeads] = useState([]);
  const [profilesMap, setProfilesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const fallbackTimerRef = useRef(null);
  const [filter, setFilter] = useState(FILTER_NEW);

  useEffect(() => {
    fallbackTimerRef.current = setTimeout(() => { setError(true); setLoading(false); }, 10000);
    fetchLeads();
    return () => clearTimeout(fallbackTimerRef.current);
  }, []);

  // Ajuster le filtre par défaut selon le rôle
  useEffect(() => {
    if (!currentUser?.role) return;
    const r = (currentUser.role || '').toLowerCase();
    if (r === 'admin' || r === 'developpeur') setFilter(FILTER_ALL);
    else if (r === 'commercial') setFilter(FILTER_NEW);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.role]);

  const fetchLeads = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data: rows, error } = await supabase
        .from('lead_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      clearTimeout(fallbackTimerRef.current); // fetch réussi → annule le timer d'erreur
      setLeads(rows || []);

      const list = rows || [];
      const ids = new Set();
      list.forEach((l) => {
        if (l.client_id) ids.add(l.client_id);
        if (l.assigned_to) ids.add(l.assigned_to);
      });
      if (ids.size > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name, societe')
          .in('id', [...ids]);
        const map = {};
        (profs || []).forEach((p) => {
          map[p.id] = { full_name: p.full_name || '', societe: p.societe || '' };
        });
        setProfilesMap(map);
      } else {
        setProfilesMap({});
      }
    } catch (err) {
      console.error('Erreur chargement leads:', err);
      setLeads([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer selon rôle (commercial : non assignés ou assignés à moi) puis selon onglet
  // Par défaut : exclure les 'cloture'
  const displayedLeads = useMemo(() => {
    let list = leads.filter((l) => (l.status || '').toLowerCase() !== 'cloture');
    const myId = currentUser?.id;
    const myRole = (currentUser?.role || '').toLowerCase();
    
    if (myRole === 'commercial' && myId) {
      list = list.filter((l) => !l.assigned_to || l.assigned_to === myId);
    }
    
    if (filter === FILTER_NEW) {
      return list.filter((l) => (l.status || '').toLowerCase() === 'nouveau');
    }
    if (filter === FILTER_MINE && myId) {
      return list.filter((l) => l.assigned_to === myId);
    }
    return list;
  }, [leads, filter, currentUser?.id, currentUser?.role]);

  const takeLead = async (lead) => {
    if (!currentUser?.id) return;
    setActionLoading(lead.id);
    try {
      const { error } = await supabase
        .from('lead_requests')
        .update({ assigned_to: currentUser.id, status: 'en_cours' })
        .eq('id', lead.id);
      if (error) throw error;
      await fetchLeads();
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'nouveau') return 'bg-emerald-100 text-emerald-700';
    if (s === 'en_cours') return 'bg-blue-100 text-blue-700';
    if (s === 'cloture') return 'bg-slate-200 text-slate-600';
    return 'bg-slate-100 text-slate-600';
  };

  const getClientLabel = (lead) => {
    const p = profilesMap[lead.client_id];
    if (!p) return '—';
    const parts = [p.full_name, p.societe].filter(Boolean);
    return parts.length ? parts.join(' · ') : '—';
  };

  const getAssigneeLabel = (lead) => {
    if (!lead.assigned_to) return '—';
    const p = profilesMap[lead.assigned_to];
    return p?.full_name || '—';
  };

  const isUnassigned = (lead) => !lead.assigned_to;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <AdminNav />

        {/* Titre + Bouton Archives */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Demandes clients (Leads)</h1>
            <p className="text-slate-500 mt-1 text-sm">Pool de tickets · Assignation et suivi.</p>
          </div>
          <Link
            to="/admin/leads/archive"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition"
          >
            <Archive size={18} /> Voir les archives
          </Link>
        </div>

        {/* Filtres / Onglets selon rôle */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(currentUser?.role === 'admin' || currentUser?.role === 'developpeur') ? (
            <button
              type="button"
              onClick={() => setFilter(FILTER_ALL)}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                filter === FILTER_ALL
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Dossiers en cours
            </button>
          ) : currentUser?.role === 'commercial' ? (
            <>
              <button
                type="button"
                onClick={() => setFilter(FILTER_NEW)}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                  filter === FILTER_NEW
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Nouveaux Leads
              </button>
              <button
                type="button"
                onClick={() => setFilter(FILTER_MINE)}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                  filter === FILTER_MINE
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Mes dossiers en cours
              </button>
            </>
          ) : null}
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader className="animate-spin text-blue-600" size={40} />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <p className="text-slate-600 font-medium">Impossible de charger les demandes.</p>
              <button onClick={fetchLeads} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">
                Réessayer
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Date</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Titre</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Client</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Statut</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Assigné à</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center text-slate-500 font-medium">
                        Aucune demande.
                      </td>
                    </tr>
                  ) : (
                    displayedLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(lead.created_at)}</td>
                        <td className="px-4 py-4 font-semibold text-slate-800">{lead.title || '—'}</td>
                        <td className="px-4 py-4 text-sm text-slate-600">{getClientLabel(lead)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center text-xs font-bold uppercase px-2.5 py-1 rounded-md ${statusBadgeClass(lead.status)}`}>
                            {lead.status || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">{getAssigneeLabel(lead)}</td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {isUnassigned(lead) && (
                              <button
                                type="button"
                                onClick={() => takeLead(lead)}
                                disabled={actionLoading === lead.id}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                              >
                                {actionLoading === lead.id ? <Loader className="animate-spin" size={14} /> : <UserCheck size={14} />}
                                Prendre ce dossier
                              </button>
                            )}
                            <Link
                              to={`/admin/leads/${lead.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-blue-100 hover:text-blue-600 transition"
                            >
                              <Eye size={14} /> Voir le dossier
                            </Link>
                          </div>
                        </td>
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

export default AdminLeadsPage;
