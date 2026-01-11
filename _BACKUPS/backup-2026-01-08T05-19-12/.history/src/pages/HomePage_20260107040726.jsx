import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { texts } = useTheme();
  
  const services = [
    { emoji: texts.card1Emoji, title: texts.card1Title, desc: texts.card1Desc },
    { emoji: texts.card2Emoji, title: texts.card2Title, desc: texts.card2Desc },
    { emoji: texts.card3Emoji, title: texts.card3Title, desc: texts.card3Desc },
  ];

  return (
    <div style={{ backgroundColor: 'var(--site-bg)' }} className="min-h-screen transition-colors duration-300">
      <section style={{ backgroundColor: 'var(--footer-bg)' }} className="py-24 px-8 text-center text-white">
        <h1 className="text-6xl font-black mb-8">{texts.heroTitle}</h1>
        <p className="text-xl opacity-80 mb-12">{texts.heroSubtitle}</p>
        
        {/* DEUX BOUTONS ICI */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/categories" style={{ backgroundColor: 'var(--primary-button)' }} className="px-10 py-5 rounded-2xl font-black shadow-2xl flex items-center gap-2 hover:scale-105 transition-all">
            {texts.btnHero} <ArrowRight size={20} />
          </Link>
          <Link to="/catalogues" className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-black flex items-center gap-2 hover:bg-white/20 transition-all">
            <BookOpen size={20} /> {texts.btnCatalog || 'Voir les catalogues'}
          </Link>
        </div>
      </section>

      {/* Reste de la page... (Blocs services et Expertise) */}
      <section className="py-20 px-8 -mt-16 relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((s, i) => (
          <div key={i} className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
            <div className="text-5xl mb-6">{s.emoji}</div>
            <h3 style={{ color: 'var(--main-text)' }} className="text-2xl font-black mb-4 italic">{s.title}</h3>
            <p className="text-slate-500 font-bold">{s.desc}</p>
          </div>
        ))}
      </section>

      <div style={{ backgroundColor: 'var(--expertise-bg)' }} className="py-24 transition-colors">
        <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            <h2 style={{ color: 'var(--main-text)' }} className="text-4xl font-black mb-6 italic tracking-tighter">{texts.expertiseTitle}</h2>
            <p style={{ color: 'var(--main-text)' }} className="opacity-70 leading-relaxed text-lg">{texts.expertiseText}</p>
          </div>
          <div className="bg-white p-4 rounded-[3.5rem] shadow-2xl rotate-2">
            <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80" className="rounded-[2.5rem] w-full shadow-inner" alt="Expertise" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;