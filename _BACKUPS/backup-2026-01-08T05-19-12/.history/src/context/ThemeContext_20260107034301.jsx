import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // État pour les couleurs
  const [colors, setColors] = useState({
    siteBg: '#F8FAFC',
    headerBg: '#ffffff',
    footerBg: '#0f172a',
    primaryButton: '#2563eb',
    mainText: '#1e293b',
    headerText: '#1e293b',
    footerText: '#ffffff'
  });

  // État pour les textes
  const [texts, setTexts] = useState({
    siteName: 'Soparimex',
    footerSlogan: 'Votre partenaire de confiance pour la fourniture industrielle.',
    welcomeTitle: 'Bienvenue chez Soparimex',
    loginTitle: 'Bon retour !',
    registerTitle: 'Créer un compte'
  });

  // Appliquer les couleurs au document
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--site-bg', colors.siteBg);
    root.style.setProperty('--header-bg', colors.headerBg);
    root.style.setProperty('--footer-bg', colors.footerBg);
    root.style.setProperty('--primary-button', colors.primaryButton);
    root.style.setProperty('--main-text', colors.mainText);
  }, [colors]);

  return (
    <ThemeContext.Provider value={{ colors, setColors, texts, setTexts }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);