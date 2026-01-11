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
    <div style={{ backgroundColor: 'var(--site-bg)' }} className="min-h-screen transition-colors duration-300 overflow-x-hidden">
      
      {/* Hero Section */}
      <section style={{ backgroundColor: 'var(--footer-bg)' }} className="py-12 md:py-24 px-4 md:px-8 text-center text-white relative">
        <div className="max-w-4xl mx-auto">
          {/* Texte responsive : 4xl sur mobile, 6xl sur PC */}
          <h1 className="text-4xl md:text-6xl font-black mb-6 md:mb-8 leading-tight">
            {texts.heroTitle}
          </h1>
          <p className="text-base md:text-xl opacity-80 mb-8 md:mb-12 max-w-2xl mx-auto px-2">
            {texts.heroSubtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
            <Link 
              to="/categories" 
              style={{ backgroundColor: 'var(--primary-button)' }} 
              className="px-8 py-4 md:px-10 md:py-5 rounded-2xl font-black shadow-2xl flex items-center justify-center gap-2 hover:scale-105 transition-all text-white text-sm md:text-base"
            >
              {texts.btnHero} <ArrowRight size={20} />
            </Link>
            <Link 
              to="/catalogues" 
              className="px-8 py-4 md:px-10 md:py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-white/20 transition-all text-white text-sm md:text-base"
            >
              <BookOpen size={20} /> {texts.btnCatalog}
            </Link>
          </div>
        </div>
      </section>

      {/* Les 3 Carrés */}
      <section className="py-12 md:py-20 px-4 md:px-8 -mt-10 md:-mt-16 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left">
          {services.map((s, i) => (
            <div key={i} className="bg-white p-8 md:p-10 rounded-3xl md:rounded-[3rem] shadow-xl border border-slate-100 group transition-all hover:-translate-y-1">
              <div className="text-4xl md:text-5xl mb-4 md:mb-6">{s.emoji}</div>
              <h3 style={{ color: 'var(--main-text)' }} className="text-xl md:text-2xl font-black mb-3 md:mb-4 italic">{s.title}</h3>
              <p className="text-slate-500 font-bold leading-relaxed text-sm md:text-base">{s.desc}</p>
              <div style={{ backgroundColor: 'var(--primary-button)' }} className="w-12 h-2 mt-6 rounded-full opacity-20"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Zone Expertise */}
      <div style={{ backgroundColor: 'var(--expertise-bg)' }} className="py-12 md:py-24 transition-colors">
        <section className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          
          {/* Texte Expertise */}
          <div className="text-left order-2 md:order-1">
            <h2 style={{ color: 'var(--main-text)' }} className="text-3xl md:text-4xl font-black mb-4 md:mb-6 italic tracking-tighter">
              {texts.expertiseTitle}
            </h2>
            <p style={{ color: 'var(--main-text)' }} className="opacity-70 leading-relaxed text-base md:text-lg mb-6 md:mb-8">
              {texts.expertiseText}
            </p>
            <Link to="/contact" className="inline-block px-8 py-4 bg-white rounded-2xl font-black text-sm shadow-md border border-slate-100 hover:shadow-lg transition-all text-slate-800">
              En savoir plus
            </Link>
          </div>

          {/* Image Expertise */}
          <div className="bg-white p-3 md:p-4 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl rotate-1 md:rotate-2 order-1 md:order-2">
            <div className="aspect-video rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
               <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80" alt="Industry" className="w-full h-full object-cover" />
            </div>
          </div>

        </section>
      </div>
    </div>
  );
};

export default HomePage;