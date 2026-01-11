import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, Building2, Phone, FileText, ArrowRight, CheckCircle2, AlertCircle, Loader, Edit3 } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Saisie, 2 = Confirmation
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    societe: '',
    siret: '',
    phone: ''
  });

  const handleRegister = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

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
      setMessage({ type: 'error', text: "Erreur : " + error.message });
      setLoading(false);
    } else {
      setMessage({ type: 'success', text: "Compte créé avec succès ! Bienvenue chez Soparimex." });
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-12">
          
          {/* Header Dynamique */}
          <div className="text-center mb-10">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg transition-colors ${step === 1 ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'}`}>
              {step === 1 ? <UserPlus size={40} /> : <FileText size={40} />}
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {step === 1 ? "Créer un compte" : "Vérifiez vos infos"}
            </h1>
          </div>

          {/* Affichage des messages de succès ou d'erreur */}
          {message.text && (
            <div className={`mb-8 p-6 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              <p className="font-bold">{message.text}</p>
            </div>
          )}

          {step === 1 ? (
            /* ETAPE 1 : FORMULAIRE */
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                  <input type="text" placeholder="Nom complet" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                    value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
                <div className="relative">
                  <input type="text" placeholder="Société" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                    value={formData.societe} onChange={(e) => setFormData({...formData, societe: e.target.value})} />
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                  <input type="text" placeholder="N° SIRET" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                    value={formData.siret} onChange={(e) => setFormData({...formData, siret: e.target.value})} />
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
                <div className="relative">
                  <input type="tel" placeholder="Téléphone" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                    value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
              </div>
              <div className="relative text-left">
                <input type="email" placeholder="Email professionnel" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
              <div className="relative text-left">
                <input type="password" placeholder="Mot de passe" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 group">
                Continuer <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            /* ETAPE 2 : RECAPITULATIF AVANT VALIDATION */
            <div className="space-y-6 animate-in slide-in-from-right duration-500">
              <div className="bg-slate-50 rounded-3xl p-8 space-y-4 border border-slate-100">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-400 font-bold uppercase text-xs">Nom</span>
                  <span className="text-slate-800 font-bold">{formData.fullName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-400 font-bold uppercase text-xs">Société</span>
                  <span className="text-slate-800 font-bold">{formData.societe}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-400 font-bold uppercase text-xs">SIRET</span>
                  <span className="text-slate-800 font-bold">{formData.siret}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-400 font-bold uppercase text-xs">Email</span>
                  <span className="text-slate-800 font-bold">{formData.email}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 text-slate-600 font-black py-5 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                  <Edit3 size={18} /> Modifier
                </button>
                <button onClick={handleRegister} disabled={loading} className="flex-[2] bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                  {loading ? <Loader className="animate-spin" /> : "Confirmer la création"}
                </button>
              </div>
            </div>
          )}

          <p className="text-center mt-8 text-slate-500 font-medium">
            Déjà un compte ? <Link to="/login" className="text-blue-600 font-bold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;