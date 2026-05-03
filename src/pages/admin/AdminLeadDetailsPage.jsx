import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Loader,
  User,
  Send,
  MessageCircle,
  Phone,
  Mail,
  Building2,
  X,
  MapPin,
  Hash,
  Bell,
  BellOff,
  Paperclip,
  FileText,
  Download,
} from 'lucide-react';

const AdminLeadDetailsPage = () => {
  const { id } = useParams();
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [lead, setLead] = useState(null);
  const [messages, setMessages] = useState([]);
  const [clientProfile, setClientProfile] = useState(null);
  const [senderNames, setSenderNames] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const toast = useToast();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(true);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!id || !currentUser) return;
    fetchLead();
  }, [id, currentUser?.id]);

  useEffect(() => {
    if (!lead?.id || !currentUser) return;
    
    const channelName = `lead_messages:${lead.id}`;
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
  }, [lead?.id, currentUser]);

  const loadCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    const { data } = await supabase.from('profiles').select('id, role, full_name').eq('id', session.user.id).single();
    if (data) setCurrentUser({ id: data.id, role: (data.role || '').toLowerCase(), full_name: data.full_name || '' });
  };

  const canAccess = (leadData) => {
    if (!currentUser || !leadData) return false;
    const r = currentUser.role;
    if (r === 'admin' || r === 'developpeur') return true;
    if (r === 'commercial' && (leadData.assigned_to === currentUser.id || !leadData.assigned_to)) return true;
    if (r === 'client' && leadData.client_id === currentUser.id) return true;
    return false;
  };

  const fetchLead = async () => {
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

      if (!canAccess(leadData)) {
        setAccessDenied(true);
        setLead(null);
        setLoading(false);
        return;
      }

      setLead(leadData);
      setNotifyEnabled(leadData.notify_on_message !== false);

      const [messagesRes, clientRes] = await Promise.all([
        supabase
          .from('lead_messages')
          .select('*')
          .eq('lead_request_id', id)
          .order('created_at', { ascending: true }),
        leadData.client_id
          ? supabase.from('profiles').select('id, full_name, societe, email, phone, siret, address, ville, code_postal').eq('id', leadData.client_id).single()
          : Promise.resolve({ data: null }),
      ]);

      const messagesList = messagesRes.data || [];
      // Filtrer les sender_id null et undefined avant de récupérer les profils
      const senderIds = [...new Set(messagesList.map((m) => m.sender_id).filter(Boolean))];
      let sendersMap = {};
      if (senderIds.length > 0) {
        const { data: senders } = await supabase.from('profiles').select('id, full_name').in('id', senderIds);
        (senders || []).forEach((s) => { sendersMap[s.id] = s.full_name || ''; });
      }
      setSenderNames(sendersMap);
      setMessages(messagesList);
      setClientProfile(clientRes.data || null);
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

      // Envoi de l'email au client si l'expéditeur est un membre du staff
      const isStaff = currentUser.role === 'admin' || currentUser.role === 'commercial' || currentUser.role === 'developpeur';
      if (isStaff && clientProfile?.email) {
        try {
          await supabase.functions.invoke('send-email', {
            body: {
              type: 'lead-message',
              to: clientProfile.email,
              senderName: currentUser.full_name || 'L\'équipe Soparimex',
              messagePreview: text.substring(0, 200),
              leadTitle: lead.title || 'Votre demande',
            }
          });
        } catch (emailError) {
          console.error('Erreur envoi email client:', emailError);
        }
      }
    } catch (err) {
      console.error(err);
      toast('Erreur envoi : ' + err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const toggleNotify = async () => {
    const newVal = !notifyEnabled;
    setNotifyEnabled(newVal);
    await supabase.from('lead_requests').update({ notify_on_message: newVal }).eq('id', lead.id);
  };

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    if (!lead?.id || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const { error } = await supabase.from('lead_requests').update({ status }).eq('id', lead.id);
      if (error) throw error;
      setLead((prev) => (prev ? { ...prev, status } : null));
    } catch (err) {
      console.error(err);
      toast('Erreur : ' + err.message, 'error');
    } finally {
      setUpdatingStatus(false);
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
    return senderNames[msg.sender_id] || clientProfile?.full_name || 'Client';
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
            {accessDenied ? 'Vous n\'avez pas accès à ce dossier.' : 'Demande introuvable.'}
          </p>
          <Link to="/admin/leads" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline">
            <ArrowLeft size={18} /> Retour aux demandes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Link
          to="/admin/leads"
          className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition mb-6"
        >
          <ArrowLeft size={20} /> Retour aux demandes
        </Link>

        <h1 className="text-2xl font-black text-slate-900 mb-2">{lead.title || 'Sans titre'}</h1>
        <p className="text-sm text-slate-500 mb-6">
          Dossier créé le {lead.created_at ? new Date(lead.created_at).toLocaleDateString('fr-FR') : '—'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLONNE GAUCHE - 1/3 */}
          <div className="space-y-6">
            {/* Carte Client */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={18} /> Client
              </h2>
              {clientProfile ? (
                <>
                  <p className="font-bold text-slate-800">{clientProfile.full_name || '—'}</p>
                  {clientProfile.societe && (
                    <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                      <Building2 size={14} /> {clientProfile.societe}
                    </p>
                  )}
                  {clientProfile.email && (
                    <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                      <Mail size={14} /> {clientProfile.email}
                    </p>
                  )}
                  {clientProfile.phone && (
                    <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                      <Phone size={14} /> {clientProfile.phone}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowClientModal(true)}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                  >
                    Voir profil complet
                  </button>
                </>
              ) : (
                <p className="text-slate-500 text-sm">Profil client non trouvé.</p>
              )}
            </div>

            {/* Actions Admin - Statut */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Statut du dossier</h2>
              <select
                value={lead.status || 'nouveau'}
                onChange={handleStatusChange}
                disabled={updatingStatus}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50"
              >
                <option value="nouveau">Nouveau</option>
                <option value="en_cours">En cours</option>
                <option value="cloture">Clôturé</option>
              </select>
              {updatingStatus && <p className="text-xs text-slate-500 mt-2">Mise à jour…</p>}
            </div>
          </div>

          {/* COLONNE DROITE - 2/3 - Chat */}
          <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} className="text-slate-500" />
                <span className="font-bold text-slate-800">Conversation</span>
              </div>
              {lead?.assigned_to === currentUser?.id && (
                <button
                  onClick={toggleNotify}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    notifyEnabled
                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                  title={notifyEnabled ? 'Notifications activées' : 'Notifications désactivées'}
                >
                  {notifyEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                  {notifyEnabled ? 'Notifs ON' : 'Notifs OFF'}
                </button>
              )}
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
              <div ref={messagesEndRef} />
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

      {/* Modal Profil Client */}
      {showClientModal && clientProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Profil client</h2>
              <button
                type="button"
                onClick={() => setShowClientModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                aria-label="Fermer"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nom complet</label>
                <p className="text-slate-800 font-semibold">{clientProfile.full_name || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Building2 size={12} /> Société
                </label>
                <p className="text-slate-800">{clientProfile.societe || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail size={12} /> Email
                </label>
                <p className="text-slate-800">{clientProfile.email || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Phone size={12} /> Téléphone
                </label>
                <p className="text-slate-800">{clientProfile.phone || '—'}</p>
              </div>
              {clientProfile.siret && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Hash size={12} /> SIRET
                  </label>
                  <p className="text-slate-800 font-mono">{clientProfile.siret}</p>
                </div>
              )}
              {clientProfile.address && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin size={12} /> Adresse
                  </label>
                  <p className="text-slate-800">{clientProfile.address}</p>
                </div>
              )}
              {(clientProfile.ville || clientProfile.code_postal) && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ville / Code postal</label>
                  <p className="text-slate-800">
                    {[clientProfile.ville, clientProfile.code_postal].filter(Boolean).join(' ') || '—'}
                  </p>
                </div>
              )}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="w-full px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeadDetailsPage;
