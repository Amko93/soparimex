import React, { useState, useEffect } from 'react';
import { Mail, Phone, Send, MessageSquare, Loader, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useToast } from '../context/ToastContext';

const ContactPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          setUser(currentUser);
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, societe, phone, email')
            .eq('id', currentUser.id)
            .single();
          if (profileData) setProfile(profileData);
        }
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription?.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast('Veuillez indiquer un sujet.', 'error');
      return;
    }
    if (formData.message.trim().length < 10) {
      toast('Votre message doit contenir au moins 10 caractères.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Créer le dossier (lead_request)
      const { data: lead, error: leadError } = await supabase
        .from('lead_requests')
        .insert({
          client_id: user.id,
          title: formData.subject.trim(),
          status: 'nouveau',
          description: formData.message.trim(),
        })
        .select()
        .single();

      if (leadError) throw leadError;

      // 2. Créer le premier message dans le dossier
      const { error: msgError } = await supabase
        .from('lead_messages')
        .insert({
          lead_request_id: lead.id,
          sender_id: user.id,
          content: formData.message.trim(),
        });

      if (msgError) throw msgError;

      toast('Votre demande a été envoyée ! Notre équipe vous répond bientôt.', 'success');
      navigate(`/mes-demandes/${lead.id}`);
    } catch (error) {
      console.error('Erreur création demande:', error);
      toast('Une erreur est survenue. Veuillez réessayer.', 'error');
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
          <h2 className="text-2xl font-black text-slate-900 mb-3">Connexion requise</h2>
          <p className="text-slate-500 font-medium mb-8">
            Vous devez être connecté pour nous envoyer une demande.
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
        <h1 className="text-5xl font-black text-blue-600 mb-4 tracking-tight">Faire une demande</h1>
        <p className="text-slate-500 text-lg font-medium">
          Décrivez votre besoin, notre équipe vous répond et suit votre dossier.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

        {/* Formulaire */}
        <div className="lg:col-span-7">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">

            {/* Identité pré-remplie */}
            {profile && (
              <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Votre identité</p>
                <p className="font-bold text-slate-800">
                  {profile.full_name}{profile.societe ? ` — ${profile.societe}` : ''}
                </p>
                <p className="text-sm text-slate-500">
                  {profile.email}{profile.phone ? ` · ${profile.phone}` : ''}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sujet */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Sujet de la demande *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ex : Demande de devis visserie inox, Besoin en fournitures plomberie…"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                  <MessageSquare size={14} /> Votre message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  placeholder="Décrivez votre besoin en détail : produits recherchés, quantités, délais souhaités…"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all resize-none"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  {formData.message.length < 10
                    ? `Encore ${10 - formData.message.length} caractère(s) minimum`
                    : '✓ Message valide'}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 text-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader className="animate-spin" />
                ) : (
                  <><Send size={20} /> Envoyer la demande</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-6">Comment ça marche ?</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black text-sm flex-shrink-0">1</div>
                <div>
                  <p className="font-bold text-slate-800">Vous décrivez votre besoin</p>
                  <p className="text-sm text-slate-500 mt-1">Remplissez le formulaire avec votre demande — produits, quantités, délais souhaités.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black text-sm flex-shrink-0">2</div>
                <div>
                  <p className="font-bold text-slate-800">Un dossier est créé</p>
                  <p className="text-sm text-slate-500 mt-1">Votre demande est immédiatement visible par notre équipe commerciale.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black text-sm flex-shrink-0">3</div>
                <div>
                  <p className="font-bold text-slate-800">On échange dans le dossier</p>
                  <p className="text-sm text-slate-500 mt-1">Vous suivez l'avancement et communiquez directement avec notre commercial.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="space-y-5 pt-6 border-t border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                <Mail size={22} strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-bold text-slate-800">Email</p>
                <a href="mailto:contact@soparimex.com" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">
                  contact@soparimex.com
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
                <Phone size={22} strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-bold text-slate-800">Téléphone</p>
                <a href="tel:+33761339500" className="text-slate-500 hover:text-green-600 transition-colors text-sm">
                  07 61 33 95 00
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
