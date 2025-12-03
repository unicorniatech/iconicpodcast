import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer: React.FC = () => {
    const { t } = useLanguage();
    return (
        <footer className="bg-iconic-black text-white pt-12 sm:pt-16 pb-6 sm:pb-8 border-t border-white/10 relative z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
                <div className="col-span-2">
                    <span className="text-2xl sm:text-3xl font-serif font-black tracking-widest block mb-4 sm:mb-6">I<span className="text-iconic-pink">|</span>CONIC</span>
                    <p className="text-gray-400 text-sm sm:text-base max-w-sm mb-4 sm:mb-6">{t.footer_desc}</p>
                    <div className="flex space-x-3">
                        <a href="https://www.instagram.com/zuzzimentor/?hl=es" target="_blank" rel="noopener noreferrer" className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-iconic-pink transition-colors"><Instagram size={22} /></a>
                        <a href="https://www.youtube.com/@ZuzziHusarova" target="_blank" rel="noopener noreferrer" className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition-colors"><Youtube size={22} /></a>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">{t.footer_menu}</h4>
                    <ul className="space-y-2 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                        <li><Link to="/" className="hover:text-white transition-colors py-1 inline-block">{t.nav_home}</Link></li>
                        <li><Link to="/episodes" className="hover:text-white transition-colors py-1 inline-block">{t.nav_episodes}</Link></li>
                        <li><Link to="/contact" className="hover:text-white transition-colors py-1 inline-block">{t.nav_contact}</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">{t.footer_contact}</h4>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">hello@iconic-podcast.com<br/>+420 775 152 006<br/>{t.footer_location}</p>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 text-center text-gray-600 text-xs sm:text-sm">&copy; {new Date().getFullYear()} Zuzana Husarova. {t.footer_rights}</div>
        </footer>
    );
};

export default Footer;
