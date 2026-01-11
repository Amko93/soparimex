import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { ArrowRight } from 'lucide-react';

const HomePage = () => {
  const { colors, texts } = useTheme();

  return (
    <div style={{ backgroundColor: 'var(--site-bg)' }} className="min-h-screen transition-colors duration-300">
      {/* Hero Section */}
      <section style={{ backgroundColor: 'var(--footer-bg)' }} className="py-24 px-8 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 style={{ color: 'white' }} className="text-6xl font-black mb-8 leading-tight">
            {texts.heroTitle}
          </h1>
          <p className="text-xl opacity-80 mb-12 max-w-2xl mx-auto">
            {texts.heroSubtitle}
          </p>
          <div className="flex justify-center gap-6">
            <button 
              style={{ backgroundColor: 'var(--primary-button)' }}
              className="px-10 py-5 rounded-2xl font-black shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform"
            >
              {texts.btnHero} <ArrowRight size={20} />
            </button>
            <button className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-black hover:bg-white/20 transition-all">
              Nous contacter
            </button>
          </div>
        </div>
      </section>

      {/* Section Expertise */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            <h2 style={{ color: 'var(--main-text)' }} className="text-4xl font-black mb-6 italic">L'expertise Soparimex</h2>
            <p style={{ color: 'var(--main-text)' }} className="opacity-70 leading-relaxed text-lg mb-8">
              Depuis notre création, nous nous efforçons de fournir aux entreprises les meilleurs équipements du marché.
            </p>
          </div>
          <div className="bg-slate-200 aspect-video rounded-[3rem] shadow-inner overflow-hidden">
             <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80" alt="Industry" className="w-full h-full object-cover opacity-80" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;