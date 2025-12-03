import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Menu, X, Mic } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
    isBannerOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isBannerOpen }) => {
  const { lang, setLang, t } = useLanguage();
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

export default Header;
