import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import { Palette, Type, X, Save } from 'lucide-react';

const ThemeCustomizer = () => {
  const { colors, setColors, texts, setTexts } = useTheme();
  const [userRole, setUserRole] = useState('client');
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('colors'); // 'colors' ou 'texts'

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
      <button onClick={() => setIsOpen(!isOpen)} className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl font-black mb-2 flex items-center gap-2">
        {isOpen ? <X /> : <Palette />} {isOpen ? 'Fermer' : 'Éditeur visuel'}
      </button>

      {isOpen && (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-200 w-96 max-h-[70vh] overflow-y-auto">
          <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setActiveTab('colors')} className={`flex-1 py-2 rounded-lg text-xs font-black ${activeTab === 'colors' ? 'bg-white shadow-sm' : ''}`}>COULEURS</button>
            <button onClick={() => setActiveTab('texts')} className={`flex-1 py-2 rounded-lg text-xs font-black ${activeTab === 'texts' ? 'bg-white shadow-sm' : ''}`}>TEXTES</button>
          </div>

          {activeTab === 'colors' ? (
            <div className="space-y-4">
              {Object.keys(colors).map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase">{key}</label>
                  <input type="color" value={colors[key]} onChange={(e) => setColors({...colors, [key]: e.target.value})} className="w-8 h-8 rounded-lg cursor-pointer" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 text-left">
              {Object.keys(texts).map((key) => (
                <div key={key}>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">{key}</label>
                  <textarea className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-sm font-bold" value={texts[key]} onChange={(e) => setTexts({...texts, [key]: e.target.value})} rows="2" />
                </div>
              ))}
            </div>
          )}
          
          <button className="w-full mt-6 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2">
            <Save size={16} /> Enregistrer sur le serveur
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeCustomizer;