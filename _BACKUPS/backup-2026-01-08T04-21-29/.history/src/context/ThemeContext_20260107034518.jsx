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
    footerSlogan: 'Votre partenaire de confiance.',
    welcomeTitle: 'Bienvenue',
  });

  // Cette partie est cruciale, si elle bug, tout le site bloque
  useEffect(() => {
    try {
      const root = document.documentElement;
      root.style.setProperty('--site-bg', colors.siteBg);
      root.style.setProperty('--header-bg', colors.headerBg);
      root.style.setProperty('--footer-bg', colors.footerBg);
      root.style.setProperty('--primary-button', colors.primaryButton);
      root.style.setProperty('--main-text', colors.mainText);
    } catch (err) {
      console.error("Erreur ThemeContext:", err);
    }
  }, [colors]);

  return (
    <ThemeContext.Provider value={{ colors, setColors, texts, setTexts }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Si on arrive ici, c'est que useTheme est utilisé HORS du ThemeProvider
    return { colors: {}, texts: {} }; 
  }
  return context;
};