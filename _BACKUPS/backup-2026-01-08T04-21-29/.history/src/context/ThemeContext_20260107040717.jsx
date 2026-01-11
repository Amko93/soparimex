import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [colors, setColors] = useState({
    siteBg: '#F8FAFC', headerBg: '#ffffff', footerBg: '#0f172a', expertiseBg: '#f1f5f9',
    primaryButton: '#2563eb', mainText: '#1e293b', headerText: '#1e293b', footerText: '#ffffff'
  });

  const [texts, setTexts] = useState({
    siteName: 'Soparimex', heroTitle: 'Votre partenaire expert', heroSubtitle: 'Soparimex accompagne les pros.',
    btnHero: 'Voir nos produits', btnCatalog: 'Voir les catalogues',
    card1Emoji: '🛠️', card1Title: 'Maintenance', card1Desc: 'Solutions.',
    card2Emoji: '💧', card2Title: 'Plomberie', card2Desc: 'Matériel.',
    card3Emoji: '🏗️', card3Title: 'Construction', card3Desc: 'Chantiers.',
    expertiseTitle: "L'expertise Soparimex", expertiseText: "Qualité garantie."
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').eq('id', 'current').single();
    if (data) {
      if (data.colors) setColors(data.colors);
      if (data.texts) setTexts(data.texts);
    }
  };

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