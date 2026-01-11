import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { ArrowRight } from 'lucide-react';

const HomePage = () => {
  const { colors, texts } = useTheme();

  const services = [
    { emoji: texts.card1Emoji, title: texts.card1Title, desc: texts.card1Desc },
    { emoji: texts.card2Emoji, title: texts.card2Title, desc: texts.card2Desc },
    { emoji: texts.card3Emoji, title: texts.card3Title, desc: texts.card3Desc },
  ];

  return (
    <div style={{ backgroundColor: 'var(--site-bg)' }} className="min-h-screen transition-colors duration-300">
      
      {/* Hero Section */}
      <section style={{ backgroundColor: 'var(--footer-bg)' }} className="py-24 px-8 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-black mb-8 leading-tight">{texts.heroTitle}</h1>
          <p className="text-xl opacity-80 mb-12 max-w-2xl mx-auto">{texts.heroSubtitle}</p>
          <div className="flex justify-center">
            <button style={{ backgroundColor: 'var(--primary-button)' }} className="px-10 py-5 rounded-2xl font-black shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform">
              {texts.btnHero} <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Tes Carrés (Services) */}
      <section className="py-20 px-8 -mt-16 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 hover:translate-y-[-10px] transition-all duration-300 group">
              <div className="text-5xl mb-6">{service.emoji}</div>
              <h3 style={{ color: 'var(--main-text)' }} className="text-2xl font-black mb-4 italic italic">{service.title}</h3>
              <p className="text-slate-500 font-bold leading-relaxed">{service.desc}</p>
              <div style={{ backgroundColor: 'var(--primary-button)' }} className="w-12 h-2 mt-6 rounded-full opacity-20 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Section Expertise */}
      <section className="py-24 px-8 max-w-7xl mx-auto text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 style={{ color: 'var(--main-text)' }} className="text-4xl font-black mb-6 italic tracking-tighter">L'expertise Soparimex</h2>
            <p style={{ color: 'var(--main-text)' }} className="opacity-70 leading-relaxed text-lg">
              Depuis notre création, nous fournissons aux entreprises les meilleurs équipements.
            </p>
          </div>
          <div className="bg-slate-200 aspect-video rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl">
             <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80" alt="Industry" className="w-full h-full object-cover opacity-80" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;