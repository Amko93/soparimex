import React, { useEffect, useState } from 'react';
// Chemin corrigé pour sortir de 'pages' et aller dans 'src'
import { supabase } from '../supabaseClient'; 
import { useTheme } from '../context/ThemeContext';
import { 
  Search, Loader, Mail, Building2, 
  CheckCircle2, Clock, AlertTriangle, UserCheck
} from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Suppression du .order('created_at') car la colonne n'existe pas
      const { data, error: sbError } = await supabase
        .from('profiles')
        .select('*');
      
      if (sbError) throw sbError;
      setUsers(data || []);
    } catch (err) {
      console.error("Erreur détaillée :", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (user) => {
    setSaving(true);
    try {
      // Tentative n8n non bloquante
      try {
        await fetch('https://amir93220.app.n8n.cloud/webhook-test/valider-client-soparimex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
      } catch (e) { console.warn("n8n inaccessible"); }

      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', user.id);

      if (error) throw error;
      alert("Utilisateur validé !");
      fetchUsers();
    } catch (err) {
      alert("Erreur lors de la validation.");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
      <Loader className="animate-spin text-blue-600" size={40} />
      <p className="font-black text-slate-400 uppercase text-[10px]">Chargement des comptes...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-end mb-10 text-left">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Gestion Utilisateurs</h1>
          <p className="font-bold text-slate-500 italic">{users.length} comptes trouvés</p>
        </div>
        
        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher..."
            className="w-full bg-slate-100 p-4 pl-12 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 flex items-center gap-3 rounded-2xl font-bold border border-red-100">
          <AlertTriangle size={20} />
          <span className="text-xs uppercase italic">Erreur : {error}</span>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Client / Société</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Statut</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <div className="font-black text-slate-900">{user.full_name || 'Sans nom'}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                      <Mail size={12}/> {user.email}
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
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 transition-all shadow-lg flex items-center gap-2 ml-auto"
                      >
                        {saving ? <Loader className="animate-spin" size={12}/> : <UserCheck size={14}/>}
                        Valider
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-20 text-center text-slate-300 font-black uppercase italic tracking-widest">
                  Aucun compte trouvé.
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