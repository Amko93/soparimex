import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; 
import { useTheme } from '../context/ThemeContext';
import { Search, Loader, CheckCircle2, Clock, UserCheck, AlertCircle } from 'lucide-react';

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
      // Étape 1 : Appel n8n (en arrière-plan, ne bloque pas si erreur)
      fetch('https://amir93220.app.n8n.cloud/webhook-test/valider-client-soparimex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      }).catch(() => console.log("n8n en attente de démarrage"));

      // Étape 2 : Mise à jour réelle dans Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', user.id);

      if (error) {
        // Si l'erreur de colonne persiste, on affiche un message clair
        if (error.message.includes('is_verified')) {
          alert("Action requise : Vous devez exécuter le code SQL dans Supabase pour ajouter la colonne 'is_verified'.");
        } else {
          throw error;
        }
        return;
      }

      alert("Succès : Le compte a été validé !");
      fetchUsers(); // On recharge la liste proprement
    } catch (err) {
      alert("Erreur base de données : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center"><Loader className="animate-spin mx-auto text-blue-600" size={40} /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-end mb-10 text-left">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Gestion Utilisateurs</h1>
          <p className="font-bold text-slate-500 italic">Comptes détectés : {users.length}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un client..."
            className="bg-slate-100 p-4 pl-12 rounded-2xl font-bold outline-none border-none w-80 shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Utilisateur</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Statut</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  <div className="font-black text-slate-900">{user.full_name || user.email}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.role}</div>
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
                      className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 transition-all flex items-center gap-2 ml-auto shadow-lg"
                    >
                      {saving ? <Loader size={12} className="animate-spin"/> : <UserCheck size={14}/>} 
                      Valider le client
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;