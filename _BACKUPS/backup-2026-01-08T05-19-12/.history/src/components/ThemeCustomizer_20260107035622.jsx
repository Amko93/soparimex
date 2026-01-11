import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext'; // Vérifie que ce chemin est bon
import { supabase } from '../supabaseClient';
import { Palette, X, Save, Type, ShieldCheck } from 'lucide-react';

const ThemeCustomizer = () => {
  // On récupère les fonctions du contexte
  const theme = useTheme(); 
  
  // Sécurité pour éviter le crash si le contexte n'est pas chargé
  if (!theme) return null; 

  const { colors, setColors, texts, setTexts } = theme;
  const [userRole, setUserRole] = useState('client');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const getRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (data) setUserRole(data.role);
      }
    };
    getRole();
  }, []);

  // CONDITION DE VISIBILITÉ
  if (userRole !== 'admin' && userRole !== 'developpeur') return null;

  return (
    <div className="fixed bottom-10 right-10 z-[10000]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-900 text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-2 border-2 border-amber-500"
      >
        {isOpen ? <X size={24} /> : <Palette size={24} />}
        <span className="font-black text-xs uppercase tracking-widest">Éditeur</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 bg-white w-80 p-6 rounded-[2.5rem] shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 mb-4 text-amber-600">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase">Accès Développeur</span>
          </div>
          
          <h3 className="text-sm font-black mb-6 text-left text-slate-800">Personnaliser les couleurs</h3>
          
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {Object.keys(colors).map((key) => (
              <div key={key} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl">
                <label className="text-[10px] font-black text-slate-400 uppercase">{key}</label>
                <input 
                  type="color" 
                  value={colors[key]} 
                  onChange={(e) => setColors({...colors, [key]: e.target.value})} 
                  className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                />
              </div>
            ))}
          </div>

          <button className="w-full mt-6 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2">
            <Save size={16} /> Enregistrer sur Supabase
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeCustomizer;