import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Vrai = Inscription, Faux = Connexion
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Inscription
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Inscription réussie ! Vérifiez vos emails.");
      } else {
        // Connexion
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/'); // Une fois connecté, on retourne à l'accueil
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">{isSignUp ? 'Créer un compte' : 'Connexion'}</h1>
          <p className="text-slate-500">Espace client Soparimex</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="client@exemple.com" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="••••••••" 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition flex justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? "S'inscrire" : "Se connecter")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            {isSignUp ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;