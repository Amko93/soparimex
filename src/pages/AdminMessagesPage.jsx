import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Building, Calendar, X, Trash2, Eye, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    // On récupère tout
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur:', error);
    } else {
      // TRI INTELLIGENT : On met les "nouveau" (En attente) en premier, puis les validés
      const sortedData = (data || []).sort((a, b) => {
        if (a.statut === 'nouveau' && b.statut !== 'nouveau') return -1;
        if (a.statut !== 'nouveau' && b.statut === 'nouveau') return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setMessages(sortedData);
    }
    setLoading(false);
  };

  // Passer en VALIDÉ
  const handleValidate = async (id, e) => {
    e.stopPropagation(); // Pour ne pas ouvrir la pop-up
    await supabase.from('messages').update({ statut: 'valide' }).eq('id', id);
    fetchMessages(); // On rafraîchit la liste
  };

  // SUPPRIMER
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Voulez-vous vraiment supprimer ce message ?')) {
      await supabase.from('messages').delete().eq('id', id);
      fetchMessages();
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-blue-600 transition">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Messagerie</h1>
              <p className="text-slate-500">Gérez vos demandes (En attente / Traitées)</p>
            </div>
          </div>
          
          {/* Compteurs */}
          <div className="flex gap-2">
            <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 font-bold text-orange-600 flex items-center gap-2">
              <Clock size={16} />
              {messages.filter(m => m.statut === 'nouveau').length} En attente
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm font-bold text-slate-600">
              Total: {messages.length}
            </div>
          </div>
        </div>

        {/* LISTE DES MESSAGES */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="p-20 text-center text-slate-400">Chargement...</div>
          ) : messages.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <Mail size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-700">Aucun message</h3>
              <p className="text-slate-400">Votre boîte de réception est vide.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-2">Statut</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-3">Nom</div>
                <div className="col-span-2">Entreprise</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {messages.map((msg) => {
                const isNew = msg.statut === 'nouveau';
                return (
                  <div 
                    key={msg.id} 
                    onClick={() => setSelectedMessage(msg)}
                    className={`grid grid-cols-12 gap-4 p-4 items-center cursor-pointer transition-colors group ${isNew ? 'bg-white hover:bg-orange-50/30' : 'bg-slate-50/50 hover:bg-slate-100'}`}
                  >
                    {/* Statut Badge */}
                    <div className="col-span-2">
                      {isNew ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-wide">
                          <Clock size={12} /> En attente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-600 text-[10px] font-black uppercase tracking-wide opacity-70">
                          <CheckCircle size={12} /> Traité
                        </span>
                      )}
                    </div>

                    <div className={`col-span-3 text-sm font-medium ${isNew ? 'text-slate-600' : 'text-slate-400'}`}>
                      {formatDate(msg.created_at)}
                    </div>
                    
                    <div className={`col-span-3 font-bold flex items-center gap-3 ${isNew ? 'text-slate-900' : 'text-slate-500'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${isNew ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                        {msg.prenom?.charAt(0)}{msg.nom?.charAt(0)}
                      </div>
                      <span className="truncate">{msg.prenom} {msg.nom}</span>
                    </div>

                    <div className="col-span-2 text-slate-600 text-sm truncate">
                      {msg.entreprise ? (
                        <span className={`flex items-center gap-2 ${!isNew && 'opacity-50'}`}><Building size={14} className="text-slate-400"/> {msg.entreprise}</span>
                      ) : (
                        <span className="text-slate-400 italic">Particulier</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-2">
                      {/* Bouton Valider (Seulement si nouveau) */}
                      {isNew && (
                        <button 
                          onClick={(e) => handleValidate(msg.id, e)}
                          title="Marquer comme traité"
                          className="p-2 bg-green-50 border border-green-100 rounded-lg text-green-600 hover:bg-green-500 hover:text-white transition shadow-sm"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}

                      {/* Bouton Voir */}
                      <button className="p-2 bg-white border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm">
                        <Eye size={16} />
                      </button>

                      {/* Bouton Supprimer */}
                      <button 
                        onClick={(e) => handleDelete(msg.id, e)}
                        title="Supprimer"
                        className="p-2 bg-white border border-slate-200 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm opacity-50 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* POP-UP MESSAGE (MODAL) */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 p-8">
            <button 
              onClick={() => setSelectedMessage(null)} 
              className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500"
            >
              <X size={20} />
            </button>

            {/* Header Modal */}
            <div className="flex items-center gap-4 mb-8">
               <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-200">
                  {selectedMessage.prenom?.charAt(0)}
               </div>
               <div>
                 <h2 className="text-2xl font-black text-slate-900">
                   {selectedMessage.prenom} {selectedMessage.nom}
                 </h2>
                 <p className="text-slate-500 font-medium flex items-center gap-2">
                   <Building size={16}/> {selectedMessage.entreprise || "Particulier"}
                 </p>
               </div>
            </div>

            {/* Corps du message */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Reçu le {formatDate(selectedMessage.created_at)}
                </h3>
                {selectedMessage.statut === 'nouveau' ? (
                   <span className="text-xs font-bold text-orange-500 bg-orange-100 px-2 py-1 rounded-md">En attente</span>
                ) : (
                   <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md">Traité</span>
                )}
              </div>
              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap text-lg">
                {selectedMessage.message}
              </p>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col md:flex-row gap-4">
              <a href={`mailto:${selectedMessage.email}`} className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                <Mail size={18} /> Répondre par Email
              </a>
              <a href={`tel:${selectedMessage.telephone}`} className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition">
                Appeler ({selectedMessage.telephone})
              </a>
              
              {selectedMessage.statut === 'nouveau' && (
                <button 
                  onClick={(e) => { handleValidate(selectedMessage.id, e); setSelectedMessage(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition shadow-lg shadow-green-200"
                >
                  <CheckCircle size={18} /> Marquer comme traité
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessagesPage;