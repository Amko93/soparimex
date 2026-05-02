import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, FileText, CheckCircle2, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', societe: '', siret: '', phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Nom complet requis';
    if (!formData.societe.trim()) newErrors.societe = 'Nom de société requis';
    if (formData.siret && !/^\d{14}$/.test(formData.siret.replace(/\s/g, '')))
      newErrors.siret = 'Le SIRET doit contenir exactement 14 chiffres';
    if (!formData.phone.trim()) newErrors.phone = 'Téléphone requis';
    if (formData.password.length < 8) newErrors.password = 'Mot de passe : 8 caractères minimum';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    setLoading(true);
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
      return;
    }

    // CORRECTION CRITIQUE DE SÉCURITÉ B2B :
    // Supabase connecte automatiquement après inscription, ce qui contourne notre validation manuelle.
    // On force la déconnexion immédiate si l'inscription a réussi.
    if (data?.user) {
      await supabase.auth.signOut();
    }

    // Afficher le message de confirmation au lieu de rediriger
    setRegistrationSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-site flex items-center justify-center p-6 font-sans">
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

        {registrationSuccess ? (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="text-green-600" size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Compte créé avec succès !</h2>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-left">
              <p className="text-slate-700 font-bold mb-2">
                Votre compte <span className="text-blue-600">{formData.email}</span> a été créé.
              </p>
              <p className="text-slate-600 text-sm">
                Un administrateur doit valider votre compte avant que vous puissiez vous connecter. Vous serez notifié par email une fois votre compte activé.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-block w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); if (validateStep1()) setStep(2); }} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              <div>
                <input type="text" placeholder="Nom complet *" className={`w-full bg-slate-50 border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 ${errors.fullName ? 'border-red-400' : 'border-slate-200'}`} value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                {errors.fullName && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.fullName}</p>}
              </div>
              <div>
                <input type="text" placeholder="Société *" className={`w-full bg-slate-50 border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 ${errors.societe ? 'border-red-400' : 'border-slate-200'}`} value={formData.societe} onChange={(e) => setFormData({...formData, societe: e.target.value})} />
                {errors.societe && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.societe}</p>}
              </div>
              <div>
                <input type="text" placeholder="N° SIRET (optionnel — 14 chiffres)" className={`w-full bg-slate-50 border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 ${errors.siret ? 'border-red-400' : 'border-slate-200'}`} value={formData.siret} onChange={(e) => setFormData({...formData, siret: e.target.value})} />
                {errors.siret && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.siret}</p>}
              </div>
              <div>
                <input type="tel" placeholder="Téléphone *" className={`w-full bg-slate-50 border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-400' : 'border-slate-200'}`} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                {errors.phone && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.phone}</p>}
              </div>
            </div>
            <input type="email" placeholder="Email *" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe * (8 caractères minimum)"
                  className={`w-full bg-slate-50 border rounded-2xl px-6 py-4 pr-12 outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-400' : 'border-slate-200'}`}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.password}</p>}
            </div>
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