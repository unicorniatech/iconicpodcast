import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer: React.FC = () => {
    const { t } = useLanguage();
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

export default Footer;
