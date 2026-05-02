import React, { useState, useEffect } from 'react';
import { Mail, Phone, Send, Building, MessageSquare, Loader, CheckCircle, AlertCircle, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ContactPage = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // États du formulaire
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    entreprise: '',
    telephone: '',
    email: '',
    message: ''
  });

  // États de gestion d'envoi
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', 'validation', ou null
  const [emailWarning, setEmailWarning] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser ?? null);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription?.unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.message.trim().length < 10) {
      setStatus('validation');
      return;
    }
    setIsSubmitting(true);
    setStatus(null);
    setEmailWarning(false);

    try {
      // Envoi vers Supabase (table messages)
      const { error: dbError } = await supabase
        .from('messages')
        .insert([formData]);

      if (dbError) throw dbError;

      // Envoi de l'email via Edge Function Supabase
      const sujet = `Contact - ${formData.prenom} ${formData.nom}`.trim() || 'Message depuis le site';
      const emailPayload = {
        type: 'contact',
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        entreprise: formData.entreprise,
        telephone: formData.telephone,
        message: formData.message,
        sujet: sujet
      };
      
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: emailPayload
      });

      if (emailError) {
        setEmailWarning(true);
      }

      // Si succès
      setStatus('success');
      setFormData({ prenom: '', nom: '', entreprise: '', telephone: '', email: '', message: '' });
    } catch (error) {
      console.error("Erreur d'envoi :", error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans px-4">
        <div className="max-w-md w-full text-center bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-600">
            <Mail size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">
            Connexion requise
          </h2>
          <p className="text-slate-500 font-medium mb-8">
            Vous devez être connecté pour nous envoyer un message.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
          >
            <LogIn size={20} /> Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 font-sans min-h-screen">
      
      {/* En-tête */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-blue-600 mb-4 tracking-tight">
          Contactez-nous
        </h1>
        <p className="text-slate-500 text-lg font-medium">
          Une question, une demande de devis ? Notre équipe est là pour vous aider.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        
        {/* --- COLONNE GAUCHE : FORMULAIRE --- */}
        <div className="lg:col-span-7">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
            
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              Envoyer un message
            </h2>
            
            {/* Message de Succès */}
            {status === 'success' && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircle size={24} />
                <div>
                  <span className="font-bold block">Message envoyé avec succès</span>
                  <span className="text-sm">Nous vous répondrons sous 24h.</span>
                </div>
              </div>
            )}

            {/* Avertissement email */}
            {status === 'success' && emailWarning && (
              <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle size={24} />
                <span className="text-sm">Votre message a bien été enregistré, mais la notification email a échoué. Notre équipe le recevra quand même.</span>
              </div>
            )}

            {/* Erreur de validation */}
            {status === 'validation' && (
              <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={24} />
                <span className="font-bold text-sm">Votre message doit contenir au moins 10 caractères.</span>
              </div>
            )}

            {/* Message d'Erreur réseau */}
            {status === 'error' && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={24} />
                <div>
                  <span className="font-bold block">Erreur lors de l'envoi</span>
                  <span className="text-sm">Veuillez réessayer ou nous appeler directement.</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Ligne 1 : Prénom / Nom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Prénom *</label>
                  <input 
                    type="text" name="prenom" placeholder="Votre prénom" 
                    value={formData.prenom} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nom *</label>
                  <input 
                    type="text" name="nom" placeholder="Votre nom" 
                    value={formData.nom} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                    required
                  />
                </div>
              </div>

              {/* Ligne 2 : Entreprise / Téléphone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                    <Building size={14}/> Entreprise
                  </label>
                  <input 
                    type="text" name="entreprise" placeholder="Nom de l'entreprise" 
                    value={formData.entreprise} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                    <Phone size={14}/> Téléphone
                  </label>
                  <input 
                    type="tel" name="telephone" placeholder="Votre numéro" 
                    value={formData.telephone} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                  <Mail size={14}/> Adresse e-mail *
                </label>
                <input 
                  type="email" name="email" placeholder="votre.email@exemple.com" 
                  value={formData.email} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                  <MessageSquare size={14}/> Message *
                </label>
                <textarea 
                  name="message" rows="5" placeholder="Écrivez votre message ici..." 
                  value={formData.message} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all resize-none"
                  required
                ></textarea>
              </div>

              {/* Bouton Envoyer */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 text-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader className="animate-spin" />
                ) : (
                  <>
                    <Send size={20} /> Envoyer le message
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* --- COLONNE DROITE : COORDONNÉES --- */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-10">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Nos coordonnées</h2>

          {/* Item 1 : Email */}
          <div className="flex items-start gap-6 group">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Mail size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">Email</h3>
              <a href="mailto:contact@soparimex.com" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">
                contact@soparimex.com
              </a>
            </div>
          </div>

          {/* Item 2 : Téléphone */}
          <div className="flex items-start gap-6 group">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Phone size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">Téléphone</h3>
              <a href="tel:+33761339500" className="text-slate-500 hover:text-green-600 transition-colors font-medium">
                07 61 33 95 00
              </a>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default ContactPage;