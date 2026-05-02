import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [colors, setColors] = useState({
    siteBg: '#F8FAFC',
    headerBg: '#ffffff',
    footerBg: '#0f172a',
    expertiseBg: '#f1f5f9',
    primaryButton: '#2563eb',
    buttonText: '#ffffff',
    mainText: '#1e293b',
    headerText: '#1e293b',
    footerText: '#ffffff'
  });

  const [texts, setTexts] = useState({
    siteName: 'Soparimex',
    heroTitle: 'Votre Partenaire en Fourniture Industrielle',
    heroSubtitle: 'SOPARIMEX vous accompagne dans tous vos projets industriels. Sourcing, négociation et livraison directe de fournitures professionnelles.',
    btnHero: 'Voir nos produits',
    btnCatalog: 'Voir les catalogues',
    card1Emoji: '🛠️', card1Title: 'Maintenance', card1Desc: 'Pièces détachées, outillage et équipements pour la maintenance industrielle et préventive de vos installations.',
    card2Emoji: '💧', card2Title: 'Plomberie', card2Desc: 'Tuyauterie, robinetterie et accessoires pour vos installations de plomberie professionnelle.',
    card3Emoji: '🏗️', card3Title: 'Construction', card3Desc: 'Matériaux, fixations et fournitures pour vos chantiers de construction et de rénovation.',
    expertiseTitle: "L'expertise Soparimex",
    expertiseText: "Depuis 2021, SOPARIMEX est spécialisée dans le commerce de gros de fournitures industrielles. Notre modèle d'achat-revente directe nous permet de vous proposer les meilleurs tarifs sans intermédiaire. Envoyez-nous votre demande, nous sourçons et négocions pour vous auprès de nos fournisseurs partenaires, avec livraison directe sur votre site."
  });

  const fetchSettings = async () => {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'main').single();
    if (data && !error) {
      if (data.colors) setColors(prev => ({ ...prev, ...data.colors }));
      if (data.texts) setTexts(prev => ({ ...prev, ...data.texts }));
    }
  };

  useEffect(() => {
    void fetchSettings(); // Chargement initial depuis Supabase (async)
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

// eslint-disable-next-line react-refresh/only-export-components -- hook exporté pour usage dans les composants
export const useTheme = () => useContext(ThemeContext);