/**
 * Campaign Landing Pages
 * 
 * Dedicated landing pages for visitors from YouTube, Instagram, and other social channels.
 * Pre-fills the lead source based on the campaign and tracks UTM parameters.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Play, Sparkles, ArrowRight, Gift } from 'lucide-react';
import { saveLead } from '../services/storageService';
import type { LeadSource } from '../types/database';
import { logError, createAppError } from '../services/errorService';

interface LandingPageProps {
  source: LeadSource;
  title: string;
  subtitle: string;
  offer: string;
  offerDescription: string;
  ctaText: string;
  backgroundGradient?: string;
}

const LandingPageTemplate: React.FC<LandingPageProps> = ({
  source,
  title,
  subtitle,
  offer,
  offerDescription,
  ctaText,
  backgroundGradient = 'from-iconic-pink via-purple-900 to-iconic-black'
}) => {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract UTM parameters
  const campaign = searchParams.get('utm_campaign') || searchParams.get('campaign') || undefined;

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
        interest: offer,
        source,
        notes: `Landing page: ${source}, Campaign: ${campaign || 'direct'}`,
        tags: ['Landing Page', source.replace('_', ' ').toUpperCase()],
        campaign
      });

      if (saveError) {
        throw saveError;
      }

      setIsSubmitted(true);
    } catch (err) {
      const appError = createAppError(err, 'UNKNOWN_ERROR', { action: 'landingPageSubmit', source });
      logError(appError);
      setError('Něco se pokazilo. Zkuste to prosím znovu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundGradient} flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-iconic-pink/20 rounded-full blur-[100px]"></div>

      <div className="max-w-lg w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-4xl font-serif font-black text-white tracking-tight">
              I<span className="text-iconic-pink">|</span>CONIC
            </span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/50">
                <CheckCircle size={40} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Děkujeme! 🎉</h2>
              <p className="text-white/80 mb-6">
                Tvůj přístup je na cestě. Zkontroluj si email.
              </p>
              <Link 
                to="/episodes" 
                className="inline-flex items-center gap-2 text-iconic-pink font-bold hover:underline"
              >
                Prozkoumej epizody <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              {/* Offer Badge */}
              <div className="flex justify-center mb-6">
                <div className="bg-iconic-pink/20 text-iconic-pink px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-iconic-pink/30">
                  <Gift size={16} /> {offer}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white text-center mb-4 leading-tight">
                {title}
              </h1>
              <p className="text-white/80 text-center mb-8">
                {subtitle}
              </p>

              {/* Offer Description */}
              <div className="bg-white/5 rounded-xl p-4 mb-8 border border-white/10">
                <div className="flex items-start gap-3">
                  <Sparkles className="text-iconic-pink flex-shrink-0 mt-1" size={20} />
                  <p className="text-white/90 text-sm">{offerDescription}</p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <input
                    required
                    name="name"
                    type="text"
                    placeholder="Tvé jméno"
                    className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:bg-white/10 focus:border-iconic-pink transition-all"
                  />
                </div>
                <div>
                  <input
                    required
                    name="email"
                    type="email"
                    placeholder="Tvůj email"
                    className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:bg-white/10 focus:border-iconic-pink transition-all"
                  />
                </div>
                <div>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="Telefon (volitelné)"
                    className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:bg-white/10 focus:border-iconic-pink transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-iconic-pink to-purple-600 text-white font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(183,6,109,0.6)] hover:scale-[1.02] transition-all transform border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Odesílám...
                    </span>
                  ) : (
                    ctaText
                  )}
                </button>
              </form>

              {/* Trust indicators */}
              <p className="text-white/50 text-xs text-center mt-6">
                🔒 Tvé údaje jsou v bezpečí. Žádný spam.
              </p>
            </>
          )}
        </div>

        {/* Social proof */}
        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            Připoj se k 1000+ ženám, které už jsou součástí ICONIC komunity
          </p>
        </div>
      </div>
    </div>
  );
};

// YouTube Landing Page
export const YouTubeLandingPage: React.FC = () => (
  <LandingPageTemplate
    source="landing_youtube"
    title="Vítej z YouTube! 🎬"
    subtitle="Děkujeme, že sleduješ ICONIC Podcast. Máme pro tebe speciální dárek."
    offer="ZDARMA: Mini-kurz"
    offerDescription="Získej přístup k exkluzivnímu mini-kurzu '5 kroků k sebevědomému podnikání' - pouze pro naše YouTube diváky."
    ctaText="Chci mini-kurz zdarma"
    backgroundGradient="from-red-900 via-iconic-black to-iconic-black"
  />
);

// Instagram Landing Page
export const InstagramLandingPage: React.FC = () => (
  <LandingPageTemplate
    source="landing_instagram"
    title="Ahoj z Instagramu! 💖"
    subtitle="Ráda tě tu vidím. Připravila jsem pro tebe něco speciálního."
    offer="VIP Pozvánka"
    offerDescription="Získej VIP přístup k živým Q&A sessions a exkluzivním behind-the-scenes obsahům."
    ctaText="Chci VIP přístup"
    backgroundGradient="from-purple-900 via-pink-900 to-iconic-black"
  />
);

// Generic Social Landing Page
export const SocialLandingPage: React.FC = () => (
  <LandingPageTemplate
    source="landing_social"
    title="Buď svá, buď ikonická ✨"
    subtitle="Připoj se k ICONIC komunitě a získej přístup k exkluzivnímu obsahu."
    offer="Speciální nabídka"
    offerDescription="Newsletter s týdenní dávkou inspirace, tipy pro podnikání a pozvánky na exkluzivní akce."
    ctaText="Připojit se zdarma"
    backgroundGradient="from-iconic-pink via-purple-900 to-iconic-black"
  />
);

export default LandingPageTemplate;
