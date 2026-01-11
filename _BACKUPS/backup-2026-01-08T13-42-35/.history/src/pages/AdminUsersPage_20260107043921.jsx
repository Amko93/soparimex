import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; 
import { useTheme } from '../context/ThemeContext';
import { 
  Search, Loader, CheckCircle2, Clock, UserCheck, AlertCircle 
} from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Erreur de chargement :", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (user) => {
    setSaving(true);
    try {
      // 1. ENVOI VERS N8N / IABAKO
      // On attend la réponse pour être sûr que n8n a bien reçu le client
      console.log("Tentative d'envoi vers Iabako via n8n...");
      const n8nResponse = await fetch('https://amir93220.app.n8n.cloud/webhook-test/valider-client-soparimex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      if (!n8nResponse.ok) {
        throw new Error("Le serveur n8n n'a pas pu traiter la demande pour Iabako.");
      }

      // 2. VALIDATION DANS SUPABASE
      // Si n8n a répondu OK, on valide dans la base de données
      const { error: supabaseError } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', user.id);

      if (supabaseError) throw supabaseError;

      alert("Succès ! Le client a été envoyé à Iabako et validé dans la base de données.");
      fetchUsers(); // Rafraîchir la liste pour voir le statut passer au vert

    } catch (err) {
      console.error("Détails de l'erreur:", err);
      alert("Erreur : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <Loader className="animate-spin text-blue-600" size={40} />
      <p className="font-black text-slate-400 uppercase text-[10px]">Chargement des utilisateurs...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-end mb-10 text-left">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Gestion Utilisateurs</h1>
          <p className="font-bold text-slate-500 italic">Nombre total : {users.length}</p>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher..."
            className="w-full bg-slate-100 p-4 pl-12 rounded-2xl font-bold outline-none border-none shadow-inner focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Utilisateur / Société</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Statut</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <div className="font-black text-slate-900">{user.full_name || user.email}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {user.societe || 'Individuel'} — {user.role}
                    </div>
                  </td>
                  <td className="p-6">
                    {user.is_verified ? (
                      <span className="text-green-500 flex items-center gap-1 font-black text-[10px] uppercase italic">
                        <CheckCircle2 size={14}/> Validé
                      </span>
                    ) : (
                      <span className="text-amber-500 flex items-center gap-1 font-black text-[10px] uppercase italic">
                        <Clock size={14}/> En attente
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    {!user.is_verified && (
                      <button 
                        onClick={() => handleUpdateUser(user)}
                        disabled={saving}
                        className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase hover:bg-blue-600 transition-all shadow-lg flex items-center gap-2 ml-auto"
                      >
                        {saving ? <Loader size={12} className="animate-spin"/> : <UserCheck size={14}/>} 
                        Valider & Envoyer Iabako
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-20 text-center text-slate-300 font-black uppercase italic tracking-widest">
                  Aucun compte trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;