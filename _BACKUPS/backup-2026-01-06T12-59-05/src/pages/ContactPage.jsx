import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';

// --- REMPLACE PAR TON LIEN N8N ICI ---
const N8N_WEBHOOK_URL = 'https://ton-n8n.cloud/webhook/...'; 

const ContactPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type: "client" }),
      });
      alert("Message envoyé !");
      e.target.reset();
    } catch (error) {
      alert("Erreur d'envoi (vérifie ton lien n8n).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center items-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-lg w-full border border-slate-100">
        <h1 className="text-3xl font-bold mb-2 text-center text-slate-800">Soparimex</h1>
        <p className="text-center text-slate-500 mb-6">Contactez-nous pour un devis</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="firstname" placeholder="Prénom" required className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            <input name="lastname" placeholder="Nom" required className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <input name="email" type="email" placeholder="Email pro" required className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
          <input name="company" placeholder="Entreprise" className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
          <textarea name="message" placeholder="Votre demande..." rows={4} required className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            Envoyer ma demande
          </button>
        </form>
      </div>
    </div>
  );
};
export default ContactPage;