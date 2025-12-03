import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useLocation } from 'react-router-dom';
import { 
  Play, 
  Mic, 
  Video, 
  Menu, 
  X, 
  MessageCircle, 
  Globe, 
  ChevronRight, 
  Instagram, 
  Linkedin, 
  Youtube,
  Send,
  User,
  CheckCircle,
  Bell,
  Sparkles,
  ExternalLink,
  Download,
  Trash2,
  Save,
  Tag,
  Mail,
  Phone,
  Plus,
  ArrowRight
} from 'lucide-react';

import { TRANSLATIONS, PODCAST_EPISODES, PRICING_PLANS, ZUZZI_HERO_IMAGE } from './constants';
import { Language, ChatMessage, Lead, PodcastEpisode } from './types';
import { sendMessageToGemini, startChatSession } from './services/geminiService';
import { storageService } from './services/storageService';

// --- Context ---
const LanguageContext = React.createContext<{
  lang: Language;
  setLang: (l: Language) => void;
  t: any;
}>({ lang: 'cs-CZ', setLang: () => {}, t: TRANSLATIONS['cs-CZ'] });

// --- Animation Components ---

const AnimatedBackground: React.FC = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
     {/* Subtle moving gradient mesh */}
     <div className="absolute inset-0 bg-gradient-to-br from-pink-50/60 via-white to-blue-50/60 bg-[length:300%_300%] animate-gradient-slow opacity-80"></div>
  </div>
);

const CursorSpotlight: React.FC = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Disable on touch devices
        if (window.matchMedia("(pointer: coarse)").matches) return;

        setIsVisible(true);
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        
        // Current position of the cursor element (for lerp)
        let cursorX = window.innerWidth / 2;
        let cursorY = window.innerHeight / 2;
        
        const speed = 0.1; // Laziness factor

        const move = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const animate = () => {
            const distX = mouseX - cursorX;
            const distY = mouseY - cursorY;
            
            cursorX = cursorX + (distX * speed);
            cursorY = cursorY + (distY * speed);

            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
            }
            requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', move);
        const animFrame = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', move);
            cancelAnimationFrame(animFrame);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div 
            ref={cursorRef}
            className="fixed top-0 left-0 pointer-events-none z-[40] mix-blend-screen"
            style={{ willChange: 'transform' }}
        >
            {/* Outer Glow */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-iconic-pink/20 blur-[80px]" />
            
            {/* Inner Glimmer */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full bg-blue-400/10 blur-[40px] animate-pulse" />
        </div>
    );
};

interface ScrollRevealProps { 
    children: React.ReactNode; 
    delay?: number; 
    className?: string;
    direction?: 'up' | 'left';
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({ children, delay = 0, className = "", direction = 'up' }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (ref.current) observer.observe(ref.current);
        return () => { if (ref.current) observer.unobserve(ref.current); };
    }, []);

    return (
        <div 
            ref={ref} 
            className={`reveal-on-scroll reveal-${direction} ${isVisible ? 'is-visible' : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

// --- Components ---

const LazyYouTubePlayer: React.FC<{ videoId: string; title: string }> = ({ videoId, title }) => {
    const [isIntersecting, setIntersecting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIntersecting(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="bg-black aspect-video rounded-xl shadow-2xl overflow-hidden mb-8 relative border-4 border-white group cursor-pointer"
            onClick={() => setIntersecting(true)}
        >
            {isIntersecting ? (
                <iframe 
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                    className="w-full h-full"
                    allowFullScreen
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
            ) : (
                <>
                    <img 
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                        alt={title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 text-white shadow-xl group-hover:scale-110 transition-transform duration-300 z-10 relative">
                            <Play size={48} fill="currentColor" />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

interface NewsletterToastProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewsletterToast: React.FC<NewsletterToastProps> = ({ isOpen, onClose }) => {
  const { t } = React.useContext(LanguageContext);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleDismiss = () => {
    onClose();
    localStorage.setItem('iconic_newsletter_status', 'dismissed');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;

    if (email) {
      storageService.saveLead({
        name: 'Newsletter Subscriber',
        email: email,
        interest: 'Newsletter Signup',
        source: 'newsletter',
        notes: 'Captured via Massive Toast',
        tags: ['Newsletter', 'Web']
      });
      setIsSubscribed(true);
      localStorage.setItem('iconic_newsletter_status', 'subscribed');
      
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[60] bg-iconic-black shadow-2xl animate-fade-in-down border-b border-iconic-pink/20 h-12 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <button 
          onClick={handleDismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-1"
        >
          <X size={18} />
        </button>
        
        {isSubscribed ? (
          <div className="flex items-center justify-center text-white font-bold text-sm sm:text-base gap-2 animate-pulse w-full">
            <CheckCircle size={20} className="text-iconic-pink" /> {t.newsletter_success}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full pr-8">
            <div className="text-white flex items-center gap-3 overflow-hidden">
              <span className="bg-iconic-pink text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded flex-shrink-0">New</span>
              <div className="truncate text-xs sm:text-sm">
                 <span className="font-bold hidden sm:inline">{t.newsletter_title}: </span>
                 <span className="text-white/90">{t.newsletter_desc}</span>
              </div>
            </div>
            
            <form onSubmit={handleSubscribe} className="flex gap-2 flex-shrink-0 ml-4">
              <input 
                type="email" 
                name="email"
                required
                placeholder={t.newsletter_placeholder}
                className="w-32 sm:w-48 px-3 py-1 text-xs sm:text-sm rounded border-none focus:ring-2 focus:ring-iconic-pink text-iconic-black placeholder-gray-400"
              />
              <button 
                type="submit" 
                className="px-3 py-1 bg-iconic-pink text-white text-xs sm:text-sm font-bold rounded hover:bg-pink-600 transition-colors whitespace-nowrap"
              >
                {t.newsletter_btn}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

interface GuestInvitationModalProps {
  onClose: () => void;
}

const GuestInvitationModal: React.FC<GuestInvitationModalProps> = ({ onClose }) => {
  const { t } = React.useContext(LanguageContext);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    storageService.saveLead({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: '',
        interest: formData.get('vision') as string,
        source: 'guest_popup',
        notes: 'Applied via Guest Invitation Popup',
        tags: ['Podcast Guest', 'Popup Lead']
    });

    setIsSubmitted(true);
    localStorage.setItem('iconic_guest_signed_up', 'true');
    
    setTimeout(() => {
        onClose();
    }, 3000);
  };

  const handleDismiss = () => {
    onClose();
    sessionStorage.setItem('iconic_guest_dismissed', 'true');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
       {/* Wild Animated Background Overlay - UPDATED to remove blue */}
       <div className="absolute inset-0 bg-gradient-to-r from-iconic-pink via-purple-900 to-iconic-black bg-[length:300%_300%] animate-wild-gradient opacity-95"></div>
       <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

       {/* Floating Orbs for extra depth - UPDATED colors */}
       <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-iconic-pink rounded-full blur-[100px] animate-pulse opacity-60"></div>
       <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-800 rounded-full blur-[100px] animate-pulse opacity-60 delay-1000"></div>

       <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/20 w-full max-w-md overflow-hidden animate-fade-in-up">
           <button onClick={handleDismiss} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-20">
               <X size={24} />
           </button>
           
           <div className="p-8 text-center relative z-10 text-white">
               {isSubmitted ? (
                   <div className="py-12 flex flex-col items-center animate-fade-in-up">
                       <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                          <CheckCircle size={40} className="text-green-400" />
                       </div>
                       <h3 className="text-2xl font-bold mb-2">{t.guest_modal_success}</h3>
                   </div>
               ) : (
                   <>
                       <div className="w-20 h-20 bg-gradient-to-br from-iconic-pink to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/20">
                            <Mic size={36} className="text-white drop-shadow-md" />
                       </div>
                       <h2 className="text-3xl font-serif font-black mb-4 leading-tight drop-shadow-sm">{t.guest_modal_title}</h2>
                       <p className="text-white/80 mb-8 leading-relaxed text-sm font-light">
                           {t.guest_modal_desc}
                       </p>
                       
                       <form onSubmit={handleSubmit} className="space-y-4 text-left">
                           <div className="space-y-1">
                               <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest pl-1">{t.form_name}</label>
                               <input required name="name" type="text" className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-iconic-pink transition-all" />
                           </div>
                           <div className="space-y-1">
                               <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest pl-1">{t.form_email}</label>
                               <input required name="email" type="email" className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-iconic-pink transition-all" />
                           </div>
                           <div className="space-y-1">
                               <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest pl-1">Tvá Vize</label>
                               <textarea required name="vision" rows={2} className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-iconic-pink transition-all"></textarea>
                           </div>
                           <button type="submit" className="w-full bg-gradient-to-r from-iconic-pink to-purple-600 text-white font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(183,6,109,0.6)] hover:scale-[1.02] transition-all transform mt-2 border border-white/20">
                               {t.guest_modal_btn}
                           </button>
                       </form>
                   </>
               )}
           </div>
       </div>
    </div>
  );
};

interface HeaderProps {
    isBannerOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ isBannerOpen }) => {
  const { lang, setLang, t } = React.useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
        setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';
  const textColor = scrolled || !isHome ? 'text-iconic-black' : 'text-white';
  const navBg = scrolled || !isHome ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent';
  
  // Dynamic positioning: If banner is open, push nav down by 3rem (h-12)
  const topPosition = isBannerOpen ? 'top-12' : 'top-0';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${topPosition} py-4 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className={`text-3xl font-serif font-black tracking-tight ${textColor} group-hover:text-iconic-pink transition-colors`}>
              I<span className="text-iconic-pink">|</span>CONIC
            </span>
          </Link>
          
          <div className="hidden md:block">
            <div className={`ml-10 flex items-center space-x-8 font-bold text-sm tracking-wide ${textColor}`}>
              <Link to="/" className="hover:text-iconic-pink transition-colors px-3 py-2">{t.nav_home}</Link>
              <Link to="/episodes" className="hover:text-iconic-pink transition-colors px-3 py-2">{t.nav_episodes}</Link>
              <Link to="/contact" className="hover:text-iconic-pink transition-colors px-3 py-2">{t.nav_contact}</Link>
              <Link to="/crm" className="hover:text-iconic-pink transition-colors px-3 py-2 font-normal text-xs opacity-70">{t.nav_crm}</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
             <div className="relative group">
                <button className={`flex items-center ${textColor} font-bold hover:text-iconic-pink transition-colors`}>
                    <Globe size={18} className="mr-1" /> {lang.split('-')[0].toUpperCase()}
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white text-iconic-black rounded-md shadow-xl py-1 hidden group-hover:block border border-gray-100 animate-fade-in-up">
                    <button onClick={() => setLang('cs-CZ')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium">Čeština</button>
                    <button onClick={() => setLang('en-US')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium">English</button>
                    <button onClick={() => setLang('es-MX')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium">Español</button>
                </div>
             </div>
             <a href="https://open.spotify.com/show/5TNpvLzycWShFtP0uu39bE" target="_blank" rel="noopener noreferrer" className="bg-iconic-pink text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-pink-600 transition-colors shadow-lg shadow-pink-500/30">
                 Subscribe
             </a>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className={`${textColor} hover:text-iconic-pink p-2`}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in-up shadow-xl absolute w-full left-0">
          <div className="px-4 pt-4 pb-6 space-y-2 text-center">
             <Link to="/" onClick={() => setIsOpen(false)} className="text-iconic-black hover:text-iconic-pink block px-3 py-3 rounded-md text-lg font-bold">{t.nav_home}</Link>
             <Link to="/episodes" onClick={() => setIsOpen(false)} className="text-iconic-black hover:text-iconic-pink block px-3 py-3 rounded-md text-lg font-bold">{t.nav_episodes}</Link>
             <Link to="/contact" onClick={() => setIsOpen(false)} className="text-iconic-black hover:text-iconic-pink block px-3 py-3 rounded-md text-lg font-bold">{t.nav_contact}</Link>
             <div className="flex justify-center gap-6 py-4 border-t border-gray-100 mt-2">
                <button onClick={() => {setLang('cs-CZ'); setIsOpen(false)}} className={`text-sm font-bold ${lang === 'cs-CZ' ? 'text-iconic-pink' : 'text-gray-400'}`}>CZ</button>
                <button onClick={() => {setLang('en-US'); setIsOpen(false)}} className={`text-sm font-bold ${lang === 'en-US' ? 'text-iconic-pink' : 'text-gray-400'}`}>EN</button>
                <button onClick={() => {setLang('es-MX'); setIsOpen(false)}} className={`text-sm font-bold ${lang === 'es-MX' ? 'text-iconic-pink' : 'text-gray-400'}`}>ES</button>
             </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero: React.FC = () => {
  const { t } = React.useContext(LanguageContext);
  return (
    <div className="relative bg-iconic-black min-h-screen flex items-center pt-32 pb-12 overflow-hidden z-10">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-iconic-pink/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 z-0 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-iconic-blue/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 z-0 animate-blob" style={{animationDelay: '2s'}}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 h-full items-center">
            
            {/* Left Content - Centered */}
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

            {/* Right Image - Zuzzi Portrait */}
            <div className="order-1 md:order-2 flex justify-center items-center h-full">
                <ScrollReveal delay={400} className="relative w-full max-w-sm md:max-w-md">
                    {/* Decorative Frame */}
                    <div className="absolute -inset-4 border border-white/10 rounded-[40px] z-0 transform rotate-3"></div>
                    <div className="absolute -inset-4 border border-iconic-pink/30 rounded-[40px] z-0 transform -rotate-3"></div>
                    
                    {/* Image Container */}
                    <div className="relative rounded-[32px] overflow-hidden shadow-2xl aspect-[3/4] z-10 bg-gray-800">
                        <img 
                            src={ZUZZI_HERO_IMAGE} 
                            alt="Zuzana Husarova" 
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
                        />
                        {/* Gradient Overlay at bottom - Lightened significantly so gold dress shows */}
                        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-iconic-black/20 to-transparent"></div>
                    </div>
                </ScrollReveal>
            </div>
        </div>
      </div>
    </div>
  );
};

const PodcastCard: React.FC<{ episode: PodcastEpisode }> = ({ episode }) => {
  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full z-20 relative">
      <div className="relative overflow-hidden aspect-square">
        <img 
          src={episode.imageUrl} 
          alt={episode.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-iconic-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
           <Link to={`/episodes/${episode.id}`} className="bg-white text-iconic-black p-3 rounded-full hover:bg-iconic-pink hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform">
              <Play size={24} fill="currentColor" />
           </Link>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="text-xs font-bold text-iconic-blue uppercase tracking-wider mb-2">{episode.date} • {episode.duration}</div>
        <h3 className="text-xl font-serif font-bold text-iconic-black mb-3 group-hover:text-iconic-pink transition-colors">
            <Link to={`/episodes/${episode.id}`}>{episode.title}</Link>
        </h3>
        <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">
          {episode.description}
        </p>
        <div className="flex gap-4 pt-4 border-t border-gray-100">
             <a href={episode.platformLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 transition-colors"><Youtube size={20} /></a>
             <a href={episode.platformLinks.spotify} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition-colors"><Mic size={20} /></a>
        </div>
      </div>
    </div>
  );
};

const EpisodeList: React.FC = () => {
  const { t } = React.useContext(LanguageContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const tags = ["All", "Business", "Mindset", "Lifestyle", "Finance"];

  const filteredEpisodes = PODCAST_EPISODES.filter(ep => {
      const matchesSearch = ep.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            ep.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isAll = activeTag === "All" || activeTag === t.filter_all;
      const matchesTag = isAll || 
                         ep.description.includes(activeTag) || 
                         ep.title.includes(activeTag) || 
                         (ep.tags && ep.tags.includes(activeTag));
      
      return matchesSearch && matchesTag;
  });

  return (
    <div className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <ScrollReveal>
             <h2 className="text-3xl md:text-5xl font-serif font-black text-iconic-black mb-4">{t.latest_episodes}</h2>
             <div className="w-24 h-1.5 bg-iconic-pink mx-auto mb-8"></div>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <div className="max-w-2xl mx-auto space-y-6">
               <input 
                  type="text" 
                  placeholder={t.search_placeholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 rounded-full border-2 border-gray-100 shadow-sm focus:outline-none focus:ring-0 focus:border-iconic-black text-lg transition-all"
               />
               <div className="flex flex-wrap justify-center gap-2">
                   {tags.map(tag => {
                       const displayTag = tag === "All" ? t.filter_all : tag;
                       return (
                       <button 
                          key={tag}
                          onClick={() => setActiveTag(tag === "All" ? t.filter_all : tag)}
                          className={`px-5 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 uppercase tracking-wide ${
                              (activeTag === tag || (tag === "All" && activeTag === t.filter_all))
                              ? 'bg-iconic-black text-white shadow-lg' 
                              : 'bg-white border-2 border-gray-100 text-gray-400 hover:border-iconic-black hover:text-iconic-black'
                          }`}
                       >
                           {displayTag}
                       </button>
                   )})}
               </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredEpisodes.length > 0 ? (
            filteredEpisodes.map((ep, index) => (
                <ScrollReveal key={ep.id} delay={index * 150} direction="left">
                    <PodcastCard episode={ep} />
                </ScrollReveal>
            ))
          ) : (
             <div className="col-span-full text-center py-12 text-gray-500">
                 {t.no_episodes_found}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EpisodeDetail: React.FC = () => {
    const { id } = useParams();
    const episode = PODCAST_EPISODES.find(p => p.id === id);
    const { t } = React.useContext(LanguageContext);

    if (!episode) return <div className="pt-32 text-center">Episode not found</div>;

    return (
        <div className="pt-20 min-h-screen">
            <div className="bg-iconic-black text-white py-24 relative overflow-hidden z-20">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-iconic-pink/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                 <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <ScrollReveal>
                        <span className="text-iconic-pink font-bold tracking-widest uppercase text-sm mb-4 block">{episode.date}</span>
                        <h1 className="text-4xl md:text-6xl font-serif font-black mb-8 leading-tight">{episode.title}</h1>
                    </ScrollReveal>
                 </div>
            </div>
            
            <div className="max-w-5xl mx-auto px-4 py-12 -mt-16 relative z-30">
                {episode.videoUrl ? (
                    <ScrollReveal>
                        <LazyYouTubePlayer videoId={episode.videoUrl} title={episode.title} />
                    </ScrollReveal>
                ) : null}

                <ScrollReveal delay={100}>
                    <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-lg mb-12">
                         <iframe 
                            style={{borderRadius: '12px'}} 
                            src="https://open.spotify.com/embed/show/5TNpvLzycWShFtP0uu39bE?utm_source=generator&theme=0" 
                            width="100%" 
                            height="152" 
                            frameBorder="0" 
                            allowFullScreen 
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                            loading="lazy"
                            title="Spotify Player"
                         ></iframe>
                    </div>
                </ScrollReveal>

                <div className="grid md:grid-cols-3 gap-12">
                    <div className="md:col-span-2">
                        <ScrollReveal delay={200}>
                            <h3 className="text-3xl font-serif font-bold mb-6 text-iconic-black">{t.episode_about_title}</h3>
                            <div className="prose prose-lg text-gray-600 leading-relaxed mb-6">
                                <p className="font-medium text-black">{episode.description}</p>
                                <p>{t.episode_description_suffix}</p>
                            </div>
                        </ScrollReveal>
                    </div>
                    <div>
                         <ScrollReveal delay={300}>
                             <div className="bg-[#F9F9F9] p-6 rounded-xl shadow-sm border border-gray-100 sticky top-32">
                                <h4 className="font-bold text-xl mb-6">{t.listen_on}</h4>
                                <div className="space-y-3">
                                    <a href={episode.platformLinks.spotify} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between p-4 rounded-lg bg-white border border-gray-200 text-iconic-black hover:border-[#1DB954] hover:text-[#1DB954] transition-all font-bold group shadow-sm">
                                        <div className="flex items-center gap-3"><Mic size={20} /> Spotify</div>
                                        <ExternalLink size={16} className="text-gray-300 group-hover:text-[#1DB954] transition-colors"/>
                                    </a>
                                    <a href={episode.platformLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between p-4 rounded-lg bg-white border border-gray-200 text-iconic-black hover:border-[#FF0000] hover:text-[#FF0000] transition-all font-bold group shadow-sm">
                                        <div className="flex items-center gap-3"><Youtube size={20} /> YouTube</div>
                                        <ExternalLink size={16} className="text-gray-300 group-hover:text-[#FF0000] transition-colors"/>
                                    </a>
                                    <a href={episode.platformLinks.apple} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between p-4 rounded-lg bg-white border border-gray-200 text-iconic-black hover:border-black hover:text-black transition-all font-bold group shadow-sm">
                                        <div className="flex items-center gap-3"><Video size={20} /> Apple Podcasts</div>
                                        <ExternalLink size={16} className="text-gray-300 group-hover:text-black transition-colors"/>
                                    </a>
                                </div>
                             </div>
                         </ScrollReveal>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ContactPage: React.FC = () => {
    // ... (rest of ContactPage code remains unchanged)
    const { t } = React.useContext(LanguageContext);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        storageService.saveLead({
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            interest: formData.get('message') as string,
            source: 'contact_form',
            notes: 'Submitted via Website Contact Page',
            tags: ['Web Inquiry']
        });
        setSubmitted(true);
    };

    return (
        <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
             <div className="max-w-4xl mx-auto px-4 relative z-10">
                 <div className="text-center mb-16">
                     <ScrollReveal>
                         <h1 className="text-4xl md:text-6xl font-serif font-black text-iconic-black mb-4">{t.contact_title}</h1>
                         <p className="text-gray-600 text-xl font-light">{t.contact_subtitle}</p>
                     </ScrollReveal>
                 </div>

                 <ScrollReveal delay={200}>
                     <div className="grid md:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
                         <div className="p-12 bg-iconic-black text-white flex flex-col justify-center relative overflow-hidden">
                             <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-iconic-pink/20 rounded-full blur-[100px]"></div>
                             
                             <h3 className="text-2xl font-serif font-bold mb-8 relative z-10">{t.contact_info_title}</h3>
                             <div className="space-y-8 relative z-10">
                                 <div className="flex items-center gap-4 group">
                                     <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-iconic-pink transition-colors">
                                        <Mail className="text-white" />
                                     </div>
                                     <div>
                                         <div className="font-bold text-sm text-gray-400 uppercase tracking-widest">{t.contact_email}</div>
                                         <div className="text-lg">hello@iconic-podcast.com</div>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-4 group">
                                     <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-iconic-pink transition-colors">
                                        <Phone className="text-white" />
                                     </div>
                                     <div>
                                         <div className="font-bold text-sm text-gray-400 uppercase tracking-widest">{t.contact_phone}</div>
                                         <div className="text-lg">+420 775 152 006</div>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-4 group">
                                     <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-iconic-pink transition-colors">
                                        <Instagram className="text-white" />
                                     </div>
                                     <div>
                                         <div className="font-bold text-sm text-gray-400 uppercase tracking-widest">{t.contact_instagram}</div>
                                         <div className="text-lg">@zuzzimentor</div>
                                     </div>
                                 </div>
                             </div>
                         </div>

                         <div className="p-12">
                             {submitted ? (
                                 <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in-up">
                                     <CheckCircle size={64} className="text-green-500 mb-6" />
                                     <h3 className="text-3xl font-serif font-bold mb-4">{t.contact_success_title}</h3>
                                     <p className="text-gray-600">{t.contact_success_msg}</p>
                                 </div>
                             ) : (
                                 <form onSubmit={handleSubmit} className="space-y-6">
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t.form_name}</label>
                                         <input required name="name" type="text" className="w-full p-4 border-2 border-gray-100 rounded-lg focus:ring-0 focus:border-iconic-black outline-none transition-all bg-gray-50 focus:bg-white" />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t.form_email}</label>
                                         <input required name="email" type="email" className="w-full p-4 border-2 border-gray-100 rounded-lg focus:ring-0 focus:border-iconic-black outline-none transition-all bg-gray-50 focus:bg-white" />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t.form_phone}</label>
                                         <input name="phone" type="tel" className="w-full p-4 border-2 border-gray-100 rounded-lg focus:ring-0 focus:border-iconic-black outline-none transition-all bg-gray-50 focus:bg-white" />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t.form_message}</label>
                                         <textarea required name="message" rows={4} className="w-full p-4 border-2 border-gray-100 rounded-lg focus:ring-0 focus:border-iconic-black outline-none transition-all bg-gray-50 focus:bg-white"></textarea>
                                     </div>
                                     <button type="submit" className="w-full bg-iconic-pink text-white py-4 rounded-lg font-bold text-lg hover:bg-iconic-black transition-colors">{t.form_submit}</button>
                                 </form>
                             )}
                         </div>
                     </div>
                 </ScrollReveal>
             </div>
        </div>
    );
};

// ... (rest of the file: Chatbot, AdminDashboard, Footer, App) remains unchanged
const Chatbot: React.FC = () => {
    const { lang, t } = React.useContext(LanguageContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            startChatSession(lang);
            setMessages([{ id: '0', role: 'model', text: t.chatbot_welcome }]);
        }
    }, [isOpen, lang, t]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const handleSend = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim()) return;
        
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        try {
            const response = await sendMessageToGemini(textToSend);
            const modelText = response.text || "";
            const functionCalls = response.functionCalls;
            
            if (modelText) {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: modelText }]);
            }
            
            if (functionCalls && functionCalls.length > 0) {
                for (const call of functionCalls) {
                    if (call.name === 'show_lead_form') {
                        setMessages(prev => [...prev, { 
                            id: (Date.now() + 1).toString(), 
                            role: 'model', 
                            text: "Ráda tě propojím se Zuzanou a jejím týmem. Vyplň prosím kontaktní údaje:", 
                            type: 'ui-form' 
                        }]);
                    } else if (call.name === 'show_pricing') {
                        setMessages(prev => [...prev, { 
                            id: (Date.now() + 2).toString(), 
                            role: 'model', 
                            text: "Zde jsou možnosti spolupráce a mentoringu:", 
                            type: 'ui-pricing' 
                        }]);
                    } else if (call.name === 'recommend_podcast') {
                        const episodeId = (call.args as any).episodeId;
                        const reason = (call.args as any).reason || "Myslím, že tato epizoda se ti bude líbit!";
                        setMessages(prev => [...prev, {
                             id: (Date.now() + 3).toString(),
                             role: 'model',
                             text: reason,
                             type: 'ui-card',
                             data: { episodeId }
                        }]);
                    }
                }
            } else if (!modelText) {
                 setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Rozumím." }]);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Omlouvám se, momentálně nemohu odpovědět. Zkuste to prosím později." }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleLeadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name') as string;
        
        storageService.saveLead({ 
            name, 
            email: formData.get('email') as string, 
            phone: formData.get('phone') as string, 
            interest: 'Chatbot Conversation',
            source: 'chatbot',
            notes: 'Captured via AI Assistant',
            tags: ['AI Lead']
        });
        
        setNotification("Úspěšně odesláno! Děkujeme.");
        setTimeout(() => setNotification(null), 3000);
        
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'model', 
            text: `Děkuji, ${name}. Údaje jsem předala. Ozveme se co nejdříve! ✨`,
            type: 'ui-notification'
        }]);
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 ${isOpen ? 'bg-iconic-black text-white' : 'bg-iconic-pink text-white'} border-4 border-white`}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-200 overflow-hidden animate-fade-in-up font-sans">
                    <div className="bg-gradient-to-r from-iconic-pink to-[#890451] p-4 flex items-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles size={60} />
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-3 border border-white/30 backdrop-blur-sm shadow-inner">
                            <span className="font-serif font-bold italic text-xl">I</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight">ICONIC Assistant</h3>
                            <div className="flex items-center text-xs text-white/80">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                Online • AI Powered
                            </div>
                        </div>
                    </div>

                    {notification && (
                        <div className="absolute top-20 left-4 right-4 bg-iconic-blue text-white px-4 py-3 rounded-lg shadow-xl text-sm flex items-center justify-center animate-bounce z-20">
                            <CheckCircle size={18} className="mr-2" /> {notification}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9F9F9]">
                        {messages.map((msg, index) => (
                            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-message-in`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm relative ${
                                    msg.role === 'user' 
                                    ? 'bg-iconic-black text-white rounded-tr-none' 
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}>
                                    {msg.text && <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                                    
                                    {/* Conversation Starters - Show only after the first welcome message */}
                                    {index === 0 && msg.role === 'model' && messages.length === 1 && (
                                        <div className="mt-4 flex flex-wrap gap-2 animate-fade-in-up">
                                            {t.chatbot_starters.map((starter: string, idx: number) => (
                                                 <button 
                                                     key={idx}
                                                     onClick={() => handleSend(starter)}
                                                     className="bg-white border border-iconic-pink/20 text-iconic-black text-xs font-bold py-2 px-3 rounded-full shadow-sm hover:bg-iconic-pink hover:text-white transition-all transform hover:scale-105 hover:shadow-md"
                                                 >
                                                     {starter}
                                                 </button>
                                            ))}
                                        </div>
                                    )}

                                    {msg.type === 'ui-form' && (
                                        <form onSubmit={handleLeadSubmit} className="mt-4 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <input required name="name" type="text" placeholder="Jméno a Příjmení" className="w-full p-3 text-sm border border-gray-200 rounded-lg bg-white focus:border-iconic-pink focus:outline-none transition-colors" />
                                            <input required name="email" type="email" placeholder="Email" className="w-full p-3 text-sm border border-gray-200 rounded-lg bg-white focus:border-iconic-pink focus:outline-none transition-colors" />
                                            <input name="phone" type="tel" placeholder="Telefon (+420...)" className="w-full p-3 text-sm border border-gray-200 rounded-lg bg-white focus:border-iconic-pink focus:outline-none transition-colors" />
                                            <button type="submit" className="w-full bg-iconic-pink text-white py-3 rounded-lg text-sm font-bold hover:bg-pink-700 transition-colors">Odeslat</button>
                                        </form>
                                    )}
                                    {msg.type === 'ui-pricing' && (
                                        <div className="mt-4 flex flex-col gap-3 overflow-y-auto max-h-60 pr-1 custom-scrollbar">
                                            {PRICING_PLANS.map((plan, i) => (
                                                <div key={i} className={`p-4 rounded-xl border ${plan.recommended ? 'border-iconic-pink bg-pink-50/50' : 'border-gray-200 bg-white'}`}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="font-bold text-sm text-iconic-black">{plan.name}</div>
                                                        {plan.recommended && <span className="bg-iconic-pink text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">Best</span>}
                                                    </div>
                                                    <div className="text-lg font-bold text-iconic-pink mb-2">{plan.price}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {msg.type === 'ui-card' && msg.data?.episodeId && (
                                        <div className="mt-4">
                                            {(() => {
                                                const ep = PODCAST_EPISODES.find(p => p.id === msg.data.episodeId);
                                                if (!ep) return null;
                                                return (
                                                    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md">
                                                        <img src={ep.imageUrl} alt={ep.title} className="w-full h-32 object-cover" />
                                                        <div className="p-3">
                                                            <div className="font-bold text-sm leading-tight mb-2">{ep.title}</div>
                                                            <Link to={`/episodes/${ep.id}`} className="text-xs text-iconic-pink font-bold flex items-center">Poslechnout <ChevronRight size={12} /></Link>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start animate-fade-in-up">
                                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 items-center flex gap-3">
                                   <Sparkles size={12} className="text-iconic-pink animate-spin" />
                                   <div className="flex space-x-1.5">
                                        <div className="w-1.5 h-1.5 bg-iconic-pink rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-iconic-pink rounded-full animate-bounce delay-100"></div>
                                        <div className="w-1.5 h-1.5 bg-iconic-pink rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Zeptejte se na cokoliv..."
                            className="flex-1 p-3.5 pl-5 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:border-iconic-pink transition-colors"
                        />
                        <button onClick={() => handleSend()} disabled={!input.trim() || isThinking} className="p-3.5 bg-iconic-black text-white rounded-full hover:bg-iconic-pink disabled:opacity-50 transition-colors">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

const AdminDashboard: React.FC = () => {
    const { t } = React.useContext(LanguageContext);
    const [leads, setLeads] = useState<Lead[]>(storageService.getLeads());
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [filterTag, setFilterTag] = useState<string>('All');
    const [newTagInput, setNewTagInput] = useState('');

    const refreshData = () => {
        setLeads(storageService.getLeads());
    };

    const allTags = Array.from(new Set(leads.flatMap(l => l.tags || [])));

    const filteredLeads = leads.filter(l => {
        if (filterTag === 'All') return true;
        return l.tags && l.tags.includes(filterTag);
    });

    const downloadCSV = () => {
        const headers = ["ID", "Name", "Email", "Phone", "Interest", "Source", "Status", "Notes", "Tags", "Date"];
        const rows = filteredLeads.map(l => [
            l.id, l.name, l.email, l.phone || '', l.interest, l.source, l.status, l.notes || '', (l.tags || []).join(';'), l.date
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + 
            [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "iconic_leads.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSaveLead = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLead) return;
        storageService.updateLead(selectedLead.id, {
            notes: selectedLead.notes,
            status: selectedLead.status,
            tags: selectedLead.tags
        });
        refreshData();
        setSelectedLead(null);
    };

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTagInput.trim() && selectedLead) {
            const currentTags = selectedLead.tags || [];
            if (!currentTags.includes(newTagInput.trim())) {
                 setSelectedLead({
                     ...selectedLead,
                     tags: [...currentTags, newTagInput.trim()]
                 });
            }
            setNewTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        if (selectedLead) {
             setSelectedLead({
                 ...selectedLead,
                 tags: (selectedLead.tags || []).filter(t => t !== tagToRemove)
             });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this lead?")) {
            storageService.deleteLead(id);
            refreshData();
            if (selectedLead?.id === id) setSelectedLead(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-32 px-4 pb-12 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                         <h1 className="text-3xl font-serif font-bold text-iconic-black">{t.crm_title}</h1>
                         <p className="text-gray-500">Manage your contacts and relationships</p>
                    </div>
                    
                    <div className="flex gap-4 items-center">
                        <div className="relative">
                            <select 
                                value={filterTag}
                                onChange={(e) => setFilterTag(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none cursor-pointer"
                            >
                                <option value="All">All Tags</option>
                                {allTags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <Tag size={16} />
                            </div>
                        </div>
                        <button onClick={downloadCSV} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
                            <Download size={18} /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Contact</th>
                                    <th className="p-4">Source</th>
                                    <th className="p-4">Tags</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredLeads.map(lead => (
                                    <tr 
                                        key={lead.id} 
                                        className="hover:bg-blue-50 transition-colors cursor-pointer group"
                                        onClick={() => setSelectedLead(lead)}
                                    >
                                        <td className="p-4 font-medium">{lead.name}</td>
                                        <td className="p-4 text-sm">
                                            <div className="text-gray-900">{lead.email}</div>
                                            <div className="text-gray-500 text-xs">{lead.phone || '-'}</div>
                                        </td>
                                        <td className="p-4"><span className="text-[10px] bg-gray-100 px-2 py-1 rounded border">{lead.source}</span></td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(lead.tags || []).slice(0, 3).map(tag => (
                                                    <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs text-gray-400">{new Date(lead.date).toLocaleDateString()}</td>
                                        <td className="p-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100">{lead.status}</span></td>
                                        <td className="p-4">
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }} className="p-2 hover:bg-red-100 text-gray-300 hover:text-red-500 rounded-full">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedLead && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                        <div className="bg-iconic-black text-white p-6 flex justify-between items-start">
                            <div><h3 className="text-2xl font-serif font-bold">{selectedLead.name}</h3></div>
                            <button onClick={() => setSelectedLead(null)} className="text-white/50 hover:text-white"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveLead} className="p-6">
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
                                    <select value={selectedLead.status} onChange={(e) => setSelectedLead({...selectedLead, status: e.target.value as any})} className="w-full p-2 border border-gray-200 rounded-lg">
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="converted">Converted</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Source</label>
                                    <input disabled value={selectedLead.source} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500" />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tags</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {(selectedLead.tags || []).map(tag => (
                                        <span key={tag} className="bg-iconic-pink/10 text-iconic-pink text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                            {tag} <button type="button" onClick={() => handleRemoveTag(tag)}><X size={12} /></button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={newTagInput} onChange={(e) => setNewTagInput(e.target.value)} placeholder="Add new tag..." className="flex-1 p-2 border border-gray-200 rounded-lg text-sm" onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e)} />
                                    <button type="button" onClick={handleAddTag} className="p-2 bg-gray-100 rounded-lg"><Plus size={18} /></button>
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Notes</label>
                                <textarea value={selectedLead.notes || ''} onChange={(e) => setSelectedLead({...selectedLead, notes: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl h-32 text-sm"></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="submit" className="px-6 py-2 bg-iconic-black text-white font-medium rounded-lg hover:bg-iconic-pink transition-colors flex items-center gap-2"><Save size={18} /> Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const Footer: React.FC = () => {
    const { t } = React.useContext(LanguageContext);
    return (
        <footer className="bg-iconic-black text-white pt-16 pb-8 border-t border-white/10 relative z-20">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2">
                    <span className="text-3xl font-serif font-black tracking-widest block mb-6">I<span className="text-iconic-pink">|</span>CONIC</span>
                    <p className="text-gray-400 max-w-sm mb-6">{t.footer_desc}</p>
                    <div className="flex space-x-4">
                        <a href="https://www.instagram.com/zuzzimentor/?hl=es" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-iconic-pink transition-colors"><Instagram size={20} /></a>
                        <a href="https://www.youtube.com/@ZuzziHusarova" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition-colors"><Youtube size={20} /></a>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-4">{t.footer_menu}</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li><Link to="/" className="hover:text-white transition-colors">{t.nav_home}</Link></li>
                        <li><Link to="/episodes" className="hover:text-white transition-colors">{t.nav_episodes}</Link></li>
                        <li><Link to="/contact" className="hover:text-white transition-colors">{t.nav_contact}</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-4">{t.footer_contact}</h4>
                    <p className="text-gray-400 text-sm">hello@iconic-podcast.com<br/>+420 775 152 006<br/>{t.footer_location}</p>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center text-gray-600 text-sm">&copy; {new Date().getFullYear()} Zuzana Husarova. {t.footer_rights}</div>
        </footer>
    );
};

export default function App() {
  const [lang, setLang] = useState<Language>('cs-CZ');
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  useEffect(() => {
    // Check newsletter banner status
    const newsletterStatus = localStorage.getItem('iconic_newsletter_status');
    if (newsletterStatus !== 'dismissed' && newsletterStatus !== 'subscribed') {
      const timer = setTimeout(() => setIsBannerOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Check guest modal status (LocalStorage = Permanent Signup, SessionStorage = Session Dismissal)
    const guestSignedUp = localStorage.getItem('iconic_guest_signed_up');
    const guestDismissed = sessionStorage.getItem('iconic_guest_dismissed');
    
    if (!guestSignedUp && !guestDismissed) {
        const timer = setTimeout(() => setIsGuestModalOpen(true), 4000); // 4 seconds delay
        return () => clearTimeout(timer);
    }
  }, []);

  const contextValue = {
    lang,
    setLang,
    t: TRANSLATIONS[lang]
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      <HashRouter>
        <div className="flex flex-col min-h-screen relative overflow-x-hidden bg-white">
          <AnimatedBackground />
          <CursorSpotlight />
          <NewsletterToast isOpen={isBannerOpen} onClose={() => setIsBannerOpen(false)} />
          {isGuestModalOpen && <GuestInvitationModal onClose={() => setIsGuestModalOpen(false)} />}
          <Header isBannerOpen={isBannerOpen} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<><Hero /><EpisodeList /></>} />
              <Route path="/episodes" element={<EpisodeList />} />
              <Route path="/episodes/:id" element={<EpisodeDetail />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/crm" element={<AdminDashboard />} />
              <Route path="/about" element={<ContactPage />} />
            </Routes>
          </main>
          <Footer />
          <Chatbot />
        </div>
      </HashRouter>
    </LanguageContext.Provider>
  );
}