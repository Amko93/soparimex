import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Palette, X, Save, Type } from 'lucide-react';

const ThemeCustomizer = () => {
  const [userRole, setUserRole] = useState('client');
  const [isOpen, setIsOpen] = useState(false);
  const [colors, setColors] = useState({
    '--site-bg': '#F8FAFC',
    '--header-bg': '#ffffff',
    '--footer-bg': '#0f172a',
    '--primary-button': '#2563eb',
    '--main-text': '#1e293b',
  });

  // Libellés traduits
  const labels = {
    '--site-bg': 'Fond du Site',
    '--header-bg': 'Fond du Header',
    '--footer-bg': 'Fond du Footer',
    '--primary-button': 'Bouton Principal',
    '--main-text': 'Couleur du Texte',
  };

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (data) setUserRole(data.role);
    }
  };

  const handleChange = (variable, value) => {
    setColors({ ...colors, [variable]: value });
    document.documentElement.style.setProperty(variable, value);
  };

  // On ne montre rien si l'utilisateur n'est pas Admin ou Developpeur
  if (userRole !== 'admin' && userRole !== 'developpeur') return null;

  return (
    <div className={`fixed bottom-5 right-5 z-[9999] flex flex-col items-end`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl font-black mb-2 flex items-center gap-2 hover:scale-105 transition-transform"
      >
        {isOpen ? <X size={20} /> : <Palette size={20} />}
        {isOpen ? 'Fermer' : 'Personnaliser'}
      </button>

      {isOpen && (
        <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-200 w-80 animate-in slide-in-from-bottom-5">
          <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b pb-2">Configuration Visuelle</h3>
          
          <div className="space-y-4">
            {Object.keys(colors).map((variable) => (
              <div key={variable} className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                  {labels[variable]}
                </label>
                <input 
                  type="color" 
                  value={colors[variable]} 
                  onChange={(e) => handleChange(variable, e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-2 border-slate-100 bg-transparent overflow-hidden"
                />
              </div>
            ))}
          </div>
          
          <button className="w-full mt-8 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700">
            <Save size={16} /> Enregistrer les réglages
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeCustomizer;