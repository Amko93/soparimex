import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import { Palette, Type, X, Save, ShieldCheck } from 'lucide-react';

const ThemeCustomizer = () => {
  const { colors, setColors, texts, setTexts } = useTheme();
  const [userRole, setUserRole] = useState('client');
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');

  const labels = {
    siteBg: 'Fond du site',
    headerBg: 'Fond du Header',
    footerBg: 'Fond du Footer',
    primaryButton: 'Bouton principal',
    mainText: 'Texte général',
    headerText: 'Texte Header',
    footerText: 'Texte Footer'
  };

  useEffect(() => {
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (data) setUserRole(data.role);
      }
    };
    checkRole();
  }, []);

  if (userRole !== 'admin' && userRole !== 'developpeur') return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end font-sans">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl font-black mb-2 flex items-center gap-2 hover:scale-105 transition-all"
      >
        {isOpen ? <X size={20} /> : <Palette size={20} />}
        {isOpen ? 'Fermer' : 'Éditeur visuel'}
      </button>

      {isOpen && (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-200 w-96 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <ShieldCheck size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Mode {userRole}</span>
          </div>

          <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl">
            <button 
              onClick={() => setActiveTab('colors')} 
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === 'colors' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              COULEURS
            </button>
            <button 
              onClick={() => setActiveTab('texts')} 
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === 'texts' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              TEXTES
            </button>
          </div>

          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
            {activeTab === 'colors' ? (
              <div className="space-y-4">
                {Object.keys(colors).map((key) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                    <label className="text-[10px] font-black text-slate-500 uppercase">{labels[key] || key}</label>
                    <input 
                      type="color" 
                      value={colors[key]} 
                      onChange={(e) => setColors({...colors, [key]: e.target.value})} 
                      className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent" 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {Object.keys(texts).map((key) => (
                  <div key={key} className="text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 ml-2">{key}</label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                      value={texts[key]} 
                      onChange={(e) => setTexts({...texts, [key]: e.target.value})} 
                      rows="2" 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button className="w-full mt-6 bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-xs flex items-center justify-center gap-3 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
            <Save size={18} /> ENREGISTRER TOUT
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeCustomizer;