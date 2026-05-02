import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Loader,
  Package,
  Send,
  MessageCircle,
  User,
} from 'lucide-react';

const ClientRequestDetailsPage = () => {
  const { id } = useParams();
  const messagesEndRef = useRef(null);
  const [lead, setLead] = useState(null);
  const [items, setItems] = useState([]);
  const [messages, setMessages] = useState([]);
  const [senderNames, setSenderNames] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const toast = useToast();
  const [sending, setSending] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!id || !currentUser?.id) return;
    fetchData();
  }, [id, currentUser?.id]);

  useEffect(() => {
    if (!lead?.id) return;
    
    const channelName = `lead_messages_client:${lead.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'lead_messages', filter: `lead_request_id=eq.${lead.id}` },
        (payload) => {
          setMessages((prev) => {
            if (payload.new?.id && prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      );
    
    channel.subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [lead?.id]);

  const loadCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    const { data } = await supabase.from('profiles').select('id, full_name').eq('id', session.user.id).single();
    if (data) setCurrentUser({ id: data.id, full_name: data.full_name || '' });
  };

  const fetchData = async () => {
    setLoading(true);
    setAccessDenied(false);
    try {
      const { data: leadData, error: leadError } = await supabase
        .from('lead_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (leadError || !leadData) {
        setLead(null);
        setLoading(false);
        return;
      }

      if (leadData.client_id !== currentUser?.id) {
        setAccessDenied(true);
        setLead(null);
        setLoading(false);
        return;
      }

      setLead(leadData);

      const [itemsRes, messagesRes] = await Promise.all([
        supabase
          .from('lead_request_items')
          .select('*, products(id, name, image_url, product_code)')
          .eq('lead_request_id', id),
        supabase
          .from('lead_messages')
          .select('*')
          .eq('lead_request_id', id)
          .order('created_at', { ascending: true }),
      ]);

      const messagesList = messagesRes.data || [];
      // Filtrer les sender_id null et undefined avant de récupérer les profils
      const senderIds = [...new Set(messagesList.map((m) => m.sender_id).filter(Boolean))];
      let map = {};
      if (senderIds.length > 0) {
        const { data: senders } = await supabase.from('profiles').select('id, full_name').in('id', senderIds);
        (senders || []).forEach((s) => { map[s.id] = s.full_name || ''; });
      }
      setSenderNames(map);
      setItems(itemsRes.data || []);
      setMessages(messagesList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !currentUser?.id || !lead?.id || sending) return;
    setSending(true);
    try {
      const { data: inserted, error } = await supabase
        .from('lead_messages')
        .insert({
          lead_request_id: lead.id,
          sender_id: currentUser.id,
          content: text,
        })
        .select()
        .single();
      if (error) throw error;
      setNewMessage('');
      if (inserted) setMessages((prev) => [...prev, inserted]);

      // Notifier le commercial assigné si les notifications sont activées
      if (lead.assigned_to && lead.notify_on_message !== false) {
        try {
          const { data: assignedProfile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', lead.assigned_to)
            .single();
          if (assignedProfile?.email) {
            await supabase.functions.invoke('send-email', {
              body: {
                type: 'lead-message',
                to: assignedProfile.email,
                senderName: currentUser.full_name || 'Un client',
                messagePreview: text.substring(0, 200),
                leadTitle: lead.title || 'Demande client',
              }
            });
          }
        } catch (emailError) {
          console.error('Erreur notif commercial:', emailError);
        }
      }
    } catch (err) {
      console.error(err);
      toast('Erreur envoi : ' + err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getSenderName = (msg) => {
    // Si le sender_id est null, l'utilisateur a été supprimé
    if (!msg.sender_id) return 'Utilisateur supprimé';
    if (msg.sender_id === currentUser?.id) return currentUser.full_name || 'Moi';
    return senderNames[msg.sender_id] || 'Équipe commerciale';
  };

  const isMyMessage = (msg) => msg.sender_id === currentUser?.id;
  
  const isDeletedUser = (msg) => !msg.sender_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!lead || accessDenied) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-md">
          <p className="text-slate-700 font-bold mb-4">
            {accessDenied ? 'Vous n\'avez pas accès à cette demande.' : 'Demande introuvable.'}
          </p>
          <Link to="/mes-demandes" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline">
            <ArrowLeft size={18} /> Mes demandes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Link
          to="/mes-demandes"
          className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition mb-6"
        >
          <ArrowLeft size={20} /> Mes demandes
        </Link>

        <p className="text-sm text-slate-500 mb-6">
          Demande du {lead.created_at ? new Date(lead.created_at).toLocaleDateString('fr-FR') : '—'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche : Produits (lecture seule) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package size={18} /> Produits demandés
              </h2>
              {items.length === 0 ? (
                <p className="text-slate-500 text-sm">Aucun produit.</p>
              ) : (
                <ul className="space-y-3">
                  {items.map((row) => {
                    const product = row.products;
                    if (!product) return null;
                    return (
                      <li key={row.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-12 h-12 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <Package size={20} className="text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 text-sm truncate">{product.name}</p>
                          {product.product_code && (
                            <p className="text-xs text-slate-500">Réf. {product.product_code}</p>
                          )}
                        </div>
                        <Link
                          to={`/product/${product.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs font-bold flex-shrink-0"
                        >
                          Fiche
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Colonne droite : Chat */}
          <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <MessageCircle size={20} className="text-slate-500" />
              <span className="font-bold text-slate-800">Conversation avec le commercial</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[60vh]">
              {messages.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">Aucun message. Envoyez le premier.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMyMessage(msg) ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {isDeletedUser(msg) && (
                        <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0">
                          <User size={14} className="text-slate-500" />
                        </div>
                      )}
                      <span className="text-xs text-slate-500">
                        {getSenderName(msg)} · {formatTime(msg.created_at)}
                      </span>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        isMyMessage(msg)
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : isDeletedUser(msg)
                          ? 'bg-slate-200 text-slate-600 rounded-bl-md border border-slate-300'
                          : 'bg-slate-100 text-slate-800 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-slate-50">
              <div className="flex gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Votre message..."
                  rows={2}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-end"
                >
                  {sending ? <Loader className="animate-spin" size={18} /> : <Send size={18} />}
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientRequestDetailsPage;
