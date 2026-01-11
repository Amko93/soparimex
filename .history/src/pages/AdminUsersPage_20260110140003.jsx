import React, { useEffect, useState } from 'react';
// Vérifie bien que ce chemin est correct selon ton projet (parfois c'est ../supabase or ./supabaseClient)
import { createClient } from '@supabase/supabase-js';
import { 
  Search, Loader, CheckCircle2, Clock, 
  UserCheck, Save, Edit2, X, Phone, Fingerprint, Ban
} from 'lucide-react';

// Configuration Supabase (Si tu as un fichier centralisé, remets ton import, sinon garde ça)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
      // On récupère les profils
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Erreur chargement :", err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({ ...user });
  };

  const saveChanges = async (id) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          societe: editForm.societe,
          role: editForm.role,
          phone: editForm.phone,
          siret: editForm.siret
        })
        .eq('id', id);

      if (error) throw error;
      setEditingId(null);
      fetchUsers(); // Rafraîchir la liste
      // Tu peux remettre une alerte jolie ici si tu veux
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // C'est ici que j'ai simplifié : plus de n8n, validation directe !
  const handleToggleValidation = async (user) => {
    setSaving(true);
    const newStatus = !user.is_validated; // Inverse le statut actuel

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_validated: newStatus })
        .eq('id', user.id);

      if (error) throw error;

      // Mise à jour locale pour que ce soit instantané à l'écran
      setUsers(users.map(u => u.id === user.id ? { ...u, is_validated: newStatus } : u));
      
    } catch (err) {
      alert("ERREUR : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.societe || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center"><Loader className="animate-spin mx-auto text-blue-600" size={40} /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans bg-gray-50 min-h-screen">
      <div className="flex justify-between items-end mb-10 text-left text-slate-900">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Gestion Utilisateurs</h1>
          <p className="font-bold text-slate-500 italic text-[10px]">Validez les comptes pour l'accès Contact</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher..."
            className="bg-white p-4 pl-12 rounded-2xl font-bold border-none w-80 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Identité / Société</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Coordonnées & SIRET</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.length === 0 && (
                <tr><td colSpan="3" className="p-10 text-center text-slate-400 font-bold">Aucun utilisateur trouvé</td></tr>
            )}
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6 text-left">
                  {editingId === user.id ? (
                    <div className="flex flex-col gap-2">
                      <input 
                        className="bg-white p-2 rounded border font-bold text-sm"
                        placeholder="Nom complet"
                        value={editForm.full_name || ''} 
                        onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                      />
                      <input 
                        className="bg-white p-2 rounded border text-xs"
                        placeholder="Société"
                        value={editForm.societe || ''} 
                        onChange={e => setEditForm({...editForm, societe: e.target.value})}
                      />
                      <select 
                        className="bg-white p-2 rounded border font-bold text-xs"
                        value={editForm.role}
                        onChange={e => setEditForm({...editForm, role: e.target.value})}
                      >
                        <option value="user">Utilisateur</option>
                        <option value="admin">Admin</option>
                        <option value="developer">Développeur</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <div className="font-black text-slate-900">{user.full_name || "Nom inconnu"}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase italic mt-1">{user.societe || 'Particulier'}</div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded mt-2 inline-block ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                        {user.role}
                      </span>
                    </div>
                  )}
                </td>
                <td className="p-6 text-left">
                  {editingId === user.id ? (
                    <div className="flex flex-col gap-2">
                      <input 
                        className="bg-white p-2 rounded border text-xs"
                        value={editForm.phone || ''} 
                        onChange={e => setEditForm({...editForm, phone: e.target.value})}
                        placeholder="Téléphone"
                      />
                      <input 
                        className="bg-white p-2 rounded border text-xs"
                        value={editForm.siret || ''} 
                        onChange={e => setEditForm({...editForm, siret: e.target.value})}
                        placeholder="SIRET"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
                        <Phone size={12}/> {user.phone || '---'}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2 mt-1">
                        <Fingerprint size={12}/> SIRET: {user.siret || '---'}
                      </div>
                      <div className="mt-2">
                        {user.is_validated ? (
                          <span className="text-green-500 flex items-center gap-1 font-black text-[10px] uppercase italic"><CheckCircle2 size={12}/> Validé</span>
                        ) : (
                          <span className="text-amber-500 flex items-center gap-1 font-black text-[10px] uppercase italic"><Clock size={12}/> En attente</span>
                        )}
                      </div>
                    </div>
                  )}
                </td>
                <td className="p-6 text-right">
                  <div className="flex gap-2 justify-end">
                    {editingId === user.id ? (
                      <>
                        <button onClick={() => saveChanges(user.id)} className="p-3 bg-green-500 text-white rounded-xl shadow-lg hover:scale-105 transition"><Save size={18}/></button>
                        <button onClick={() => setEditingId(null)} className="p-3 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition"><X size={18}/></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(user)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit2 size={18}/></button>
                        
                        <button 
                          onClick={() => handleToggleValidation(user)}
                          className={`px-5 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-xl transition-all ${
                            user.is_validated 
                            ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' 
                            : 'bg-slate-900 text-white hover:bg-green-600'
                          }`}
                        >
                          {user.is_validated ? <><Ban size={16}/> Bloquer</> : <><UserCheck size={16}/> Valider</>}
                        </button>
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