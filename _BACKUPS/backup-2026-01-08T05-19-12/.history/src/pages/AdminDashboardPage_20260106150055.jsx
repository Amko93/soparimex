import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Settings, Search, Trash2, Edit } from 'lucide-react';

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  // Fausses données pour imiter ta photo 4 (on connectera la vraie base après)
  const users = [
    { id: 1, email: 'soparimex@hotmail.com', name: 'Ghanem', societe: 'SOPARIMEX', role: 'Support', statut: 'Confirmé', lastLogin: '11/11/2025' },
    { id: 2, email: 'ghanemamir397@gmail.com', name: 'Amir GHANEM', societe: 'SOPARIMEXX', role: 'Admin', statut: 'Confirmé', lastLogin: '06/01/2026' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      
      {/* En-tête du Dashboard */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Tableau de Bord Administrateur</h1>
        <div className="flex gap-3">
            <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 flex items-center gap-2">
                <FileText size={18}/> Voir les logs
            </button>
            {/* Ce bouton mène à l'outil Catégories qu'on a fait avant */}
            <button 
                onClick={() => navigate('/admin/categories')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200"
            >
                <Settings size={18}/> Configuration Produits
            </button>
        </div>
      </div>

      {/* Section Gestion des Utilisateurs */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Barre de recherche */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Gestion des utilisateurs ({users.length})</h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Rechercher par nom, email..." 
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
            </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-semibold">Email</th>
                        <th className="p-4 font-semibold">Nom</th>
                        <th className="p-4 font-semibold">Société</th>
                        <th className="p-4 font-semibold">Rôle</th>
                        <th className="p-4 font-semibold">Statut</th>
                        <th className="p-4 font-semibold">Dernière connexion</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition">
                            <td className="p-4 text-slate-700">{user.email}</td>
                            <td className="p-4 text-slate-700 font-medium">{user.name}</td>
                            <td className="p-4 text-slate-500">{user.societe}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    user.role === 'Admin' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                                    {user.statut}
                                </span>
                            </td>
                            <td className="p-4 text-slate-500">{user.lastLogin}</td>
                            <td className="p-4 text-right flex justify-end gap-2">
                                <button className="border border-slate-200 text-slate-600 px-3 py-1 rounded hover:bg-slate-100">Modifier</button>
                                <button className="bg-slate-100 text-slate-600 px-3 py-1 rounded hover:bg-slate-200">Réinitialiser MDP</button>
                                <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1">
                                    <Trash2 size={14}/> Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardPage;