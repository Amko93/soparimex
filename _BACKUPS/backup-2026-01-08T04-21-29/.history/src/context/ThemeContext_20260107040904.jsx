import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [colors, setColors] = useState({
    siteBg: '#F8FAFC', headerBg: '#ffffff', footerBg: '#0f172a', expertiseBg: '#f1f5f9',
    primaryButton: '#2563eb', mainText: '#1e293b', headerText: '#1e293b', footerText: '#ffffff'
  });

  const [texts, setTexts] = useState({
    siteName: 'Soparimex', heroTitle: 'Expertise Industrielle', heroSubtitle: 'Chargement...',
    btnHero: 'Voir nos produits', btnCatalog: 'Voir les catalogues',
    card1Emoji: '🛠️', card1Title: 'Maintenance', card1Desc: '...',
    card2Emoji: '💧', card2Title: 'Plomberie', card2Desc: '...',
    card3Emoji: '🏗️', card3Title: 'Construction', card3Desc: '...',
    expertiseTitle: "L'expertise", expertiseText: "..."
  });

  const fetchSettings = async () => {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'current').single();
    if (data && !error) {
      if (data.colors) setColors(prev => ({ ...prev, ...data.colors }));
      if (data.texts) setTexts(prev => ({ ...prev, ...data.texts }));
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    Object.keys(colors).forEach(key => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, colors[key]);
    });
  }, [colors]);

  return (
    <ThemeContext.Provider value={{ colors, setColors, texts, setTexts, fetchSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);