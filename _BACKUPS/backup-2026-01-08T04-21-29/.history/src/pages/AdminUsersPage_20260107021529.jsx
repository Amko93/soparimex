import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CheckCircle, Loader, User, Building2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    // On récupère les profils qui attendent d'être validés
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'en_attente');
    
    if (error) console.error("Erreur chargement utilisateurs:", error);
    else setUsers(data || []);
    setLoading(false);
  };

  const handleValidate = async (user) => {
    setProcessingId(user.id);
    
    try {
      // ÉTAPE n8n : Envoi des données au Webhook
      const response = await fetch('https://amir93220.app.n8n.cloud/webhook-test/valider-client-soparimex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          full_name: user.full_name,
          societe: user.societe,
          siret: user.siret,
          phone: user.phone,
          city: user.city,
          zip_code: user.zip_code
        })
      });

      if (response.ok) {
        // MISE À JOUR SUPABASE : On passe le statut à 'validé'
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ status: 'validé' })
          .eq('id', user.id);

        if (updateError) throw updateError;

        alert(`Succès ! ${user.full_name} est validé et les infos sont envoyées à n8n.`);
        fetchPendingUsers(); // Rafraîchir la liste
      } else {
        alert("Le serveur n8n n'a pas répondu correctement.");
      }
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      alert("Une erreur est survenue lors de la communication avec n8n.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <Link to="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold transition">
          <ArrowLeft size={20} /> Retour Dashboard Admin
        </Link>

        <h1 className="text-4xl font-black text-[#1E293B] mb-12">Validation Comptes Clients</h1>
        
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-8 text-xs font-black text-slate-400 uppercase tracking-widest">Client</th>
                <th className="p-8 text-xs font-black text-slate-400 uppercase tracking-widest">Entreprise / SIRET</th>
                <th className="p-8 text-xs font-black text-slate-400 uppercase tracking-widest">Localisation</th>
                <th className="p-8 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <User size={20} />
                      </div>
                      <span className="font-bold text-slate-700">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="font-bold text-slate-700">{u.societe || 'Non renseigné'}</div>
                    <div className="text-xs text-slate-400 font-mono mt-1">{u.siret || 'Pas de SIRET'}</div>
                  </td>
                  <td className="p-8">
                    <div className="text-sm text-slate-600 font-medium">{u.city}</div>
                    <div className="text-xs text-slate-400">{u.zip_code}</div>
                  </td>
                  <td className="p-8 text-right">
                    <button 
                      onClick={() => handleValidate(u)}
                      disabled={processingId === u.id}
                      className="bg-[#22C55E] hover:bg-green-600 text-white font-black px-6 py-3 rounded-2xl transition shadow-lg shadow-green-100 flex items-center gap-2 ml-auto disabled:opacity-50"
                    >
                      {processingId === u.id ? <Loader className="animate-spin" size={18}/> : <CheckCircle size={18}/>}
                      Valider & Sync Iabako
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="p-24 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <CheckCircle size={40} />
              </div>
              <p className="text-slate-400 font-bold">Aucune demande de compte en attente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;