import React, { useEffect, useState } from 'react';
// On doit remonter de deux niveaux pour sortir de 'pages' puis de 'src'
import { supabase } from '../../supabaseClient'; 
import { useTheme } from '../context/ThemeContext';
import { 
  UserCheck, Search, Loader, Mail, 
  Building2, Phone, CheckCircle2, Clock
} from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les utilisateurs au démarrage
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Erreur lors de la récupération :", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (user) => {
    setSaving(true);
    try {
      // 1. Appel n8n protégé (on continue même si ça rate)
      try {
        await fetch('https://amir93220.app.n8n.cloud/webhook-test/valider-client-soparimex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
      } catch (e) {
        console.warn("n8n non joignable");
      }

      // 2. Mise à jour dans Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', user.id);

      if (error) throw error;

      alert("Compte validé !");
      fetchUsers(); // Recharger la liste
    } catch (err) {
      console.error(err);
      alert("Erreur base de données.");
    } finally {
      setSaving(false);
    }
  };

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.societe?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loader className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-end mb-10 text-left">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Gestion Utilisateurs</h1>
          <p className="font-bold text-slate-500 italic">
            Administrateur : {users.length} comptes au total
          </p>
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

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Client / Société</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Rôle</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Statut</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <div className="font-black text-slate-900">{user.full_name || 'Sans nom'}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                      <Building2 size={12}/> {user.societe || 'Individuel'}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${
                      user.role === 'admin' || user.role === 'developpeur' 
                      ? 'bg-amber-100 text-amber-600' 
                      : 'bg-blue-50 text-blue-600'
                    }`}>
                      {user.role}
                    </span>
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
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 transition-all shadow-lg"
                      >
                        {saving ? "..." : "Valider"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-20 text-center text-slate-400 font-bold italic">
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