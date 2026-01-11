import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import { Palette, Type, X, Save, ShieldCheck } from 'lucide-react';

const ThemeCustomizer = () => {
  const { colors, setColors, texts, setTexts } = useTheme();
  const [userRole, setUserRole] = useState('client');
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');

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
    <div className="fixed bottom-5 right-5 z-[99999] flex flex-col items-end">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-slate-900 text-white p-5 rounded-full shadow-2xl flex items-center gap-3 border-2 border-amber-500 hover:scale-110 transition-all"
      >
        {isOpen ? <X /> : <Palette />} <span className="font-black text-xs uppercase tracking-tighter">Éditeur Visuel</span>
      </button>

      {isOpen && (
        <div className="bg-white p-8 rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200 w-[400px] max-h-[85vh] flex flex-col animate-in slide-in-from-right-10">
          <div className="flex items-center gap-2 mb-6 text-blue-600 bg-blue-50 w-fit px-4 py-1 rounded-full">
            <ShieldCheck size={14} /> <span className="text-[10px] font-black uppercase">Accès {userRole}</span>
          </div>

          <div className="flex gap-2 mb-8 bg-slate-100 p-2 rounded-2xl">
            <button onClick={() => setActiveTab('colors')} className={`flex-1 py-3 rounded-xl font-black text-[10px] ${activeTab === 'colors' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>COULEURS</button>
            <button onClick={() => setActiveTab('texts')} className={`flex-1 py-3 rounded-xl font-black text-[10px] ${activeTab === 'texts' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>TEXTES</button>
          </div>

          <div className="flex-grow overflow-y-auto pr-4 space-y-6">
            {activeTab === 'colors' ? (
              Object.keys(colors).map((key) => (
                <div key={key} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                  <label className="text-[10px] font-black text-slate-500 uppercase">{key}</label>
                  <input type="color" value={colors[key]} onChange={(e) => setColors({...colors, [key]: e.target.value})} className="w-10 h-10 rounded-xl cursor-pointer" />
                </div>
              ))
            ) : (
              Object.keys(texts).map((key) => (
                <div key={key}>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-2">{key}</label>
                  <textarea className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold" value={texts[key]} onChange={(e) => setTexts({...texts, [key]: e.target.value})} rows="2" />
                </div>
              ))
            )}
          </div>
          
          <button className="w-full mt-8 bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xs flex items-center justify-center gap-3 shadow-xl hover:bg-blue-700 transition-all">
            <Save size={20} /> ENREGISTRER SUR SUPABASE
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeCustomizer;