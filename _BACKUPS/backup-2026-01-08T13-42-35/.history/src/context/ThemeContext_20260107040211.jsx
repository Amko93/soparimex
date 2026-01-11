import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [colors, setColors] = useState({
    siteBg: '#F8FAFC',
    headerBg: '#ffffff',
    footerBg: '#0f172a',
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
    // Textes pour tes carrés/blocs
    card1Emoji: '🛠️',
    card1Title: 'Maintenance',
    card1Desc: 'Solutions complètes pour vos équipements.',
    card2Emoji: '💧',
    card2Title: 'Plomberie',
    card2Desc: 'Matériel de haute qualité pour pro.',
    card3Emoji: '🏗️',
    card3Title: 'Construction',
    card3Desc: 'Accompagnement sur tous vos chantiers.'
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--site-bg', colors.siteBg);
    root.style.setProperty('--header-bg', colors.headerBg);
    root.style.setProperty('--footer-bg', colors.footerBg);
    root.style.setProperty('--primary-button', colors.primaryButton);
    root.style.setProperty('--main-text', colors.mainText);
    root.style.setProperty('--header-text', colors.headerText);
    root.style.setProperty('--footer-text', colors.footerText);
  }, [colors]);

  return (
    <ThemeContext.Provider value={{ colors, setColors, texts, setTexts }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);