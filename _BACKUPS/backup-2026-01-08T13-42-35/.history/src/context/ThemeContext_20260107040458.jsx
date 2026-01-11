import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [colors, setColors] = useState({
    siteBg: '#F8FAFC',
    headerBg: '#ffffff',
    footerBg: '#0f172a',
    expertiseBg: '#f1f5f9', // La nouvelle section
    primaryButton: '#2563eb',
    mainText: '#1e293b',
    headerText: '#1e293b',
    footerText: '#ffffff'
  });

  const [texts, setTexts] = useState({
    siteName: 'Soparimex',
    heroTitle: 'Votre partenaire expert en solutions industrielles',
    heroSubtitle: 'Soparimex accompagne les professionnels avec une large gamme de produits.',
    btnHero: 'Voir nos produits',
    card1Emoji: '🛠️', card1Title: 'Maintenance', card1Desc: 'Solutions complètes.',
    card2Emoji: '💧', card2Title: 'Plomberie', card2Desc: 'Matériel de qualité.',
    card3Emoji: '🏗️', card3Title: 'Construction', card3Desc: 'Sur tous vos chantiers.',
    expertiseTitle: "L'expertise Soparimex",
    expertiseText: "Depuis notre création, nous nous efforçons de fournir aux entreprises les meilleurs équipements du marché."
  });

  useEffect(() => {
    const root = document.documentElement;
    Object.keys(colors).forEach(key => {
      // Transforme siteBg en --site-bg
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, colors[key]);
    });
  }, [colors]);

  return (
    <ThemeContext.Provider value={{ colors, setColors, texts, setTexts }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);