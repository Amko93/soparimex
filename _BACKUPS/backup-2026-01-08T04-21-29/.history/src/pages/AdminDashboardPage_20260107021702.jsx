import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Users, Settings, ArrowLeft, UserCheck } from 'lucide-react';

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold transition">
          <ArrowLeft size={20} /> Retour au site
        </Link>

        <h1 className="text-4xl font-black text-[#1E293B] mb-12">Tableau de bord Administrateur</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Gérer le catalogue */}
          <Link to="/admin/categories" className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <LayoutGrid size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Catalogue</h3>
            <p className="text-slate-500 mt-2">Gérer les catégories, sous-catégories et produits.</p>
          </Link>

          {/* Valider les comptes (NOUVEAU) */}
          <Link to="/admin/users" className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <UserCheck size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Validation</h3>
            <p className="text-slate-500 mt-2">Valider les nouveaux inscrits et synchroniser avec Iabako.</p>
          </Link>

          {/* Paramètres (Placeholder) */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 opacity-60">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6">
              <Settings size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-400">Paramètres</h3>
            <p className="text-slate-500 mt-2">Configuration générale du site.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;