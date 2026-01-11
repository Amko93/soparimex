import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { 
  UserCheck, Search, Loader, Mail, 
  Building2, Phone, CheckCircle2, Clock, ShieldAlert 
} from 'lucide-react';

const AdminUsersPage = () => {
  const { colors } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });
    
    if (!error) setUsers(data || []);
    setLoading(false);
  };

  const handleUpdateUser = async (user) => {
    setSaving(true);
    try {
      // 1. Appel n8n protégé (ne bloque plus si erreur)
      try {
        await fetch('https://amir93220.app.n8n.cloud/webhook-test/valider-client-soparimex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
      } catch (e) { console.warn("n8n non joignable"); }

      // 2. Mise à jour Supabase
      // NOTE : Si c'est un admin, le trigger SQL bloquera le changement de rôle
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', user.id);

      if (error) throw error;
      alert("Utilisateur validé avec succès !");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Erreur base de données : Vous ne pouvez pas modifier un rôle Administrateur/Développeur via cette interface.");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center"><Loader className="animate-spin mx-auto text-blue-600" /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-end mb-10 text-left">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900">Gestion Utilisateurs</h1>
          <p className="font-bold text-slate-500">Validation des nouveaux comptes clients</p>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher..."
            className="w-full bg-slate-100 p-4 pl-12 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Client / Société</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Rôle</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Statut</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  <div className="font-black text-slate-900">{user.full_name}</div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1">
                    <Building2 size={12}/> {user.societe || 'Individuel'}
                  </div>
                </td>
                <td className="p-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit ${
                    user.role === 'admin' || user.role === 'developpeur' 
                    ? 'bg-amber-100 text-amber-600 border border-amber-200' 
                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {user.role === 'admin' && <ShieldAlert size={10}/>}
                    {user.role}
                  </span>
                </td>
                <td className="p-6">
                  {user.is_verified ? (
                    <span className="text-green-500 flex items-center gap-1 font-black text-[10px] uppercase italic"><CheckCircle2 size={14}/> Validé</span>
                  ) : (
                    <span className="text-amber-500 flex items-center gap-1 font-black text-[10px] uppercase italic"><Clock size={14}/> En attente</span>
                  )}
                </td>
                <td className="p-6 text-right">
                  {!user.is_verified && user.role !== 'admin' && user.role !== 'developpeur' ? (
                    <button 
                      onClick={() => handleUpdateUser(user)}
                      disabled={saving}
                      className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase hover:bg-blue-600 transition-all shadow-lg"
                    >
                      {saving ? <Loader className="animate-spin" size={12}/> : "Valider le compte"}
                    </button>
                  ) : (
                    <span className="text-[10px] font-black text-slate-300 uppercase italic">Aucune action</span>
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