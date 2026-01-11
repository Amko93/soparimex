import React, { useState, useEffect } from 'react';

const ThemeCustomizer = () => {
  const [colors, setColors] = useState({
    '--site-bg': '#F8FAFC',
    '--header-bg': '#ffffff',
    '--footer-bg': '#0f172a',
    '--primary-button': '#2563eb',
    '--main-text': '#1e293b',
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (variable, value) => {
    setColors({ ...colors, [variable]: value });
    document.documentElement.style.setProperty(variable, value);
  };

  return (
    <div className={`fixed bottom-5 right-5 z-[9999] ${isOpen ? 'w-64' : 'w-auto'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl font-black mb-2 float-right"
      >
        {isOpen ? '✖' : '🎨 Couleurs'}
      </button>

      {isOpen && (
        <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-200 clear-both animate-in slide-in-from-bottom-5">
          <h3 className="text-xs font-black uppercase tracking-widest mb-4">Personnaliser le site</h3>
          
          <div className="space-y-4">
            {Object.keys(colors).map((variable) => (
              <div key={variable} className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  {variable.replace('--', '').replace('-', ' ')}
                </label>
                <input 
                  type="color" 
                  value={colors[variable]} 
                  onChange={(e) => handleChange(variable, e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                />
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-bold text-xs">
            Enregistrer sur Supabase
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeCustomizer;