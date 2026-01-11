import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  LayoutGrid, 
  Users, 
  Settings, 
  ArrowLeft, 
  UserCheck, 
  Package, 
  Layers, 
  ChevronRight,
  BarChart3
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    categories: 0,
    subcategories: 0,
    products: 0,
    pendingUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    // On récupère les comptes de chaque table en parallèle
    const [cat, sub, prod, users] = await Promise.all([
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('subcategories').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'en_attente')
    ]);

    setStats({
      categories: cat.count || 0,
      subcategories: sub.count || 0,
      products: prod.count || 0,
      pendingUsers: users.count || 0
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* ENTÊTE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-4 font-bold transition">
              <ArrowLeft size={18} /> Retour au site
            </Link>
            <h1 className="text-4xl font-black text-[#1E293B]">Tableau de bord</h1>
            <p className="text-slate-500 mt-2 font-medium">Bienvenue, Amir. Voici l'état de ton catalogue et de tes clients.</p>
          </div>
          
          <button 
            onClick={fetchStats}
            className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition flex items-center gap-2 shadow-sm"
          >
            <BarChart3 size={20} className="text-blue-600" />
            Actualiser les stats
          </button>
        </div>

        {/* GRILLE DES STATISTIQUES RAPIDES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Layers size={24} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{stats.categories}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catégories</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <LayoutGrid size={24} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{stats.subcategories}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sous-Catégories</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Package size={24} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{stats.products}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Produits</div>
              </div>
            </div>
          </div>

          <div className={`bg-white p-6 rounded-[2rem] border shadow-sm transition-colors ${stats.pendingUsers > 0 ? 'border-red-100 bg-red-50/30' : 'border-slate-100'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.pendingUsers > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-green-50 text-green-600'}`}>
                <UserCheck size={24} />
              </div>
              <div>
                <div className={`text-2xl font-black ${stats.pendingUsers > 0 ? 'text-red-600' : 'text-slate-800'}`}>{stats.pendingUsers}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">En attente</div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* CARTE GÉRER LE CATALOGUE */}
          <Link to="/admin/categories" className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-200">
                <LayoutGrid size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">Gérer le Catalogue</h3>
                <p className="text-slate-500 mt-1 font-medium">Ajouter, modifier ou supprimer des articles</p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ChevronRight size={24} />
            </div>
          </Link>

          {/* CARTE VALIDER LES COMPTES */}
          <Link to="/admin/users" className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between relative overflow-hidden">
            {stats.pendingUsers > 0 && (
              <div className="absolute top-6 right-6 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
            )}
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-green-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-green-200">
                <Users size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">Valider les Clients</h3>
                <p className="text-slate-500 mt-1 font-medium">Synchronisation Iabako & accès site</p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
              <ChevronRight size={24} />
            </div>
          </Link>

        </div>

        {/* SECTION BAS DE PAGE */}
        <div className="mt-12 p-10 bg-slate-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-slate-200">
          <div>
            <h4 className="text-2xl font-black mb-2">Besoin d'aide ?</h4>
            <p className="text-slate-400 font-medium">L'interface est synchronisée en temps réel avec Supabase et n8n.</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-slate-800 px-6 py-4 rounded-2xl border border-slate-700">
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Système</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-bold">Opérationnel</span>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;