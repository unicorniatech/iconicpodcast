import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, ArrowRight, Play, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ScrollReveal } from './common/ScrollReveal';
import { ZUZZI_HERO_IMAGE } from '../constants';

export const Hero: React.FC = () => {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative bg-iconic-black min-h-screen flex items-center pt-24 sm:pt-32 pb-12 overflow-hidden z-10">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-iconic-black via-purple-950/50 to-iconic-black"></div>
      
      {/* Animated mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-iconic-pink/40 via-transparent to-transparent animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-iconic-blue/30 via-transparent to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      {/* Floating orbs with glow */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-iconic-pink/30 rounded-full blur-[150px] animate-blob"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-iconic-blue/20 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 h-full items-center">
            <div className={`flex flex-col justify-center text-center lg:text-left order-2 lg:order-1 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {/* Animated badge */}
                <div className={`inline-flex items-center gap-2 mb-6 justify-center lg:justify-start transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                    <span className="relative flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-iconic-pink text-xs font-bold uppercase tracking-widest">
                        <Sparkles size={14} className="animate-pulse" />
                        {t.hero_kicker}
                        <span className="absolute -right-1 -top-1 w-3 h-3 bg-iconic-pink rounded-full animate-ping"></span>
                        <span className="absolute -right-1 -top-1 w-3 h-3 bg-iconic-pink rounded-full"></span>
                    </span>
                </div>
                
                {/* Animated title with gradient */}
                <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-[1.1] transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                    <span className="text-white">{t.hero_title.split(' ').slice(0, -1).join(' ')} </span>
                    <span className="bg-gradient-to-r from-iconic-pink via-purple-400 to-iconic-blue bg-clip-text text-transparent animate-gradient-slow bg-[length:200%_auto]">
                        {t.hero_title.split(' ').slice(-1)}
                    </span>
                </h1>

                <p className={`text-base sm:text-lg md:text-xl text-gray-400 font-light leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                    {t.hero_subtitle}
                </p>

                {/* CTA buttons with hover effects */}
                <div className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                    <Link 
                       to="/episodes"
                       className="group relative px-8 py-4 bg-gradient-to-r from-iconic-pink to-purple-600 text-white font-bold rounded-full overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(183,6,109,0.6)] hover:scale-105 flex items-center justify-center text-lg"
                    >
                        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                        <span className="relative flex items-center">
                            {t.hero_cta} <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                        </span>
                    </Link>
                    <a 
                       href="https://open.spotify.com/show/5TNpvLzycWShFtP0uu39bE"
                       target="_blank"
                       rel="noreferrer"
                       className="group px-8 py-4 border border-white/20 text-white font-bold rounded-full hover:bg-white/10 hover:border-white/40 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                    >
                        <Mic size={20} className="group-hover:scale-110 transition-transform" /> 
                        {t.hero_spotify_btn}
                    </a>
                </div>
                
                {/* Stats row */}
                <div className={`flex flex-wrap gap-8 mt-12 justify-center lg:justify-start transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                    {[
                        { value: '50K+', label: 'Listeners' },
                        { value: '15+', label: 'Episodes' },
                        { value: '4.9', label: 'Rating' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center lg:text-left">
                            <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hero image with animated frame */}
            <div className={`order-1 lg:order-2 flex justify-center items-center h-full transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="relative w-full max-w-sm md:max-w-md">
                    {/* Animated rotating borders */}
                    <div className="absolute -inset-4 rounded-[40px] border border-white/10 animate-spin-slow"></div>
                    <div className="absolute -inset-8 rounded-[48px] border border-iconic-pink/20 animate-spin-slow" style={{animationDirection: 'reverse', animationDuration: '20s'}}></div>
                    
                    {/* Glow effect behind image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-iconic-pink/50 to-purple-600/50 rounded-[32px] blur-2xl scale-110 animate-pulse"></div>
                    
                    {/* Main image container */}
                    <div className="relative rounded-[32px] overflow-hidden shadow-2xl aspect-[3/4] z-10 bg-gray-800 group">
                        <img 
                            src={ZUZZI_HERO_IMAGE} 
                            alt="Zuzana Husarova" 
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-iconic-black via-transparent to-transparent opacity-60"></div>
                        
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Link 
                                to="/episodes" 
                                className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:scale-110 transition-transform"
                            >
                                <Play size={32} fill="white" className="text-white ml-1" />
                            </Link>
                        </div>
                        
                        {/* Bottom info card */}
                        <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-iconic-pink rounded-full flex items-center justify-center">
                                    <Mic size={18} className="text-white" />
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm">ICONIC Podcast</div>
                                    <div className="text-white/60 text-xs">New episode every week</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <span className="text-white/40 text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/40 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
