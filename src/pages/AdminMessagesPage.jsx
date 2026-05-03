import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ClipboardList, ArrowRight } from 'lucide-react';
import AdminNav from '../components/AdminNav';

/**
 * AdminMessagesPage — REDIRIGÉ vers AdminLeadsPage
 *
 * Historique : cette page lisait la table `messages` (formulaire de contact
 * anonyme). Depuis la refonte, ContactPage crée un `lead_request` + un
 * `lead_message` pour chaque demande client authentifié. Toutes les
 * "demandes" passent désormais par le système lead_requests / lead_messages.
 *
 * La table `messages` est conservée mais n'est plus alimentée par le
 * frontend. Cette page redirige automatiquement vers /admin/leads.
 */
const AdminMessagesPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/admin/leads', { replace: true }), 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AdminNav />

        <div className="mt-16 flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center">
            <ClipboardList size={40} className="text-blue-600" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">
              Les messages sont désormais des dossiers
            </h1>
            <p className="text-slate-500 max-w-md">
              Toutes les demandes client passent par le système de dossiers ({' '}
              <strong>Demandes clients</strong>). Redirection en cours…
            </p>
          </div>

          <Link
            to="/admin/leads"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
          >
            Voir les demandes <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminMessagesPage;
