import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Loader,
  Send,
  MessageCircle,
  User,
  Paperclip,
  X,
  FileText,
  Download,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

const ClientRequestDetailsPage = () => {
  const { id } = useParams();
  const scrollContainerRef = useRef(null);
  const [lead, setLead] = useState(null);
  const [messages, setMessages] = useState([]);
  const [senderNames, setSenderNames] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const toast = useToast();
  const [sending, setSending] = useState(false);
  const [assignedCommercial, setAssignedCommercial] = useState(null);
  const isInitialLoad = useRef(true);
  const channelRef = useRef(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (isInitialLoad.current) {
      // Premier chargement : aller directement en bas sans animation
      container.scrollTop = container.scrollHeight;
      isInitialLoad.current = false;
    } else {
      // Nouveau message temps réel : ne scroller que si déjà proche du bas
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
      if (isNearBottom) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages]);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!id || !currentUser?.id) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentUser?.id]);

  useEffect(() => {
    if (!lead?.id || !currentUser?.id) return;

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

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Annoncer sa présence sur cette page
        await channel.track({ user_id: currentUser.id });
      }
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [lead?.id, currentUser?.id]);

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

      // Charger le profil du commercial assigné
      if (leadData.assigned_to) {
        const { data: commercialData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, job_title, phone, email, city, bio, bio_visible')
          .eq('id', leadData.assigned_to)
          .single();
        setAssignedCommercial(commercialData || null);
      } else {
        setAssignedCommercial(null);
      }

      const [messagesRes] = await Promise.all([
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
      setMessages(messagesList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast('Le fichier ne doit pas dépasser 10 Mo.', 'error');
      return;
    }
    setSelectedFile(file);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text && !selectedFile) return;
    if (!currentUser?.id || !lead?.id || sending) return;
    setSending(true);
    try {
      let fileUrl = null;
      let fileName = null;
      let fileType = null;

      // Upload du fichier si présent
      if (selectedFile) {
        const path = `${lead.id}/${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('lead-files')
          .upload(path, selectedFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('lead-files').getPublicUrl(path);
        fileUrl = urlData?.publicUrl || null;
        fileName = selectedFile.name;
        fileType = selectedFile.type;
      }

      const { data: inserted, error } = await supabase
        .from('lead_messages')
        .insert({
          lead_request_id: lead.id,
          sender_id: currentUser.id,
          content: text || '',
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
        })
        .select()
        .single();
      if (error) throw error;
      setNewMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (inserted) setMessages((prev) => [...prev, inserted]);

      // Notifier le commercial assigné si les notifications sont activées
      if (lead.assigned_to && lead.notify_on_message !== false) {
        try {
          // 1. Vérifier si le commercial est déjà sur la page (présence)
          const presenceState = channelRef.current?.presenceState() || {};
          const onlineUserIds = Object.values(presenceState).flat().map((p) => p.user_id);
          const recipientOnline = onlineUserIds.includes(lead.assigned_to);

          // 2. Vérifier le debounce (une seule notif toutes les 5 min)
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
          const alreadyNotifiedRecently = lead.last_notified_at && lead.last_notified_at > fiveMinutesAgo;

          if (!recipientOnline && !alreadyNotifiedRecently) {
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
                  leadTitle: lead.title || 'Demande client',
                }
              });
              // Mettre à jour last_notified_at pour le debounce
              await supabase.from('lead_requests').update({ last_notified_at: new Date().toISOString() }).eq('id', lead.id);
              setLead((prev) => prev ? { ...prev, last_notified_at: new Date().toISOString() } : prev);
            }
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

        <div className="space-y-4">
          {/* Carte profil du commercial assigné */}
          {assignedCommercial ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200">
                  {assignedCommercial.avatar_url ? (
                    <img
                      src={assignedCommercial.avatar_url}
                      alt={assignedCommercial.full_name || 'Commercial'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={28} className="text-slate-400" />
                  )}
                </div>
                {/* Infos principales */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-0.5">Votre commercial</p>
                  <p className="font-black text-slate-900">{assignedCommercial.full_name || '—'}</p>
                  {assignedCommercial.job_title && (
                    <p className="text-sm text-slate-500">{assignedCommercial.job_title}</p>
                  )}
                  <div className="mt-2 space-y-1">
                    {assignedCommercial.email && (
                      <p className="text-sm text-slate-600 flex items-center gap-1.5">
                        <Mail size={13} className="text-slate-400 flex-shrink-0" />
                        <a href={`mailto:${assignedCommercial.email}`} className="hover:text-blue-600 transition truncate">
                          {assignedCommercial.email}
                        </a>
                      </p>
                    )}
                    {assignedCommercial.phone && (
                      <p className="text-sm text-slate-600 flex items-center gap-1.5">
                        <Phone size={13} className="text-slate-400 flex-shrink-0" />
                        <a href={`tel:${assignedCommercial.phone}`} className="hover:text-blue-600 transition">
                          {assignedCommercial.phone}
                        </a>
                      </p>
                    )}
                    {assignedCommercial.city && (
                      <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                        {assignedCommercial.city}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* Bio — uniquement si visible par les clients */}
              {assignedCommercial.bio && assignedCommercial.bio_visible !== false && (
                <p className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {assignedCommercial.bio}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Aucun commercial n'est encore assigné à cette demande. Vous serez notifié dès qu'un membre de l'équipe prend en charge votre dossier.
              </p>
            </div>
          )}

          {/* Chat */}
          <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <MessageCircle size={20} className="text-slate-500" />
              <span className="font-bold text-slate-800">Conversation</span>
            </div>

            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[60vh]">
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
                      {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                      {msg.file_url && (
                        <div className={`${msg.content ? 'mt-2' : ''}`}>
                          {msg.file_type?.startsWith('image/') ? (
                            <img
                              src={msg.file_url}
                              alt={msg.file_name || 'Image'}
                              className="max-w-[240px] max-h-[240px] rounded-lg object-cover cursor-pointer"
                              onClick={() => window.open(msg.file_url, '_blank')}
                            />
                          ) : (
                            <a
                              href={msg.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 text-xs font-medium underline ${isMyMessage(msg) ? 'text-blue-100' : 'text-blue-600'}`}
                            >
                              <FileText size={14} />
                              {msg.file_name || 'Fichier joint'}
                              <Download size={12} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-slate-50">
              {/* File preview */}
              {selectedFile && (
                <div className="mb-2 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <FileText size={16} className="text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-blue-800 truncate flex-1">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="text-slate-400 hover:text-red-500 transition flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                  onChange={handleFileChange}
                />
                {/* Paperclip button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-300 transition self-end"
                  title="Joindre un fichier"
                >
                  <Paperclip size={18} />
                </button>
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
                  disabled={(!newMessage.trim() && !selectedFile) || sending}
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
