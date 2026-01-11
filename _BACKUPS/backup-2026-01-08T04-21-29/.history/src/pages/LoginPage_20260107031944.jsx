import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowRight, Loader, AlertCircle, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage({ type: 'error', text: "Identifiants incorrects ou compte non vérifié." });
      setLoading(false);
    } else {
      setMessage({ type: 'success', text: "Connexion réussie ! Redirection..." });
      // On attend un tout petit peu pour que l'utilisateur voit le message de succès
      setTimeout(() => navigate('/'), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-12">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
              <LogIn size={40} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Bon retour !</h1>
            <p className="text-slate-500 mt-3 font-medium">Connectez-vous pour accéder à votre espace.</p>
          </div>

          {/* Affichage des messages */}
          {message.text && (
            <div className={`mb-8 p-5 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <p className="font-bold text-sm">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative text-left">
              <label className="text-xs font-black text-slate-400 uppercase ml-2 mb-2 block">Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="votre@email.com" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>

            <div className="relative text-left">
              <div className="flex justify-between items-center mb-2 ml-2">
                <label className="text-xs font-black text-slate-400 uppercase block">Mot de passe</label>
                <Link to="/forgot-password" size={20} className="text-[10px] font-bold text-blue-600 hover:underline">Oublié ?</Link>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>

            <button 
              disabled={loading} 
              className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 group mt-4"
            >
              {loading ? (
                <Loader className="animate-spin" />
              ) : (
                <>
                  Se connecter 
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-10">
            <p className="text-slate-500 font-medium">
              Pas encore de compte ? 
            </p>
            <Link 
              to="/register" 
              className="inline-block mt-2 px-6 py-2 bg-slate-100 text-slate-800 rounded-full font-black text-sm hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              Créer un compte client
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;