import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Building, MessageSquare, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient'; 

const ContactPage = () => {
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
  const [status, setStatus] = useState(null); // 'success', 'error', ou null

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      // Envoi vers Supabase
      const { error } = await supabase
        .from('messages')
        .insert([formData]);

      if (error) throw error;

      // Si succès
      setStatus('success');
      setFormData({ prenom: '', nom: '', entreprise: '', telephone: '', email: '', message: '' }); // On vide le formulaire
      
    } catch (error) {
      console.error("Erreur d'envoi :", error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <span className="font-bold block">Message envoyé !</span>
                  <span className="text-sm">Nous vous répondrons sous 24h.</span>
                </div>
              </div>
            )}

            {/* Message d'Erreur */}
            {status === 'error' && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={24} />
                <div>
                  <span className="font-bold block">Erreur d'envoi</span>
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
              <a href="tel:+33123456789" className="text-slate-500 hover:text-green-600 transition-colors font-medium">
                01 23 45 67 89
              </a>
            </div>
          </div>

          {/* Item 3 : Adresse */}
          <div className="flex items-start gap-6 group">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
              <MapPin size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">Adresse</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                123 Rue de l'Industrie,<br/>
                75000 Paris, France
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;