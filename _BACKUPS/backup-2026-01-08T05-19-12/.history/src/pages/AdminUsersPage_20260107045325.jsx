import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; 
import { useTheme } from '../context/ThemeContext';
import { 
  Search, Loader, CheckCircle2, Clock, 
  UserCheck, Save, Edit2, X 
} from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

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

  // ACTIVER LE MODE ÉDITION POUR UNE LIGNE
  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({ ...user });
  };

  // SAUVEGARDER LES MODIFICATIONS (NOM, SOCIETE, ROLE)
  const saveChanges = async (id) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          societe: editForm.societe,
          role: editForm.role
        })
        .eq('id', id);

      if (error) throw error;
      setEditingId(null);
      fetchUsers();
      alert("Profil mis à jour !");
    } catch (err) {
      alert("Erreur lors de la modification : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // VALIDER ET ENVOYER À IABAKO
  const handleValidateUser = async (user) => {
    setSaving(true);
    try {
      // 1. APPEL N8N (IABAKO)
      const n8nResponse = await fetch('https://amir93220.app.n8n.cloud/webhook/valider-client-soparimex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      if (!n8nResponse.ok) {
        throw new Error("Iabako a rejeté la demande (Vérifiez les Credentials dans n8n).");
      }

      // 2. MISE À JOUR SUPABASE
      const { error: supabaseError } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', user.id);

      if (supabaseError) throw supabaseError;

      alert("Succès ! Client créé dans Iabako et validé.");
      fetchUsers();
    } catch (err) {
      alert("ERREUR : " + err.message);
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
      <div className="flex justify-between items-end mb-10 text-left text-slate-900">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Gestion Utilisateurs</h1>
          <p className="font-bold text-slate-500 italic text-[10px]">Modifier les profils et valider Iabako</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher..."
            className="bg-slate-100 p-4 pl-12 rounded-2xl font-bold border-none w-80 shadow-inner focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Client / Société</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Rôle</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Statut</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  {editingId === user.id ? (
                    <div className="flex flex-col gap-2">
                      <input 
                        className="bg-slate-50 p-2 rounded border font-bold"
                        value={editForm.full_name} 
                        onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                      />
                      <input 
                        className="bg-slate-50 p-2 rounded border text-xs"
                        value={editForm.societe} 
                        onChange={e => setEditForm({...editForm, societe: e.target.value})}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="font-black text-slate-900">{user.full_name || user.email}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase italic">{user.societe || 'Individuel'}</div>
                    </>
                  )}
                </td>
                <td className="p-6">
                  {editingId === user.id ? (
                    <select 
                      className="bg-slate-50 p-2 rounded border font-bold text-xs"
                      value={editForm.role}
                      onChange={e => setEditForm({...editForm, role: e.target.value})}
                    >
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                      <option value="developpeur">Developpeur</option>
                    </select>
                  ) : (
                    <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded">{user.role}</span>
                  )}
                </td>
                <td className="p-6">
                  {user.is_verified ? (
                    <span className="text-green-500 flex items-center gap-1 font-black text-[10px] uppercase italic"><CheckCircle2 size={14}/> Validé</span>
                  ) : (
                    <span className="text-amber-500 flex items-center gap-1 font-black text-[10px] uppercase italic"><Clock size={14}/> En attente</span>
                  )}
                </td>
                <td className="p-6 text-right">
                  <div className="flex gap-2 justify-end">
                    {editingId === user.id ? (
                      <>
                        <button onClick={() => saveChanges(user.id)} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"><Save size={16}/></button>
                        <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-600 rounded-lg"><X size={16}/></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(user)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-100"><Edit2 size={16}/></button>
                        {!user.is_verified && (
                          <button 
                            onClick={() => handleValidateUser(user)}
                            className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 flex items-center gap-2"
                          >
                            <UserCheck size={14}/> Valider Iabako
                          </button>
                        )}
                      </>
                    )}
                  </div>
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