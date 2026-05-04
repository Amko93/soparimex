import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { Loader, ClipboardList, Eye, Package, ShoppingBag } from 'lucide-react';

const ClientRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userId, setUserId] = useState(null);
  const fallbackTimerRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          setLoading(false);
          return;
        }
        setUserId(session.user.id);
      } catch {
        setError(true);
        setLoading(false);
      }
    };
    fallbackTimerRef.current = setTimeout(() => { setError(true); setLoading(false); }, 10000);
    init();
    return () => clearTimeout(fallbackTimerRef.current);
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchRequests = async () => {
    if (!userId) return;
    setLoading(true);
    setError(false);
    try {
      const { data, error } = await supabase
        .from('lead_requests')
        .select('id, created_at, title, status')
        .eq('client_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      clearTimeout(fallbackTimerRef.current); // fetch réussi → annule le timer d'erreur
      setRequests(data || []);
    } catch (err) {
      console.error('Erreur chargement demandes:', err);
      setError(true);
      setRequests([]);
    } finally {
      setLoading(false);
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

  const statusBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'nouveau') return 'bg-emerald-100 text-emerald-700';
    if (s === 'en_cours') return 'bg-blue-100 text-blue-700';
    if (s === 'cloture') return 'bg-slate-200 text-slate-600';
    return 'bg-slate-100 text-slate-600';
  };

  const statusLabel = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'nouveau') return 'Nouveau';
    if (s === 'en_cours') return 'En cours';
    if (s === 'cloture') return 'Clôturé';
    return status || '—';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 font-medium mb-4">Impossible de charger vos demandes.</p>
          <button
            onClick={() => { setError(false); setLoading(true); fetchRequests(); }}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ClipboardList className="text-blue-600" size={32} />
            Mes demandes
          </h1>
          <p className="text-slate-500 mt-1">Suivez l'état de vos demandes.</p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 font-medium mb-6">Vous n'avez aucune demande en cours.</p>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
            >
              <ShoppingBag size={20} /> Parcourir le catalogue
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Date</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Titre</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Statut</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(req.created_at)}</td>
                      <td className="px-4 py-4 text-sm text-slate-700 font-medium">{req.title || '—'}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center text-xs font-bold uppercase px-2.5 py-1 rounded-md ${statusBadgeClass(req.status)}`}>
                          {statusLabel(req.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          to={`/mes-demandes/${req.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition"
                        >
                          <Eye size={16} /> Voir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientRequestsPage;
