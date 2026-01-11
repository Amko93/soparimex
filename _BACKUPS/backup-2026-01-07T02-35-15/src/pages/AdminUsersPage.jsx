import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CheckCircle, Loader, User, ArrowLeft, Pencil, X, Save, UserCog, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState('client');
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      setCurrentUserRole(profile?.role || 'client');
      
      // Sécurité : Si pas admin ou dev, retour à l'accueil
      if (profile?.role !== 'admin' && profile?.role !== 'developpeur') {
        navigate('/');
      }
    };
    checkAccess();
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('full_name');
    setUsers(data || []);
    setLoading(false);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Envoi vers n8n pour Iabako
      await fetch('https://amir93220.app.n8n.cloud/webhook-test/valider-client-soparimex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedUser)
      });

      // Mise à jour locale
      const { error } = await supabase.from('profiles').update({
        full_name: selectedUser.full_name,
        societe: selectedUser.societe,
        siret: selectedUser.siret,
        phone: selectedUser.phone,
        city: selectedUser.city,
        zip_code: selectedUser.zip_code,
        role: selectedUser.role,
        status: 'validé'
      }).eq('id', selectedUser.id);

      if (!error) {
        setShowEdit(false);
        fetchUsers();
        alert("Utilisateur mis à jour et envoyé à Iabako !");
      }
    } catch (err) {
      alert("Erreur de synchronisation n8n");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <Link to="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold transition">
          <ArrowLeft size={20} /> Retour Dashboard
        </Link>
        <h1 className="text-4xl font-black text-slate-900 mb-12 tracking-tight">Gestion des Utilisateurs</h1>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Utilisateur</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Rôle</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Statut</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-slate-800">{u.full_name}</div>
                    <div className="text-xs text-slate-400 font-medium">{u.societe || 'Particulier'}</div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      {u.role === 'developpeur' && <ShieldCheck size={14} className="text-purple-500" />}
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        u.role === 'developpeur' ? 'bg-purple-100 text-purple-600' : 
                        u.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`text-xs font-bold ${u.status === 'validé' ? 'text-green-500' : 'text-amber-500'}`}>
                      {u.status === 'validé' ? 'Vérifié' : 'En attente'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button onClick={() => { setSelectedUser(u); setShowEdit(true); }} className="p-3 hover:bg-blue-50 text-blue-600 rounded-xl transition">
                      <Pencil size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEdit && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-10 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowEdit(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600"><X size={24} /></button>
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800">
              <UserCog className="text-blue-600" /> Modifier le compte
            </h2>
            <form onSubmit={handleUpdateUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">Nom complet</label>
                <input type="text" value={selectedUser.full_name} onChange={e => setSelectedUser({...selectedUser, full_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">Société</label>
                <input type="text" value={selectedUser.societe} onChange={e => setSelectedUser({...selectedUser, societe: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">N° SIRET</label>
                <input type="text" value={selectedUser.siret} onChange={e => setSelectedUser({...selectedUser, siret: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">Téléphone</label>
                <input type="text" value={selectedUser.phone} onChange={e => setSelectedUser({...selectedUser, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase">Rôle utilisateur</label>
                <select 
                  value={selectedUser.role} 
                  disabled={currentUserRole !== 'developpeur'}
                  onChange={e => setSelectedUser({...selectedUser, role: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 appearance-none cursor-pointer"
                >
                  <option value="client">Client</option>
                  <option value="admin">Administrateur</option>
                  <option value="developpeur">Développeur</option>
                </select>
                {currentUserRole !== 'developpeur' && <p className="text-[10px] text-amber-600 mt-2 italic font-medium">Seul un développeur peut modifier les rôles.</p>}
              </div>
              <div className="md:col-span-2 pt-6">
                <button disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                  {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />} Enregistrer et Synchroniser Iabako
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;