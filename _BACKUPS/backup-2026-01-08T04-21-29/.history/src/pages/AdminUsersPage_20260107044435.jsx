import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; 
import { useTheme } from '../context/ThemeContext';
import { Search, Loader, CheckCircle2, Clock, UserCheck } from 'lucide-react';

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
      console.error("Erreur chargement :", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (user) => {
    setSaving(true);
    try {
      // 1. APPEL N8N PRODUCTION (Automatisation Iabako)
      // On utilise l'URL de production pour que ce soit automatique
      console.log("Envoi automatique vers n8n...");
      const n8nResponse = await fetch('https://amir93220.app.n8n.cloud/webhook/valider-client-soparimex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      if (!n8nResponse.ok) {
        throw new Error("n8n n'a pas pu envoyer le client à Iabako. Vérifiez que le workflow est bien sur 'Active'.");
      }

      // 2. MISE À JOUR SUPABASE (Seulement si n8n a réussi)
      const { error: supabaseError } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', user.id);

      if (supabaseError) throw supabaseError;

      alert("Succès ! Client créé dans Iabako et validé sur Soparimex.");
      fetchUsers();

    } catch (err) {
      console.error("Erreur détaillée:", err);
      alert("ERREUR : " + err.message);
      // Le compte reste "En attente" sur le site pour pouvoir retester
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
          <p className="font-bold text-slate-500 italic">Liaison Iabako : Active</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher..."
            className="bg-slate-100 p-4 pl-12 rounded-2xl font-bold border-none w-80 shadow-inner focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
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
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{user.societe || 'Individuel'}</div>
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
                      Valider & Synchro Iabako
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