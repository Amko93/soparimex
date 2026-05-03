import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, Loader, X, Mail, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const msgTimerRef = useRef(null);
  const forgotPwTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(msgTimerRef.current);
      clearTimeout(forgotPwTimerRef.current);
    };
  }, []);

  useEffect(() => {
    // Afficher le message de succès si présent dans location.state
    if (location.state?.message) {
      setMessage({ type: 'success', text: location.state.message });
      msgTimerRef.current = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
    return () => clearTimeout(msgTimerRef.current);
  }, [location.state]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordMessage({ type: 'error', text: 'Veuillez entrer votre adresse email.' });
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/update-password`
      });

      if (error) throw error;

      setForgotPasswordMessage({
        type: 'success',
        text: 'Un email de réinitialisation a été envoyé. Vérifiez votre boîte de réception.'
      });
      forgotPwTimerRef.current = setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
        setForgotPasswordMessage({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      console.error(err);
      setForgotPasswordMessage({ 
        type: 'error', 
        text: err.message || 'Erreur lors de l\'envoi de l\'email.' 
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      const msg = authError.message?.toLowerCase() ?? '';
      let text;
      if (msg.includes('email') && msg.includes('confirm')) {
        text = 'Veuillez cliquer sur le lien reçu par email pour activer votre compte.';
      } else if (
        msg.includes('invalid login credentials') ||
        msg.includes('invalid credentials') ||
        msg.includes('wrong password') ||
        msg.includes('user not found') ||
        msg.includes('no user found')
      ) {
        text = 'Email ou mot de passe incorrect.';
      } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed')) {
        text = 'Erreur réseau. Vérifiez votre connexion et réessayez.';
      } else if (msg.includes('too many') || msg.includes('rate limit')) {
        text = 'Trop de tentatives. Veuillez patienter quelques minutes.';
      } else {
        text = 'Erreur de connexion. Réessayez ou contactez le support.';
      }
      setMessage({ type: 'error', text });
      setLoading(false);
      return;
    }

    // Vérification du profil (existant + validation B2B)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_validated')
      .eq('id', authData.user.id)
      .maybeSingle();

    // Profil absent = compte supprimé par l'admin
    if (profileError || profile == null) {
      await supabase.auth.signOut();
      setMessage({ type: 'error', text: "Aucun compte existant." });
      setLoading(false);
      return;
    }

    // Si le compte n'est pas validé, déconnexion immédiate
    if (!profile.is_validated) {
      await supabase.auth.signOut();
      setMessage({ 
        type: 'error', 
        text: "Votre compte est en attente de validation par l'administrateur." 
      });
      setLoading(false);
      return;
    }

    // Compte validé : redirection autorisée
    setMessage({ type: 'success', text: "Connexion réussie !" });
    setTimeout(() => navigate('/'), 1000);
  };

  return (
    <div className="min-h-screen bg-site flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center relative">
        <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6"><LogIn size={40} /></div>
        <h1 className="text-4xl font-black mb-8">Bon retour !</h1>
        {message.text && <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} font-bold`}>{message.text}</div>}
        {!showForgotPassword ? (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                className="w-full bg-slate-50 border rounded-2xl px-6 py-4 outline-none" 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Mot de passe" 
                  value={password}
                  className="w-full bg-slate-50 border rounded-2xl px-6 py-4 pr-24 outline-none" 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </div>
              <button disabled={loading} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-blue-600 transition-all">
                {loading ? <Loader className="animate-spin mx-auto" /> : "Se connecter"}
              </button>
            </form>
            <p className="mt-8 text-slate-500">Pas de compte ? <Link to="/register" className="text-blue-600 font-bold underline">Créer un compte</Link></p>
          </>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordEmail('');
                setForgotPasswordMessage({ type: '', text: '' });
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black mb-2">Mot de passe oublié</h2>
            <p className="text-slate-600 mb-6">Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
            
            {forgotPasswordMessage.text && (
              <div className={`mb-4 p-4 rounded-xl ${forgotPasswordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} font-bold`}>
                {forgotPasswordMessage.text}
              </div>
            )}
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full bg-slate-50 border rounded-2xl pl-12 pr-6 py-4 outline-none"
                  disabled={forgotPasswordLoading}
                />
              </div>
              <button
                type="submit"
                disabled={forgotPasswordLoading}
                className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forgotPasswordLoading ? <Loader className="animate-spin mx-auto" /> : "Envoyer le lien"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordEmail('');
                setForgotPasswordMessage({ type: '', text: '' });
              }}
              className="w-full text-slate-500 font-bold hover:text-slate-700 transition"
            >
              Retour à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;