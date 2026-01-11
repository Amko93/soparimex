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
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage({ type: 'error', text: "Erreur de connexion." });
      setLoading(false);
    } else {
      setMessage({ type: 'success', text: "Connexion réussie !" });
      setTimeout(() => navigate('/'), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center">
        <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6"><LogIn size={40} /></div>
        <h1 className="text-4xl font-black mb-8">Bon retour !</h1>
        {message.text && <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} font-bold`}>{message.text}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" className="w-full bg-slate-50 border rounded-2xl px-6 py-4 outline-none" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Mot de passe" className="w-full bg-slate-50 border rounded-2xl px-6 py-4 outline-none" onChange={(e) => setPassword(e.target.value)} />
          <button disabled={loading} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-blue-600 transition-all">
            {loading ? <Loader className="animate-spin mx-auto" /> : "Se connecter"}
          </button>
        </form>
        <p className="mt-8 text-slate-500">Pas de compte ? <Link to="/register" className="text-blue-600 font-bold underline">Créer un compte</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;