import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, Building2, Phone, FileText, ArrowRight, CheckCircle2, AlertCircle, Loader, Edit3 } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', societe: '', siret: '', phone: ''
  });

  const handleRegister = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
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
      setMessage({ type: 'success', text: "Compte créé ! Redirection vers l'accueil..." });
      setTimeout(() => navigate('/'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12">
        <div className="text-center mb-10">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg ${step === 1 ? 'bg-blue-600' : 'bg-amber-500'} text-white`}>
            {step === 1 ? <UserPlus size={40} /> : <FileText size={40} />}
          </div>
          <h1 className="text-4xl font-black text-slate-900">{step === 1 ? "Créer un compte" : "Vérifiez vos infos"}</h1>
        </div>

        {message.text && (
          <div className={`mb-8 p-6 rounded-2xl flex items-center gap-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'} border`}>
            {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="font-bold">{message.text}</p>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
               <input type="text" placeholder="Nom complet" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
               <input type="text" placeholder="Société" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500" value={formData.societe} onChange={(e) => setFormData({...formData, societe: e.target.value})} />
               <input type="text" placeholder="N° SIRET" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500" value={formData.siret} onChange={(e) => setFormData({...formData, siret: e.target.value})} />
               <input type="tel" placeholder="Téléphone" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <input type="email" placeholder="Email" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <input type="password" placeholder="Mot de passe" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-blue-600 transition-all">Continuer</button>
          </form>
        ) : (
          <div className="space-y-6 text-left">
            <div className="bg-slate-50 rounded-3xl p-8 space-y-4 border border-slate-100 font-bold">
              <p className="flex justify-between"><span>Nom:</span> {formData.fullName}</p>
              <p className="flex justify-between"><span>Société:</span> {formData.societe}</p>
              <p className="flex justify-between"><span>Email:</span> {formData.email}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 py-5 rounded-2xl font-bold">Modifier</button>
              <button onClick={handleRegister} disabled={loading} className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-bold shadow-xl">
                {loading ? <Loader className="animate-spin mx-auto" /> : "Confirmer"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;