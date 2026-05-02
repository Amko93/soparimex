import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useSelection } from '../context/SelectionContext';
import { Trash2, Package, Loader, Send, ShoppingBag } from 'lucide-react';

const SelectionPage = () => {
  const navigate = useNavigate();
  const { selectedItems, removeFromSelection, clearSelection } = useSelection();
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const desc = description.trim();
    if (!desc) {
      setError('Veuillez décrire votre besoin.');
      return;
    }
    if (selectedItems.length === 0) {
      setError('Votre sélection est vide. Ajoutez des produits depuis le catalogue.');
      return;
    }

    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        setError('Vous devez être connecté.');
        setSending(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, societe')
        .eq('id', session.user.id)
        .single();

      const fullName = (profile?.full_name || '').trim().toUpperCase() || 'CLIENT';
      const societe = (profile?.societe || '').trim().toUpperCase() || 'SOCIÉTÉ';
      const generatedTitle = `${fullName} - ${societe}`;

      const { data: lead, error: leadError } = await supabase
        .from('lead_requests')
        .insert({
          client_id: session.user.id,
          status: 'nouveau',
          title: generatedTitle,
          description: desc,
        })
        .select('id')
        .single();

      if (leadError) throw leadError;
      if (!lead?.id) throw new Error('Impossible de créer la demande.');

      const items = selectedItems.map((p) => ({
        lead_request_id: lead.id,
        product_id: p.id,
      }));
      const { error: itemsError } = await supabase.from('lead_request_items').insert(items);
      if (itemsError) throw itemsError;

      // Envoi de l'email de notification aux admins (via send-email qui lit site_settings)
      try {
        const userEmail = session.user.email || 'client@soparimex.com';
        const productNames = selectedItems.map(p => p.name).join(', ');
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'new-lead',
            clientEmail: userEmail,
            clientName: generatedTitle,
            description: desc,
            products: productNames,
          }
        });
      } catch (emailError) {
        console.error('Erreur envoi email:', emailError);
      }

      clearSelection();
      navigate('/selection/confirmation', { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erreur lors de l\'envoi. Réessayez.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShoppingBag className="text-blue-600" size={32} />
            Ma sélection
          </h1>
          <p className="text-slate-500 mt-1">Envoyez votre sélection au commercial pour un devis.</p>
        </div>

        {selectedItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 font-medium mb-6">Votre sélection est vide.</p>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
            >
              Parcourir le catalogue
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <span className="text-sm font-semibold text-slate-600">
                  {selectedItems.length} produit{selectedItems.length > 1 ? 's' : ''}
                </span>
              </div>
              <ul className="divide-y divide-slate-100">
                {selectedItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <Package size={24} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{item.name}</p>
                      {item.product_code && (
                        <p className="text-xs text-slate-500 font-mono">Réf. {item.product_code}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromSelection(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                      title="Retirer"
                    >
                      <Trash2 size={20} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Envoyer la demande</h2>
              {error && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-semibold text-slate-600 mb-2">
                  Décrivez votre besoin
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre besoin (urgence, détails, projet...)"
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {sending ? <Loader className="animate-spin" size={22} /> : <Send size={22} />}
                Envoyer la demande au commercial
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SelectionPage;
