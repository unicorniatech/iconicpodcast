/**
 * ICONIC Podcast - Main Application
 * 
 * Refactored to use:
 * - BrowserRouter for better SEO (Comment 8)
 * - Separate component files (Comment 10)
 * - Auth guards for protected routes (Comment 2, 6)
 * - HelmetProvider for dynamic metadata (Comment 8)
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useSearchParams, Navigate } from 'react-router-dom';
import { 
  Play, Video, CheckCircle, ExternalLink, Download, Trash2, Save, Tag, Mail, Phone, Plus, X, 
  Mic, Youtube, Instagram, ChevronDown
} from 'lucide-react';

// Contexts
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import { Header, Footer, Hero, Chatbot, AnimatedBackground, CursorSpotlight, ScrollReveal, AuthGuard, SEOHead, LazyYouTubePlayer } from './components';
import { Comments } from './components/Comments';
import { ShareButtons } from './components/ShareButtons';

// Pages
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { YouTubeLandingPage, InstagramLandingPage, SocialLandingPage } from './pages/LandingPage';
import { FAQPage } from './pages/FAQPage';
import { PodcastToolsPage } from './pages/PodcastToolsPage';
import PodcastGuestDetailPage from './pages/PodcastGuestDetailPage';
import EpisodePlanDetailPage from './pages/EpisodePlanDetailPage';
import { ProfilePage } from './pages/ProfilePage';

// Services & Data
import { TRANSLATIONS, PODCAST_EPISODES, PRICING_PLANS } from './constants';
import { Lead, PodcastEpisode } from './types';
import type { Database } from './types/database';
import supabase, { isSupabaseConfigured } from './services/supabaseClient';
import { saveLead, getLeads, updateLead, deleteLead, storageService } from './services/storageService';
import { logError, createAppError } from './services/errorService';
import { initAnalytics, trackPageView } from './services/analyticsService';

// ============================================================================
// NEWSLETTER TOAST
// ============================================================================
interface NewsletterToastProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewsletterToast: React.FC<NewsletterToastProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDismiss = () => {
    onClose();
    localStorage.setItem('iconic_newsletter_status', 'dismissed');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;

    if (email) {
      try {
        await saveLead({
          name: 'Newsletter Subscriber',
          email: email,
          interest: 'Newsletter Signup',
          source: 'newsletter',
          notes: 'Captured via Massive Toast',
          tags: ['Newsletter', 'Web']
        });
        setIsSubscribed(true);
        localStorage.setItem('iconic_newsletter_status', 'subscribed');
        setTimeout(() => onClose(), 3000);
      } catch (error) {
        logError(createAppError(error, 'UNKNOWN_ERROR', { action: 'newsletterSubscribe' }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[60] bg-iconic-black shadow-2xl animate-fade-in-down border-b border-iconic-pink/20 h-12 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <button onClick={handleDismiss} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-1">
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
                className="w-32 sm:w-48 px-3 py-1 text-xs sm:text-sm rounded border-none focus:ring-2 focus:ring-iconic-pink text-iconic-black placeholder-gray-500"
              />
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-3 py-1 bg-iconic-pink text-white text-xs sm:text-sm font-bold rounded hover:bg-pink-600 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {isSubmitting ? '...' : t.newsletter_btn}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// GUEST INVITATION MODAL
// ============================================================================
interface GuestInvitationModalProps {
  onClose: () => void;
}

const GuestInvitationModal: React.FC<GuestInvitationModalProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      await saveLead({
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
      setTimeout(() => onClose(), 3000);
    } catch (error) {
      logError(createAppError(error, 'UNKNOWN_ERROR', { action: 'guestModalSubmit' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    onClose();
    sessionStorage.setItem('iconic_guest_dismissed', 'true');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
       {/* Animated gradient background */}
       <div className="absolute inset-0 bg-gradient-to-br from-iconic-pink via-fuchsia-600/70 to-iconic-black bg-[length:300%_300%] animate-gradient-slow opacity-95"></div>
       <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
       
       {/* Floating orbs */}
       <div className="absolute top-1/4 left-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-iconic-pink rounded-full blur-[80px] sm:blur-[100px] animate-blob opacity-60"></div>
       <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-fuchsia-500 rounded-full blur-[80px] sm:blur-[100px] animate-blob animation-delay-2000 opacity-50"></div>

       {/* Modal container - full screen on mobile */}
       <div className="relative bg-white/10 backdrop-blur-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-0 sm:border border-white/20 w-full h-full sm:h-auto sm:max-w-md overflow-y-auto sm:overflow-hidden animate-fade-in-up flex flex-col">
           {/* Close button */}
           <button onClick={handleDismiss} className="absolute top-4 right-4 sm:top-4 sm:right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-all z-20">
               <X size={20} />
           </button>
           
           {/* Content */}
           <div className="p-6 sm:p-8 text-center relative z-10 text-white flex-1 flex flex-col justify-center">
               {isSubmitted ? (
                   <div className="py-8 sm:py-12 flex flex-col items-center animate-fade-in-up">
                       <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4 sm:mb-6 border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                          <CheckCircle size={32} className="sm:w-10 sm:h-10 text-green-400" />
                       </div>
                       <h3 className="text-xl sm:text-2xl font-bold mb-2">{t.guest_modal_success}</h3>
                   </div>
               ) : (
                   <>
                       <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-iconic-pink to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg border border-white/20">
                           <Mic size={28} className="sm:w-9 sm:h-9 text-white drop-shadow-md" />
                       </div>
                       <h2 className="text-2xl sm:text-3xl font-serif font-black mb-3 sm:mb-4 leading-tight drop-shadow-sm">{t.guest_modal_title}</h2>
                       <p className="text-white/80 mb-6 sm:mb-8 leading-relaxed text-sm font-light max-w-sm mx-auto">{t.guest_modal_desc}</p>
                       
                       <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-left">
                           <div className="space-y-1">
                               <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest pl-1">{t.form_name}</label>
                               <input required name="name" type="text" className="w-full p-3 sm:p-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:bg-white/15 focus:border-iconic-pink transition-all text-base" />
                           </div>
                           <div className="space-y-1">
                               <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest pl-1">{t.form_email}</label>
                               <input required name="email" type="email" className="w-full p-3 sm:p-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:bg-white/15 focus:border-iconic-pink transition-all text-base" />
                           </div>
                           <div className="space-y-1">
                               <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest pl-1">Tvá Vize</label>
                               <textarea required name="vision" rows={2} className="w-full p-3 sm:p-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:bg-white/15 focus:border-iconic-pink transition-all resize-none text-base"></textarea>
                           </div>
                           <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-iconic-pink via-fuchsia-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(183,6,109,0.6)] active:scale-[0.98] transition-all transform mt-2 border border-white/20 disabled:opacity-50 text-base">
                               {isSubmitting ? '...' : t.guest_modal_btn}
                           </button>
                       </form>
                   </>
               )}
           </div>
       </div>
    </div>
  );
};

// ============================================================================
// Helper: Map DB episode row to PodcastEpisode
// ============================================================================
type EpisodeRow = Database['public']['Tables']['episodes']['Row'];

const stripCdata = (value: string | null): string => {
  if (!value) return '';
  return value
    .replace(/^<!\[CDATA\[/i, '')
    .replace(/\]\]>$/i, '')
    .trim();
};

const stripHtml = (value: string): string => {
  return value.replace(/<[^>]+>/g, '');
};

const mapEpisodeRowToPodcastEpisode = (row: EpisodeRow): PodcastEpisode => {
  const cleanTitle = stripCdata(row.title ?? null);
  const cleanDescription = stripHtml(stripCdata(row.description ?? null));

  const staticEpisode = PODCAST_EPISODES.find((ep) => ep.id === row.id) || null;

  return {
    id: row.id,
    title: cleanTitle || row.title,
    description: cleanDescription || row.description,
    summaries: undefined,
    duration: row.duration || '',
    date: row.published_at,
    // Prefer Supabase image_url so UUID-based episodes can still have thumbnails,
    // then fall back to static/public images, then to a generic hero image.
    imageUrl: row.image_url || staticEpisode?.imageUrl || '/mainhero.webp',
    videoUrl: row.video_url || undefined,
    audioUrl: row.audio_url || undefined,
    platformLinks: {
      spotify: row.spotify_url,
      youtube: row.youtube_url,
      apple: row.apple_url,
    },
    tags: row.tags || [],
  };
};

// ============================================================================
// PODCAST CARD - Glassmorphism Style
// ============================================================================
const PodcastCard: React.FC<{ episode: PodcastEpisode }> = ({ episode }) => {
  const { lang } = useLanguage();
  const translatedSummary = episode.summaries?.[lang];
  const summary = translatedSummary || episode.description;
  const showHelperSummary = lang !== 'cs-CZ' && translatedSummary;
  const [imageLoaded, setImageLoaded] = React.useState(false);

  return (
    <div
      className="group relative bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-white/50 flex flex-col h-full z-20"
      title={showHelperSummary || undefined}
    >
      {/* Subtle gradient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-iconic-pink/5 via-transparent to-iconic-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl"></div>
      
      <div className="relative overflow-hidden aspect-video">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={episode.imageUrl}
          alt={episode.title}
          className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-iconic-black/80 via-iconic-black/20 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-end p-4 sm:p-6">
           <Link to={`/episodes/${episode.id}`} className="bg-white/90 backdrop-blur-sm text-iconic-black p-2.5 sm:p-3 rounded-full hover:bg-iconic-pink hover:text-white transition-all transform sm:translate-y-4 sm:group-hover:translate-y-0 hover:scale-110">
              <Play size={20} className="sm:w-6 sm:h-6" fill="currentColor" />
           </Link>
        </div>
      </div>
      <div className="p-4 sm:p-6 flex-1 flex flex-col relative">
        <div className="text-xs font-bold text-iconic-blue uppercase tracking-wider mb-2">{episode.date} • {episode.duration}</div>
        <h3
          className="text-lg sm:text-xl font-serif font-bold text-iconic-black mb-1 sm:mb-2 group-hover:text-iconic-pink transition-colors line-clamp-2"
          title={showHelperSummary || undefined}
        >
            <Link to={`/episodes/${episode.id}`}>{episode.title}</Link>
        </h3>
        {showHelperSummary && (
          <p className="text-xs text-gray-500 mb-1 line-clamp-2">
            {translatedSummary}
          </p>
        )}
        <p className="text-gray-600 text-sm line-clamp-2 sm:line-clamp-3 mb-4 flex-1">{summary}</p>
        <div className="flex gap-4 pt-3 sm:pt-4 border-t border-gray-200/50">
             <a href={episode.platformLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 hover:scale-125 transition-all p-1"><Youtube size={22} /></a>
             <a href={episode.platformLinks.spotify} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 hover:scale-125 transition-all p-1"><Mic size={22} /></a>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EPISODE LIST
// ============================================================================
const EpisodeList: React.FC = () => {
  const { t } = useLanguage();
  const [episodes, setEpisodes] = useState<PodcastEpisode[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const tags = ["All", "Business", "Mindset", "Lifestyle", "Finance"];

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const buildSearchCorpus = (episode: PodcastEpisode) => {
    const parts: string[] = [];
    if (episode.title) parts.push(episode.title);
    if (episode.description) parts.push(episode.description);
    if (episode.summaries) parts.push(...Object.values(episode.summaries));
    if (episode.tags && episode.tags.length) parts.push(episode.tags.join(" "));
    return normalize(parts.join(" "));
  };

  useEffect(() => {
    const loadEpisodes = async () => {
      if (!isSupabaseConfigured()) {
        setEpisodes(PODCAST_EPISODES);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('episodes')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false });

        if (error || !data || data.length === 0) {
          setEpisodes(PODCAST_EPISODES);
          return;
        }

        const mapped = data.map(mapEpisodeRowToPodcastEpisode);
        setEpisodes(mapped);
      } catch {
        setEpisodes(PODCAST_EPISODES);
      } finally {
        setIsLoading(false);
      }
    };

    loadEpisodes();
  }, []);

  const sourceEpisodes = !episodes || episodes.length === 0 ? PODCAST_EPISODES : episodes;

  const sortedEpisodes = [...sourceEpisodes].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  const filteredEpisodes = sortedEpisodes.filter(ep => {
      const term = normalize(searchTerm);
      const corpus = buildSearchCorpus(ep);

      const matchesSearch = !term || corpus.includes(term);

      const isAll = activeTag === "All";
      const matchesTag = isAll || (ep.tags && ep.tags.includes(activeTag));

      return matchesSearch && matchesTag;
  });

  return (
    <div className="pt-24 sm:pt-32 pb-16 sm:pb-24 relative z-10 overflow-hidden">
      {/* Aurora Background Effect - Pink to Purple Pastel */}
      <div className="absolute inset-0 -z-10">
        {/* Animated gradient base - pink to purple only */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/70 via-fuchsia-50/50 to-purple-100/60 animate-gradient-slow bg-[length:400%_400%]"></div>
        
        {/* Layer 1: Large slow-moving base blobs */}
        <div className="absolute -top-20 -left-20 w-[800px] h-[800px] bg-gradient-to-br from-pink-300/50 to-rose-200/40 rounded-full blur-[150px] animate-blob"></div>
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-fuchsia-300/45 to-pink-200/35 rounded-full blur-[140px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 -left-20 w-[750px] h-[750px] bg-gradient-to-tr from-violet-300/45 to-purple-200/35 rounded-full blur-[160px] animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-20 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-rose-300/40 to-pink-200/30 rounded-full blur-[140px] animate-blob" style={{animationDelay: '1s'}}></div>
        
        {/* Layer 2: Medium mixing blobs */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gradient-to-r from-fuchsia-300/40 to-pink-300/30 rounded-full blur-[100px] animate-blob" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-gradient-to-l from-purple-300/35 to-violet-200/25 rounded-full blur-[90px] animate-blob" style={{animationDelay: '2.5s'}}></div>
        <div className="absolute bottom-1/3 left-1/4 w-[480px] h-[480px] bg-gradient-to-t from-pink-300/35 to-rose-200/25 rounded-full blur-[95px] animate-blob" style={{animationDelay: '4.5s'}}></div>
        <div className="absolute bottom-1/4 right-1/3 w-[520px] h-[520px] bg-gradient-to-b from-fuchsia-200/30 to-pink-200/20 rounded-full blur-[100px] animate-blob" style={{animationDelay: '1.5s'}}></div>
        
        {/* Layer 3: Smaller accent blobs for color mixing */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-pink-400/35 to-violet-300/25 rounded-full blur-[80px] animate-blob" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/6 left-1/2 w-[350px] h-[350px] bg-gradient-to-bl from-fuchsia-400/30 to-purple-300/20 rounded-full blur-[70px] animate-blob" style={{animationDelay: '5.5s'}}></div>
        <div className="absolute top-2/3 left-1/6 w-[380px] h-[380px] bg-gradient-to-tr from-rose-400/30 to-fuchsia-300/20 rounded-full blur-[75px] animate-blob" style={{animationDelay: '6s'}}></div>
        <div className="absolute top-1/2 right-1/6 w-[360px] h-[360px] bg-gradient-to-tl from-purple-300/30 to-violet-200/20 rounded-full blur-[70px] animate-blob" style={{animationDelay: '3.5s'}}></div>
        <div className="absolute bottom-1/6 left-1/2 w-[320px] h-[320px] bg-gradient-to-r from-purple-300/30 to-pink-200/20 rounded-full blur-[65px] animate-blob" style={{animationDelay: '7s'}}></div>
        
        {/* Layer 4: Tiny floating accent dots */}
        <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] bg-pink-400/40 rounded-full blur-[50px] animate-blob" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-3/4 right-1/4 w-[180px] h-[180px] bg-fuchsia-400/35 rounded-full blur-[45px] animate-blob" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/2 left-3/4 w-[220px] h-[220px] bg-violet-400/35 rounded-full blur-[55px] animate-blob" style={{animationDelay: '6.5s'}}></div>
        <div className="absolute bottom-1/3 left-1/3 w-[190px] h-[190px] bg-rose-400/35 rounded-full blur-[48px] animate-blob" style={{animationDelay: '1.2s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-[170px] h-[170px] bg-purple-400/30 rounded-full blur-[42px] animate-blob" style={{animationDelay: '5s'}}></div>
        
        {/* Soft white overlay for readability */}
        <div className="absolute inset-0 bg-white/15"></div>
      </div>
      
      <SEOHead title={t.latest_episodes} description="Všechny epizody ICONIC Podcast - business, mindset, lifestyle." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-10 sm:mb-16">
          <ScrollReveal>
             <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif font-black text-iconic-black mb-3 sm:mb-4">{t.latest_episodes}</h2>
             <div className="w-16 sm:w-24 h-1 sm:h-1.5 bg-iconic-pink mx-auto mb-6 sm:mb-8"></div>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
               {/* Glassmorphism search input */}
               <input 
                  type="text" 
                  placeholder={t.search_placeholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-5 sm:px-6 py-3 sm:py-4 rounded-full bg-white/70 backdrop-blur-lg border border-white/50 shadow-lg focus:outline-none focus:ring-2 focus:ring-iconic-pink/30 focus:border-iconic-pink/50 text-base sm:text-lg transition-all placeholder:text-gray-400"
               />
               {/* Glassmorphism filter buttons */}
               <div className="flex flex-wrap justify-center gap-2">
                   {tags.map(tag => {
                       const displayTag = tag === "All" ? t.filter_all : tag;
                       return (
                       <button 
                          key={tag}
                          onClick={() => setActiveTag(tag)}
                          className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all transform hover:scale-105 uppercase tracking-wide backdrop-blur-sm ${
                              activeTag === tag
                              ? 'bg-iconic-black text-white shadow-lg' 
                              : 'bg-white/60 border border-white/50 text-gray-500 hover:bg-white/80 hover:text-iconic-black shadow-sm'
                          }`}
                       >
                           {displayTag}
                       </button>
                   )})}
               </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {isLoading && sourceEpisodes.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white/50 backdrop-blur-sm rounded-2xl">
              {t.placeholder_loading}
            </div>
          )}
          {!isLoading && filteredEpisodes.length > 0 ? (
            filteredEpisodes.map((ep, index) => (
                <ScrollReveal key={ep.id} delay={index * 150} direction="left">
                    <PodcastCard episode={ep} />
                </ScrollReveal>
            ))
          ) : (
             <div className="col-span-full text-center py-12 text-gray-500 bg-white/50 backdrop-blur-sm rounded-2xl">{t.no_episodes_found}</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EPISODE DETAIL
// ============================================================================
const EpisodeDetail: React.FC = () => {
    const { id } = useParams();
    const [episode, setEpisode] = useState<PodcastEpisode | null>(
      () => PODCAST_EPISODES.find(p => p.id === id) || null
    );
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const { t, lang } = useLanguage();

    // Always start at top when opening an episode detail
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [id]);

    useEffect(() => {
      const loadEpisode = async () => {
        if (!id || !isSupabaseConfigured()) return;

        try {
          const { data, error } = await supabase
            .from('episodes')
            .select('*')
            .eq('id', id)
            .maybeSingle();

          if (!error && data) {
            const dbEpisode = mapEpisodeRowToPodcastEpisode(data as EpisodeRow);

            // Try to resolve static metadata in two ways:
            // 1) Direct id match (for older static-only episodes)
            // 2) Match by episode number parsed from the title (e.g. "#15: ..." -> id "15")
            let staticEpisode = PODCAST_EPISODES.find(p => p.id === id) || null;

            if (!staticEpisode) {
              const match = dbEpisode.title.match(/#(\d+)/);
              if (match) {
                const episodeNumberId = match[1];
                staticEpisode = PODCAST_EPISODES.find(p => p.id === episodeNumberId) || null;
              }
            }

            const merged: PodcastEpisode = {
              ...(staticEpisode || dbEpisode),
              ...dbEpisode,
              videoUrl: dbEpisode.videoUrl || staticEpisode?.videoUrl,
              imageUrl: dbEpisode.imageUrl || staticEpisode?.imageUrl,
              duration: dbEpisode.duration || staticEpisode?.duration || '',
              platformLinks: {
                spotify: dbEpisode.platformLinks.spotify || staticEpisode?.platformLinks.spotify,
                youtube: dbEpisode.platformLinks.youtube || staticEpisode?.platformLinks.youtube,
                apple: dbEpisode.platformLinks.apple || staticEpisode?.platformLinks.apple,
              },
            };

            setEpisode(merged);
          }
        } catch {
          // Fallback to existing episode state
        }
      };

      loadEpisode();
    }, [id]);

    if (!episode) return <div className="pt-32 text-center">Episode not found</div>;

    const localizedDescription = episode.summaries?.[lang] || episode.description;

    const spotifyEpisodeId = episode.platformLinks.spotify
      ? episode.platformLinks.spotify.split('/episode/')[1]?.split('?')[0] || null
      : null;

    const relatedEpisodes = PODCAST_EPISODES
      .filter(ep => ep.id !== episode.id && ep.tags && episode.tags && ep.tags.some(tag => episode.tags!.includes(tag)))
      .slice(0, 3);

    return (
        <div className="pt-20 min-h-screen">
            <SEOHead 
              title={episode.title}
              description={localizedDescription}
              episodeTitle={episode.title}
              episodeDescription={localizedDescription}
              episodeDuration={episode.duration}
              episodeImage={episode.imageUrl}
              publishedTime={episode.date}
            />
            <div className="bg-iconic-black text-white py-16 sm:py-24 relative overflow-hidden z-20">
                 <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-iconic-pink/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                 <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
                    <ScrollReveal>
                        <span className="text-iconic-pink font-bold tracking-widest uppercase text-xs sm:text-sm mb-3 sm:mb-4 block">{episode.date}</span>
                        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-black mb-6 sm:mb-8 leading-tight px-2">{episode.title}</h1>
                    </ScrollReveal>
                 </div>
            </div>
            
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 -mt-8 sm:-mt-16 relative z-30">
                {episode.videoUrl && (
                    <ScrollReveal>
                        <LazyYouTubePlayer videoId={episode.videoUrl} title={episode.title} />
                    </ScrollReveal>
                )}

                {spotifyEpisodeId && (
                  <ScrollReveal delay={100}>
                    <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-lg mb-12">
                         <iframe 
                            style={{borderRadius: '12px'}} 
                            src={`https://open.spotify.com/embed/episode/${spotifyEpisodeId}?utm_source=generator&theme=0`}
                            width="100%" 
                            height="152" 
                            frameBorder="0" 
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                            loading="lazy"
                            title={`Spotify Player - ${episode.title}`}
                         ></iframe>
                    </div>
                  </ScrollReveal>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="md:col-span-2">
                        <ScrollReveal delay={200}>
                            <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-4 sm:mb-6 text-iconic-black">{t.episode_about_title}</h3>
                            <div className="prose prose-lg text-gray-600 leading-relaxed mb-4">
                                <p className={`font-medium text-black ${isDescriptionExpanded ? '' : 'line-clamp-4'}`}>
                                  {localizedDescription}
                                </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsDescriptionExpanded(prev => !prev)}
                              className="inline-flex items-center text-sm font-semibold text-iconic-pink hover:text-pink-700 mb-4"
                            >
                              <span className="mr-1">
                                {isDescriptionExpanded
                                  ? (lang === 'cs-CZ' ? 'Zobrazit méně' : 'Show less')
                                  : (lang === 'cs-CZ' ? 'Zobrazit více' : 'Show more')}
                              </span>
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${isDescriptionExpanded ? 'rotate-180' : ''}`}
                              />
                            </button>
                            <div className="prose prose-lg text-gray-600 leading-relaxed mb-6">
                              <p>{t.episode_description_suffix}</p>
                            </div>
                            
                            {/* Share & Like buttons */}
                            <div className="mb-8">
                                <ShareButtons episodeId={episode.id} title={episode.title} />
                            </div>
                        </ScrollReveal>
                        
                        {/* Comments section */}
                        <ScrollReveal delay={300}>
                            <Comments episodeId={episode.id} />
                        </ScrollReveal>
                        {/* Related episodes */}
                        {relatedEpisodes.length > 0 && (
                          <ScrollReveal delay={400}>
                            <div className="mt-10 border-t border-gray-200 pt-6">
                              <h3 className="text-lg sm:text-xl font-serif font-bold mb-4 text-iconic-black">
                                {lang === 'cs-CZ' ? 'Související epizody' : lang === 'es-MX' ? 'Episodios relacionados' : 'Related episodes'}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {relatedEpisodes.map(rel => {
                                  const relTranslatedSummary = rel.summaries?.[lang];
                                  const relShowHelperSummary = lang !== 'cs-CZ' && relTranslatedSummary;
                                  return (
                                    <Link
                                      key={rel.id}
                                      to={`/episodes/${rel.id}`}
                                      className="group block bg-white rounded-xl border border-gray-200 p-3 hover:border-iconic-pink hover:shadow-md transition-all"
                                      title={relShowHelperSummary || undefined}
                                    >
                                      <div className="aspect-video rounded-lg overflow-hidden mb-2">
                                        <img src={rel.imageUrl} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                                      </div>
                                      <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">{rel.date}</div>
                                      <div className="text-sm font-semibold text-iconic-black line-clamp-2 group-hover:text-iconic-pink">
                                        {rel.title}
                                      </div>
                                      {relShowHelperSummary && (
                                        <div className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                                          {relTranslatedSummary}
                                        </div>
                                      )}
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          </ScrollReveal>
                        )}
                    </div>
                    <div>
                         <ScrollReveal delay={300}>
                             <div className="bg-[#F9F9F9] p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 lg:sticky lg:top-32">
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

// ============================================================================
// CONTACT PAGE
// ============================================================================
const ContactPage: React.FC = () => {
    const { t, lang } = useLanguage();
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        const formData = new FormData(e.target as HTMLFormElement);
        
        try {
            const { error: saveError } = await saveLead({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string || undefined,
                interest: formData.get('message') as string,
                source: 'contact_form',
                notes: 'Submitted via Website Contact Page',
                tags: ['Web Inquiry']
            });
            
            if (saveError) throw saveError;
            setSubmitted(true);
        } catch (err) {
            logError(createAppError(err, 'UNKNOWN_ERROR', { action: 'contactFormSubmit' }));
            setError(
              lang === 'cs-CZ'
                ? 'Něco se pokazilo. Zkuste to prosím znovu.'
                : lang === 'es-MX'
                ? 'Algo salió mal. Inténtalo de nuevo.'
                : 'Something went wrong. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
          className="pt-32 pb-24 min-h-screen relative overflow-hidden"
          role="main"
          aria-labelledby="contact-heading"
        >
             {/* Aurora Background Effect - same as Episodes section */}
             <div className="absolute inset-0 -z-10">
                 {/* Animated gradient base - pink to purple only */}
                 <div className="absolute inset-0 bg-gradient-to-br from-pink-100/70 via-fuchsia-50/50 to-purple-100/60 animate-gradient-slow bg-[length:400%_400%]"></div>
                 
                 {/* Layer 1: Large slow-moving base blobs */}
                 <div className="absolute -top-20 -left-20 w-[800px] h-[800px] bg-gradient-to-br from-pink-300/50 to-rose-200/40 rounded-full blur-[150px] animate-blob"></div>
                 <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-fuchsia-300/45 to-pink-200/35 rounded-full blur-[140px] animate-blob animation-delay-2000"></div>
                 <div className="absolute bottom-0 -left-20 w-[750px] h-[750px] bg-gradient-to-tr from-violet-300/45 to-purple-200/35 rounded-full blur-[160px] animate-blob animation-delay-4000"></div>
                 <div className="absolute -bottom-20 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-rose-300/40 to-pink-200/30 rounded-full blur-[140px] animate-blob" style={{animationDelay: '1s'}}></div>
                 
                 {/* Layer 2: Medium mixing blobs */}
                 <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gradient-to-r from-fuchsia-300/40 to-pink-300/30 rounded-full blur-[100px] animate-blob" style={{animationDelay: '0.5s'}}></div>
                 <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-gradient-to-l from-purple-300/35 to-violet-200/25 rounded-full blur-[90px] animate-blob" style={{animationDelay: '2.5s'}}></div>
                 <div className="absolute bottom-1/3 left-1/4 w-[480px] h-[480px] bg-gradient-to-t from-pink-300/35 to-rose-200/25 rounded-full blur-[95px] animate-blob" style={{animationDelay: '4.5s'}}></div>
                 <div className="absolute bottom-1/4 right-1/3 w-[520px] h-[520px] bg-gradient-to-b from-fuchsia-200/30 to-pink-200/20 rounded-full blur-[100px] animate-blob" style={{animationDelay: '1.5s'}}></div>
                 
                 {/* Layer 3: Smaller accent blobs for color mixing */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-pink-400/35 to-violet-300/25 rounded-full blur-[80px] animate-blob" style={{animationDelay: '3s'}}></div>
                 <div className="absolute top-1/6 left-1/2 w-[350px] h-[350px] bg-gradient-to-bl from-fuchsia-400/30 to-purple-300/20 rounded-full blur-[70px] animate-blob" style={{animationDelay: '5.5s'}}></div>
                 <div className="absolute top-2/3 left-1/6 w-[380px] h-[380px] bg-gradient-to-tr from-rose-400/30 to-fuchsia-300/20 rounded-full blur-[75px] animate-blob" style={{animationDelay: '6s'}}></div>
                 <div className="absolute top-1/2 right-1/6 w-[360px] h-[360px] bg-gradient-to-tl from-purple-300/30 to-violet-200/20 rounded-full blur-[70px] animate-blob" style={{animationDelay: '3.5s'}}></div>
                 <div className="absolute bottom-1/6 left-1/2 w-[320px] h-[320px] bg-gradient-to-r from-purple-300/30 to-pink-200/20 rounded-full blur-[65px] animate-blob" style={{animationDelay: '7s'}}></div>
                 
                 {/* Layer 4: Tiny floating accent dots */}
                 <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] bg-pink-400/40 rounded-full blur-[50px] animate-blob" style={{animationDelay: '2s'}}></div>
                 <div className="absolute top-3/4 right-1/4 w-[180px] h-[180px] bg-fuchsia-400/35 rounded-full blur-[45px] animate-blob" style={{animationDelay: '4s'}}></div>
                 <div className="absolute top-1/2 left-3/4 w-[220px] h-[220px] bg-violet-400/35 rounded-full blur-[55px] animate-blob" style={{animationDelay: '6.5s'}}></div>
                 <div className="absolute bottom-1/3 left-1/3 w-[190px] h-[190px] bg-rose-400/35 rounded-full blur-[48px] animate-blob" style={{animationDelay: '1.2s'}}></div>
                 <div className="absolute top-1/3 right-1/3 w-[170px] h-[170px] bg-purple-400/30 rounded-full blur-[42px] animate-blob" style={{animationDelay: '5s'}}></div>
                 
                 {/* Soft white overlay for readability (same as Episodes) */}
                 <div className="absolute inset-0 bg-white/15"></div>
             </div>
             
             <SEOHead title={t.contact_title} description={t.contact_subtitle} />
             <div className="max-w-4xl mx-auto px-4 relative z-10">
                 <div className="text-center mb-16">
                     <ScrollReveal>
                         <h1 id="contact-heading" className="text-4xl md:text-6xl font-serif font-black text-iconic-black mb-4">{t.contact_title}</h1>
                         <p className="text-gray-600 text-xl font-light">{t.contact_subtitle}</p>
                     </ScrollReveal>
                 </div>

                 <ScrollReveal delay={200}>
                    <div className="relative rounded-3xl shadow-2xl overflow-hidden">
                        {/* Inner animated background behind contact card */}
                        <div className="absolute inset-0 -z-10">
                            <div
                              className="absolute inset-0 bg-gradient-to-br from-pink-100/80 via-fuchsia-100/60 to-purple-100/80 animate-gradient-slow bg-[length:300%_300%] blur-sm opacity-5"
                            ></div>
                            <div className="absolute -top-10 -left-10 w-[400px] h-[400px] bg-gradient-to-br from-pink-300/60 to-rose-200/50 rounded-full blur-[90px] animate-blob"></div>
                            <div className="absolute top-0 right-0 w-[360px] h-[360px] bg-gradient-to-bl from-fuchsia-300/55 to-pink-200/45 rounded-full blur-[80px] animate-blob animation-delay-2000"></div>
                            <div className="absolute bottom-0 left-1/4 w-[380px] h-[380px] bg-gradient-to-tr from-violet-300/55 to-purple-200/45 rounded-full blur-[85px] animate-blob animation-delay-4000"></div>
                            <div className="absolute inset-0 bg-white/30"></div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-0 bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden relative z-10">
                        <div className="p-12 bg-iconic-black text-white flex flex-col justify-center relative overflow-hidden">
                             <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-iconic-pink/20 rounded-full blur-[100px]"></div>
                             
                             <h3 className="text-2xl font-serif font-bold mb-8 relative z-10">{t.contact_info_title}</h3>
                             <div className="space-y-8 relative z-10">
                                <div className="flex items-center gap-4 group">
                                    <a
                                      href="mailto:hello@iconic-podcast.com"
                                      className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-iconic-pink transition-colors cursor-pointer"
                                    >
                                       <Mail className="text-white" />
                                    </a>
                                    <div>
                                        <div className="font-bold text-sm text-gray-400 uppercase tracking-widest">{t.contact_email}</div>
                                        <div className="text-lg">hello@iconic-podcast.com</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <a
                                      href="tel:+420775152006"
                                      className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-iconic-pink transition-colors cursor-pointer"
                                    >
                                       <Phone className="text-white" />
                                    </a>
                                    <div>
                                        <div className="font-bold text-sm text-gray-400 uppercase tracking-widest">{t.contact_phone}</div>
                                        <div className="text-lg">+420 775 152 006</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <a
                                      href="https://www.instagram.com/zuzzimentor"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-iconic-pink transition-colors cursor-pointer"
                                    >
                                       <Instagram className="text-white" />
                                    </a>
                                    <div>
                                        <div className="font-bold text-sm text-gray-400 uppercase tracking-widest">{t.contact_instagram}</div>
                                        <div className="text-lg">@zuzzimentor</div>
                                    </div>
                                </div>
                            </div>
                         </div>

                         <div className="p-12 bg-white/95">
                             {submitted ? (
                                 <div
                                   className="h-full flex flex-col items-center justify-center text-center animate-fade-in-up"
                                   role="status"
                                   aria-live="polite"
                                 >
                                     <CheckCircle size={64} className="text-green-500 mb-6" />
                                     <h3 className="text-3xl font-serif font-bold mb-4">{t.contact_success_title}</h3>
                                     <p className="text-gray-600">{t.contact_success_msg}</p>
                                 </div>
                             ) : (
                                 <form onSubmit={handleSubmit} className="space-y-6">
                                     {error && (
                                       <div
                                         id="contact-error"
                                         role="alert"
                                         aria-live="polite"
                                         className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm"
                                       >
                                         {error}
                                       </div>
                                     )}
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
                                     <button
                                       type="submit"
                                       disabled={isSubmitting}
                                       aria-busy={isSubmitting}
                                       aria-describedby={error ? 'contact-error' : undefined}
                                       className="w-full bg-iconic-pink text-white py-4 rounded-lg font-bold text-lg hover:bg-iconic-black transition-colors disabled:opacity-50"
                                     >
                                       {isSubmitting ? '...' : t.form_submit}
                                     </button>
                                 </form>
                             )}
                         </div>
                         </div>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
};

// ============================================================================
// ADMIN DASHBOARD (Protected by AuthGuard - Comment 2)
// ============================================================================
const AdminDashboard: React.FC = () => {
    const { t, lang } = useLanguage();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [filterTag, setFilterTag] = useState<string>('All');
    const [filterSource, setFilterSource] = useState<string>('All');
    const [newTagInput, setNewTagInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const refreshData = async () => {
        setIsLoading(true);
        try {
            const { data } = await getLeads();
            setLeads(data);
        } catch (error) {
            logError(createAppError(error, 'SUPABASE_ERROR', { action: 'getLeads' }));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const allTags = Array.from(new Set(leads.flatMap(l => l.tags || [])));
    const allSources = Array.from(new Set(leads.map(l => l.source)));

    const filteredLeads = leads.filter(l => {
        const matchesTag = filterTag === 'All' || (l.tags && l.tags.includes(filterTag));
        const matchesSource = filterSource === 'All' || l.source === filterSource;
        return matchesTag && matchesSource;
    });

    const localT = {
      'cs-CZ': {
        subtitle: 'Spravujte své kontakty a vztahy',
        filter_source_all: 'Všechny zdroje',
        filter_tag_all: 'Všechny tagy',
        export_csv: 'Export CSV',
        table_name: 'Jméno',
        table_contact: 'Kontakt',
        table_source: 'Zdroj',
        table_tags: 'Tagy',
        table_date: 'Datum',
        table_status: 'Stav',
        status_new: 'Nový',
        status_contacted: 'Kontaktováno',
        status_converted: 'Přeměněno',
        status_archived: 'Archivováno',
        label_status: 'Stav',
        label_source: 'Zdroj',
        label_tags: 'Tagy',
        label_notes: 'Poznámky',
        placeholder_new_tag: 'Přidat nový tag...',
        confirm_delete: 'Opravdu chcete tento kontakt smazat?',
        btn_save: 'Uložit',
      },
      'en-US': {
        subtitle: 'Manage your contacts and relationships',
        filter_source_all: 'All Sources',
        filter_tag_all: 'All Tags',
        export_csv: 'Export CSV',
        table_name: 'Name',
        table_contact: 'Contact',
        table_source: 'Source',
        table_tags: 'Tags',
        table_date: 'Date',
        table_status: 'Status',
        status_new: 'New',
        status_contacted: 'Contacted',
        status_converted: 'Converted',
        status_archived: 'Archived',
        label_status: 'Status',
        label_source: 'Source',
        label_tags: 'Tags',
        label_notes: 'Notes',
        placeholder_new_tag: 'Add new tag...',
        confirm_delete: 'Are you sure you want to delete this lead?',
        btn_save: 'Save',
      },
      'es-MX': {
        subtitle: 'Gestiona tus contactos y relaciones',
        filter_source_all: 'Todas las fuentes',
        filter_tag_all: 'Todos los tags',
        export_csv: 'Exportar CSV',
        table_name: 'Nombre',
        table_contact: 'Contacto',
        table_source: 'Fuente',
        table_tags: 'Tags',
        table_date: 'Fecha',
        table_status: 'Estatus',
        status_new: 'Nuevo',
        status_contacted: 'Contactado',
        status_converted: 'Convertido',
        status_archived: 'Archivado',
        label_status: 'Estatus',
        label_source: 'Fuente',
        label_tags: 'Tags',
        label_notes: 'Notas',
        placeholder_new_tag: 'Agregar nuevo tag...',
        confirm_delete: '¿Seguro que quieres eliminar este lead?',
        btn_save: 'Guardar',
      },
    }[lang] || {
      subtitle: 'Manage your contacts and relationships',
      filter_source_all: 'All Sources',
      filter_tag_all: 'All Tags',
      export_csv: 'Export CSV',
      table_name: 'Name',
      table_contact: 'Contact',
      table_source: 'Source',
      table_tags: 'Tags',
      table_date: 'Date',
      table_status: 'Status',
      status_new: 'New',
      status_contacted: 'Contacted',
      status_converted: 'Converted',
      status_archived: 'Archived',
      label_status: 'Status',
      label_source: 'Source',
      label_tags: 'Tags',
      label_notes: 'Notes',
      placeholder_new_tag: 'Add new tag...',
      confirm_delete: 'Are you sure you want to delete this lead?',
      btn_save: 'Save',
    };

    const downloadCSV = () => {
        const headers = [
          'ID',
          localT.table_name,
          'Email',
          'Phone',
          'Interest',
          localT.table_source,
          localT.table_status,
          localT.label_notes,
          localT.label_tags,
          'Campaign',
          localT.table_date,
        ];
        const rows = filteredLeads.map(l => [
            l.id, l.name, l.email, l.phone || '', l.interest, l.source, l.status, l.notes || '', (l.tags || []).join(';'), l.campaign || '', l.date
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

    const handleSaveLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLead) return;
        
        try {
            await updateLead(selectedLead.id, {
                notes: selectedLead.notes,
                status: selectedLead.status,
                tags: selectedLead.tags
            });
            await refreshData();
            setSelectedLead(null);
        } catch (error) {
            logError(createAppError(error, 'SUPABASE_ERROR', { action: 'updateLead' }));
        }
    };

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTagInput.trim() && selectedLead) {
            const currentTags = selectedLead.tags || [];
            if (!currentTags.includes(newTagInput.trim())) {
                 setSelectedLead({ ...selectedLead, tags: [...currentTags, newTagInput.trim()] });
            }
            setNewTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        if (selectedLead) {
             setSelectedLead({ ...selectedLead, tags: (selectedLead.tags || []).filter(t => t !== tagToRemove) });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm(localT.confirm_delete)) {
            try {
                await deleteLead(id);
                await refreshData();
                if (selectedLead?.id === id) setSelectedLead(null);
            } catch (error) {
                logError(createAppError(error, 'SUPABASE_ERROR', { action: 'deleteLead' }));
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-32 px-4 pb-12 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                         <h1 className="text-3xl font-serif font-bold text-iconic-black">{t.crm_title}</h1>
                         <p className="text-gray-500">{localT.subtitle}</p>
                    </div>
                    
                    <div className="flex gap-4 items-center flex-wrap">
                        {/* Analytics Dashboard Link */}
                        <Link 
                            to="/analytics" 
                            className="bg-gradient-to-r from-iconic-pink to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:shadow-lg transition-shadow"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                            Analytics
                        </Link>
                        {/* Podcast tools shortcut */}
                        <Link
                            to="/crm/podcast-tools"
                            className="bg-white border border-iconic-pink/40 text-iconic-pink px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-iconic-pink hover:text-white transition-colors"
                        >
                            Podcast tools
                        </Link>
                        {/* Source Filter (Comment 9) */}
                        <div className="relative">
                            <select 
                                value={filterSource}
                                onChange={(e) => setFilterSource(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none cursor-pointer text-sm"
                            >
                                <option value="All">{localT.filter_source_all}</option>
                                {allSources.map(source => (
                                    <option key={source} value={source}>{source}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative">
                            <select 
                                value={filterTag}
                                onChange={(e) => setFilterTag(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none cursor-pointer"
                            >
                                <option value="All">{localT.filter_tag_all}</option>
                                {allTags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <Tag size={16} />
                            </div>
                        </div>
                        <button onClick={downloadCSV} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
                            <Download size={18} /> {localT.export_csv}
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-4 border-iconic-pink border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4">{localT.table_name}</th>
                                        <th className="p-4">{localT.table_contact}</th>
                                        <th className="p-4">{localT.table_source}</th>
                                        <th className="p-4">{localT.table_tags}</th>
                                        <th className="p-4">{localT.table_date}</th>
                                        <th className="p-4">{localT.table_status}</th>
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
                )}
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
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{localT.label_status}</label>
                                    <select value={selectedLead.status} onChange={(e) => setSelectedLead({...selectedLead, status: e.target.value as any})} className="w-full p-2 border border-gray-200 rounded-lg">
                                        <option value="new">{localT.status_new}</option>
                                        <option value="contacted">{localT.status_contacted}</option>
                                        <option value="converted">{localT.status_converted}</option>
                                        <option value="archived">{localT.status_archived}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{localT.label_source}</label>
                                    <input disabled value={selectedLead.source} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500" />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{localT.label_tags}</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {(selectedLead.tags || []).map(tag => (
                                        <span key={tag} className="bg-iconic-pink/10 text-iconic-pink text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                            {tag} <button type="button" onClick={() => handleRemoveTag(tag)}><X size={12} /></button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={newTagInput} onChange={(e) => setNewTagInput(e.target.value)} placeholder={localT.placeholder_new_tag} className="flex-1 p-2 border border-gray-200 rounded-lg text-sm" onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e)} />
                                    <button type="button" onClick={handleAddTag} className="p-2 bg-gray-100 rounded-lg"><Plus size={18} /></button>
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{localT.label_notes}</label>
                                <textarea value={selectedLead.notes || ''} onChange={(e) => setSelectedLead({...selectedLead, notes: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl h-32 text-sm"></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="submit" className="px-6 py-2 bg-iconic-black text-white font-medium rounded-lg hover:bg-iconic-pink transition-colors flex items-center gap-2"><Save size={18} /> {localT.btn_save}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
function AppContent() {
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  // Initialize analytics tracking
  useEffect(() => {
    initAnalytics();
  }, []);

  // Track page views on route change
  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);

  useEffect(() => {
    const newsletterStatus = localStorage.getItem('iconic_newsletter_status');
    if (newsletterStatus !== 'dismissed' && newsletterStatus !== 'subscribed') {
      const timer = setTimeout(() => setIsBannerOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Exit-intent logic for guest modal (only when intro is not showing)
  useEffect(() => {
    const guestSignedUp = localStorage.getItem('iconic_guest_signed_up');
    const guestDismissed = sessionStorage.getItem('iconic_guest_dismissed');
    if (guestSignedUp || guestDismissed) return;

    const handleMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 0) {
        setIsGuestModalOpen(true);
        window.removeEventListener('mouseout', handleMouseLeave);
      }
    };

    window.addEventListener('mouseout', handleMouseLeave);
    return () => {
      window.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden bg-white">
      <AnimatedBackground />
      <CursorSpotlight />
      <NewsletterToast isOpen={isBannerOpen} onClose={() => setIsBannerOpen(false)} />
      {isGuestModalOpen && <GuestInvitationModal onClose={() => setIsGuestModalOpen(false)} />}
      <Header isBannerOpen={isBannerOpen} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<><SEOHead /><Hero /><EpisodeList /></>} />
          <Route path="/episodes" element={<EpisodeList />} />
          <Route path="/episodes/:id" element={<EpisodeDetail />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/about" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/profile"
            element={
              <AuthGuard fallbackPath="/login">
                <ProfilePage />
              </AuthGuard>
            }
          />
          {/* Protected CRM route (Comment 2) */}
          <Route path="/crm" element={
            <AuthGuard requireAdmin fallbackPath="/">
              <AdminDashboard />
            </AuthGuard>
          } />
          {/* Podcast tools workspace - admin only */}
          <Route path="/crm/podcast-tools" element={
            <AuthGuard requireAdmin fallbackPath="/">
              <PodcastToolsPage />
            </AuthGuard>
          } />
          <Route path="/crm/podcast-tools/guests/:id" element={
            <AuthGuard requireAdmin fallbackPath="/">
              <PodcastGuestDetailPage />
            </AuthGuard>
          } />
          <Route path="/crm/podcast-tools/episodes/:id" element={
            <AuthGuard requireAdmin fallbackPath="/">
              <EpisodePlanDetailPage />
            </AuthGuard>
          } />
          {/* Legacy podcast tools path - redirect to new tools page */}
          <Route path="/crm/podcast" element={<Navigate to="/crm/podcast-tools" replace />} />
          
          {/* Analytics Dashboard - Admin only */}
          <Route path="/analytics" element={
            <AuthGuard requireAdmin fallbackPath="/">
              <AnalyticsDashboard />
            </AuthGuard>
          } />
          
          {/* Campaign Landing Pages (Comment 9) */}
          <Route path="/youtube" element={<YouTubeLandingPage />} />
          <Route path="/instagram" element={<InstagramLandingPage />} />
          <Route path="/social" element={<SocialLandingPage />} />
        </Routes>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
