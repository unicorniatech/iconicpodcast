import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Menu, X, Mic, ChevronDown, User, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
    isBannerOpen: boolean;
}

// Admin emails that can see CRM
const ADMIN_EMAILS = ['zuzzi.husarova@gmail.com', 'ceo@vistadev.mx'];

export const Header: React.FC<HeaderProps> = ({ isBannerOpen }) => {
  const { lang, setLang, t } = useLanguage();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  // Check if current user is admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              {isAdmin && (
                <Link to="/crm" className="hover:text-iconic-pink transition-colors px-3 py-2 font-normal text-xs opacity-70">{t.nav_crm}</Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
             <div className="relative" ref={langMenuRef}>
                <button 
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className={`flex items-center gap-1 ${textColor} font-bold hover:text-iconic-pink transition-colors px-3 py-2 rounded-full hover:bg-white/10`}
                >
                    <Globe size={18} /> 
                    <span>{lang.split('-')[0].toUpperCase()}</span>
                    <ChevronDown size={14} className={`transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-white text-iconic-black rounded-xl shadow-xl py-2 border border-gray-100 animate-fade-in-up z-50">
                    <button onClick={() => {setLang('cs-CZ'); setLangMenuOpen(false);}} className={`block w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm font-medium ${lang === 'cs-CZ' ? 'text-iconic-pink' : ''}`}>🇨🇿 Čeština</button>
                    <button onClick={() => {setLang('en-US'); setLangMenuOpen(false);}} className={`block w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm font-medium ${lang === 'en-US' ? 'text-iconic-pink' : ''}`}>🇺🇸 English</button>
                    <button onClick={() => {setLang('es-MX'); setLangMenuOpen(false);}} className={`block w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm font-medium ${lang === 'es-MX' ? 'text-iconic-pink' : ''}`}>🇲🇽 Español</button>
                  </div>
                )}
             </div>
             
             {/* User Auth Buttons */}
             {user ? (
               <div className="flex items-center gap-2">
                 <Link to="/profile" className={`${textColor} hover:text-iconic-pink p-2`} title="Profile">
                   <User size={20} />
                 </Link>
                 <button 
                   onClick={() => logout()} 
                   className={`${textColor} hover:text-red-500 p-2`}
                   title="Sign Out"
                 >
                   <LogOut size={20} />
                 </button>
               </div>
             ) : (
               <Link to="/login" className={`${textColor} hover:text-iconic-pink font-bold text-sm`}>
                 Sign In
               </Link>
             )}
             
             <a href="https://open.spotify.com/show/5TNpvLzycWShFtP0uu39bE" target="_blank" rel="noopener noreferrer" className="bg-iconic-pink text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-pink-600 transition-colors shadow-lg shadow-pink-500/30 flex items-center gap-2">
                 <Mic size={16} /> Subscribe
             </a>
          </div>

          <div className="flex md:hidden items-center gap-2">
            {/* Mobile language button */}
            <button 
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className={`${textColor} hover:text-iconic-pink p-2 flex items-center gap-1`}
            >
              <Globe size={20} />
              <span className="text-xs font-bold">{lang.split('-')[0].toUpperCase()}</span>
            </button>
            {/* Hamburger */}
            <button onClick={() => setIsOpen(!isOpen)} className={`${textColor} hover:text-iconic-pink p-2`}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      
            {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[300px] bg-white z-50 md:hidden transform transition-transform duration-300 ease-out shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ backgroundColor: '#ffffff' }}>
        <div className="flex flex-col h-full">
          {/* Close button */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <span className="text-xl font-serif font-black">I<span className="text-iconic-pink">|</span>CONIC</span>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-6 px-4">
            <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-4 text-iconic-black hover:text-iconic-pink hover:bg-gray-50 rounded-xl text-lg font-bold transition-colors">
              {t.nav_home}
            </Link>
            <Link to="/episodes" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-4 text-iconic-black hover:text-iconic-pink hover:bg-gray-50 rounded-xl text-lg font-bold transition-colors">
              {t.nav_episodes}
            </Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-4 text-iconic-black hover:text-iconic-pink hover:bg-gray-50 rounded-xl text-lg font-bold transition-colors">
              {t.nav_contact}
            </Link>
            
            {/* User section */}
            {user ? (
              <>
                <div className="border-t border-gray-100 my-4"></div>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-4 text-iconic-black hover:text-iconic-pink hover:bg-gray-50 rounded-xl text-lg font-bold transition-colors">
                  <User size={20} />
                  {t.menu_profile}
                </Link>
                <button 
                  onClick={() => { logout(); setIsOpen(false); }} 
                  className="flex items-center gap-3 w-full px-4 py-4 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl text-lg font-medium transition-colors"
                >
                  <LogOut size={20} />
                  {t.menu_sign_out}
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-100 my-4"></div>
                <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-4 text-iconic-pink hover:bg-pink-50 rounded-xl text-lg font-bold transition-colors">
                  <User size={20} />
                  {t.menu_sign_in}
                </Link>
              </>
            )}
          </nav>

          {/* Language Switcher */}
          <div className="border-t border-gray-100 p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-2">{t.menu_language}</p>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => {setLang('cs-CZ'); setIsOpen(false)}} 
                className={`py-3 rounded-xl text-sm font-bold transition-all ${lang === 'cs-CZ' ? 'bg-iconic-pink text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                🇨🇿 CZ
              </button>
              <button 
                onClick={() => {setLang('en-US'); setIsOpen(false)}} 
                className={`py-3 rounded-xl text-sm font-bold transition-all ${lang === 'en-US' ? 'bg-iconic-pink text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                🇺🇸 EN
              </button>
              <button 
                onClick={() => {setLang('es-MX'); setIsOpen(false)}} 
                className={`py-3 rounded-xl text-sm font-bold transition-all ${lang === 'es-MX' ? 'bg-iconic-pink text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                🇲🇽 ES
              </button>
            </div>
          </div>

          {/* Subscribe Button */}
          <div className="p-4 border-t border-gray-100">
            <a 
              href="https://open.spotify.com/show/5TNpvLzycWShFtP0uu39bE" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2 w-full bg-iconic-pink text-white py-4 rounded-xl font-bold hover:bg-pink-600 transition-colors"
            >
              <Mic size={20} /> Subscribe on Spotify
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Language Dropdown (when clicking globe) */}
      {langMenuOpen && (
        <div className="md:hidden absolute top-full right-4 mt-2 w-40 bg-white rounded-xl shadow-xl py-2 border border-gray-100 animate-fade-in-up z-50">
          <button onClick={() => {setLang('cs-CZ'); setLangMenuOpen(false);}} className={`block w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium ${lang === 'cs-CZ' ? 'text-iconic-pink' : ''}`}>🇨🇿 Čeština</button>
          <button onClick={() => {setLang('en-US'); setLangMenuOpen(false);}} className={`block w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium ${lang === 'en-US' ? 'text-iconic-pink' : ''}`}>🇺🇸 English</button>
          <button onClick={() => {setLang('es-MX'); setLangMenuOpen(false);}} className={`block w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium ${lang === 'es-MX' ? 'text-iconic-pink' : ''}`}>🇲🇽 Español</button>
        </div>
      )}
    </nav>
  );
};

export default Header;
