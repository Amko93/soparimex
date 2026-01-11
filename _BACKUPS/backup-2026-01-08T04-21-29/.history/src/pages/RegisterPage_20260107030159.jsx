import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, Building2, Phone, FileText, ArrowRight, Loader } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    societe: '',
    siret: '',
    phone: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Inscription dans l'Auth de Supabase
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          societe: formData.societe,
          siret: formData.siret,
          phone: formData.phone,
        }
      }
    });

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      alert("Inscription réussie ! Un email de confirmation vous a été envoyé.");
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        <div className="p-12">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
              <UserPlus size={40} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Créer un compte</h1>
            <p className="text-slate-500 mt-3 font-medium">Rejoignez Soparimex pour accéder au catalogue.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <input type="text" placeholder="Nom complet" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
              <div className="relative">
                <input type="text" placeholder="Société" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  onChange={(e) => setFormData({...formData, societe: e.target.value})} />
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <input type="text" placeholder="N° SIRET" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  onChange={(e) => setFormData({...formData, siret: e.target.value})} />
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
              <div className="relative">
                <input type="tel" placeholder="Téléphone" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>

            <div className="relative">
              <input type="email" placeholder="Email professionnel" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                onChange={(e) => setFormData({...formData, email: e.target.value})} />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            </div>

            <div className="relative">
              <input type="password" placeholder="Mot de passe" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            </div>

            <button disabled={loading} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 group">
              {loading ? <Loader className="animate-spin" /> : <>S'inscrire <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 font-medium">
            Déjà un compte ? <Link to="/login" className="text-blue-600 font-bold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;