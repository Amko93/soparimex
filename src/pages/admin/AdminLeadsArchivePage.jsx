import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import AdminNav from '../../components/AdminNav';
import {
  Loader,
  Archive,
  Eye,
  Search,
  X,
} from 'lucide-react';

const AdminLeadsArchivePage = () => {
  const [leads, setLeads] = useState([]);
  const [profilesMap, setProfilesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) fetchLeads();
  }, [currentUser?.id]);

  const loadCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        setLoading(false); // Pas de session → fetchLeads ne sera jamais appelé
        return;
      }
      const { data } = await supabase.from('profiles').select('id, role').eq('id', session.user.id).single();
      if (data) {
        setCurrentUser({ id: data.id, role: (data.role || '').toLowerCase() });
        // fetchLeads sera déclenché par le useEffect sur currentUser?.id
      } else {
        setLoading(false); // Profil introuvable → fetchLeads ne sera pas appelé
      }
    } catch (err) {
      console.error('Erreur loadCurrentUser:', err);
      setLoading(false); // Erreur réseau → on sort du spinner
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from('lead_requests')
        .select('*')
        .eq('status', 'cloture')
        .order('created_at', { ascending: false });

      if (error) throw error;
      let list = rows || [];

      const myId = currentUser?.id;
      const myRole = (currentUser?.role || '').toLowerCase();
      if (myRole === 'commercial' && myId) {
        list = list.filter((l) => l.assigned_to === myId);
      }

      setLeads(list);

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
      console.error('Erreur chargement archives:', err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = useMemo(() => {
    if (!searchTerm.trim()) return leads;
    const q = searchTerm.toLowerCase().trim();
    return leads.filter((lead) => {
      const client = profilesMap[lead.client_id];
      const assignee = lead.assigned_to ? profilesMap[lead.assigned_to] : null;
      return (
        (client?.full_name || '').toLowerCase().includes(q) ||
        (client?.societe || '').toLowerCase().includes(q) ||
        (assignee?.full_name || '').toLowerCase().includes(q)
      );
    });
  }, [leads, searchTerm, profilesMap]);

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

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <AdminNav />

        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Archive className="text-slate-600" size={32} />
            Archives des demandes
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Dossiers clôturés.</p>
        </div>

        {/* Barre de recherche (Admin/Dev seulement) */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'developpeur') && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par client, société ou commercial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-10 py-3 text-slate-800 font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
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
          </div>
        )}

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
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Titre</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Client</th>
                    {(currentUser?.role === 'admin' || currentUser?.role === 'developpeur') && (
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Commercial</th>
                    )}
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={currentUser?.role === 'admin' || currentUser?.role === 'developpeur' ? 5 : 4} className="px-4 py-16 text-center text-slate-500 font-medium">
                        {searchTerm ? 'Aucun résultat pour cette recherche.' : 'Aucune archive.'}
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(lead.created_at)}</td>
                        <td className="px-4 py-4 font-semibold text-slate-800">{lead.title || '—'}</td>
                        <td className="px-4 py-4 text-sm text-slate-600">{getClientLabel(lead)}</td>
                        {(currentUser?.role === 'admin' || currentUser?.role === 'developpeur') && (
                          <td className="px-4 py-4 text-sm text-slate-600">{getAssigneeLabel(lead)}</td>
                        )}
                        <td className="px-4 py-4 text-right">
                          <Link
                            to={`/admin/leads/${lead.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-blue-100 hover:text-blue-600 transition"
                          >
                            <Eye size={14} /> Voir le dossier
                          </Link>
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

export default AdminLeadsArchivePage;
