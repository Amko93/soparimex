import React, { useEffect, useState } from 'react';
// Correction du chemin : on sort de 'pages' pour aller dans 'src'
import { supabase } from '../supabaseClient'; 
import { useTheme } from '../context/ThemeContext';
import { 
  Search, Loader, Mail, Building2, 
  CheckCircle2, Clock, AlertTriangle 
} from 'lucide-react';

const AdminUsersPage = () => {
  const { colors } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Appel de Supabase...");
      const { data, error: sbError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (sbError) throw sbError;

      console.log("Comptes récupérés :", data);
      setUsers(data || []);
    } catch (err) {
      console.error("Erreur détaillée :", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
      <Loader className="animate-spin text-blue-600" size={40} />
      <p className="font-black text-slate-400 uppercase text-xs">Chargement des données...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-end mb-10 text-left">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Gestion Utilisateurs</h1>
          <p className="font-bold text-slate-500 italic">
            {users.length} comptes trouvés en base de données
          </p>
        </div>
        
        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un client..."
            className="w-full bg-slate-100 p-4 pl-12 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-r-xl font-bold">
          <AlertTriangle size={20} />
          <span>Erreur : {error} (Vérifiez votre connexion Supabase)</span>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Client / Société</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Rôle</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Statut</th>
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
                  <td className="p-6 font-black text-[10px] text-blue-600 uppercase">
                    {user.role}
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-20 text-center text-slate-300 font-black uppercase italic tracking-widest">
                  Aucun compte à afficher
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