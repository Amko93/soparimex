import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { LogOut, User, FileText, Settings } from 'lucide-react'; // <-- J'ai ajouté Settings

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Barre du haut */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Soparimex <span className="text-slate-400 font-normal">| Espace Client</span></h1>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition"
        >
          <LogOut size={18} />
          <span className="hidden md:inline">Se déconnecter</span>
        </button>
      </nav>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Bienvenue</h2>
          <p className="text-slate-500">Gérez vos documents et suivez vos projets.</p>
        </div>

        {/* Grille des options */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Carte 1 : Devis */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition cursor-pointer">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4">
              <FileText />
            </div>
            <h3 className="font-bold text-lg mb-2">Mes Devis</h3>
            <p className="text-slate-500 text-sm">Consultez vos devis en cours et signés.</p>
          </div>

          {/* Carte 2 : Profil */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition cursor-pointer">
            <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
              <User />
            </div>
            <h3 className="font-bold text-lg mb-2">Mon Profil</h3>
            <p className="text-slate-500 text-sm">Modifiez vos informations personnelles.</p>
          </div>

          {/* Carte 3 : Admin Tool (Celle-ci est nouvelle) */}
          <div 
            onClick={() => navigate('/admin/categories')}
            className="bg-slate-900 text-white p-6 rounded-xl shadow-lg shadow-slate-300 hover:scale-105 transition cursor-pointer border border-slate-700"
          >
            <div className="bg-slate-800 w-12 h-12 rounded-lg flex items-center justify-center text-amber-400 mb-4">
              <Settings />
            </div>
            <h3 className="font-bold text-lg mb-2">Administration</h3>
            <p className="text-slate-400 text-sm">Gérer les produits et catégories du site.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;