import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import { Palette, X, Save, ShieldCheck } from 'lucide-react';

const ThemeCustomizer = () => {
  const { colors, setColors, texts, setTexts } = useTheme();
  const [userRole, setUserRole] = useState('client');
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');

  const labels = {
    siteBg: 'Fond global', headerBg: 'Fond Header', footerBg: 'Fond Footer',
    expertiseBg: 'Fond Expertise (Bleu)', primaryButton: 'Boutons',
    mainText: 'Texte', headerText: 'Texte Header', footerText: 'Texte Footer'
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
    <div className="fixed bottom-5 right-5 z-[99999] flex flex-col items-end font-sans">
      <button onClick={() => setIsOpen(!isOpen)} className="bg-slate-900 text-white p-5 rounded-full shadow-2xl border-2 border-amber-500">
        {isOpen ? <X /> : <Palette />}
      </button>

      {isOpen && (
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border w-96 max-h-[80vh] flex flex-col mt-4">
          <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl">
            <button onClick={() => setActiveTab('colors')} className={`flex-1 py-2 rounded-xl text-[10px] font-black ${activeTab === 'colors' ? 'bg-white shadow-sm' : ''}`}>COULEURS</button>
            <button onClick={() => setActiveTab('texts')} className={`flex-1 py-2 rounded-xl text-[10px] font-black ${activeTab === 'texts' ? 'bg-white shadow-sm' : ''}`}>TEXTES</button>
          </div>

          <div className="flex-grow overflow-y-auto space-y-4 pr-2">
            {activeTab === 'colors' ? (
              Object.keys(colors).map(k => (
                <div key={k} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <label className="text-[10px] font-black text-slate-500 uppercase">{labels[k] || k}</label>
                  <input type="color" value={colors[k]} onChange={(e) => setColors({...colors, [k]: e.target.value})} className="w-8 h-8 rounded-lg cursor-pointer" />
                </div>
              ))
            ) : (
              Object.keys(texts).map(k => (
                <div key={k} className="text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">{k}</label>
                  <textarea className="w-full bg-slate-50 border p-3 rounded-2xl text-sm font-bold" value={texts[k]} onChange={(e) => setTexts({...texts, [k]: e.target.value})} rows="2" />
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-6 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs">ENREGISTRER</button>
        </div>
      )}
    </div>
  );
};

export default ThemeCustomizer;