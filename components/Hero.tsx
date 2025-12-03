import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ScrollReveal } from './common/ScrollReveal';
import { ZUZZI_HERO_IMAGE } from '../constants';

export const Hero: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="relative bg-iconic-black min-h-screen flex items-center pt-32 pb-12 overflow-hidden z-10">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-iconic-pink/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 z-0 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-iconic-blue/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 z-0 animate-blob" style={{animationDelay: '2s'}}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 h-full items-center">
            <div className="flex flex-col justify-center text-center md:text-left order-2 md:order-1">
                <ScrollReveal>
                    <div className="inline-block mb-6">
                         <h2 className="text-iconic-pink font-bold uppercase tracking-[0.3em] text-xs md:text-sm border-b border-iconic-pink pb-2 inline-block">
                            {t.hero_kicker}
                         </h2>
                    </div>
                </ScrollReveal>
                
                <ScrollReveal delay={100}>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-[1.1]">
                        {t.hero_title}
                    </h1>
                </ScrollReveal>

                <ScrollReveal delay={200}>
                    <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed mb-8 max-w-lg mx-auto md:mx-0">
                        {t.hero_subtitle}
                    </p>
                </ScrollReveal>

                <ScrollReveal delay={300}>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Link 
                           to="/episodes"
                           className="px-8 py-4 bg-iconic-pink text-white font-bold rounded-full hover:bg-white hover:text-iconic-black transition-all shadow-[0_0_20px_rgba(183,6,109,0.5)] flex items-center justify-center text-lg group"
                        >
                           {t.hero_cta} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a 
                           href="https://open.spotify.com/show/5TNpvLzycWShFtP0uu39bE"
                           target="_blank"
                           rel="noreferrer"
                           className="px-8 py-4 border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm"
                        >
                            <Mic size={20} /> {t.hero_spotify_btn}
                        </a>
                    </div>
                </ScrollReveal>
            </div>

            <div className="order-1 md:order-2 flex justify-center items-center h-full">
                <ScrollReveal delay={400} className="relative w-full max-w-sm md:max-w-md">
                    <div className="absolute -inset-4 border border-white/10 rounded-[40px] z-0 transform rotate-3"></div>
                    <div className="absolute -inset-4 border border-iconic-pink/30 rounded-[40px] z-0 transform -rotate-3"></div>
                    
                    <div className="relative rounded-[32px] overflow-hidden shadow-2xl aspect-[3/4] z-10 bg-gray-800">
                        <img 
                            src={ZUZZI_HERO_IMAGE} 
                            alt="Zuzana Husarova" 
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-iconic-black/20 to-transparent"></div>
                    </div>
                </ScrollReveal>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
