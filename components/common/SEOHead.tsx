/**
 * SEO Head Component
 * 
 * Manages page metadata using React 19's native document.title and useEffect.
 * For full SSR/SSG SEO, consider migrating to Next.js or Remix.
 */

import React, { useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { SITE_URL } from '../../constants';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'podcast';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  // Podcast-specific
  episodeTitle?: string;
  episodeDescription?: string;
  episodeDuration?: string;
  episodeImage?: string;
  episodeUrl?: string;
}

const SITE_NAME = 'ICONIC Podcast by Zuzzi Mentor';
const DEFAULT_TITLE = 'ICONIC Podcast | Buď svá, buď ikonická';
const DEFAULT_DESCRIPTION = 'Podcast pro ženy, které chtějí víc. Business, mindset a lifestyle bez kompromisů. Zuzana Husarová ti ukáže, jak být svá a ikonická.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`; // Replace with actual OG image
const TWITTER_HANDLE = '@zuzzimentor';

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url = SITE_URL,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Zuzana Husarova',
  episodeTitle,
  episodeDescription,
  episodeDuration,
  episodeImage,
  episodeUrl
}) => {
  const { lang } = useLanguage();
  const htmlLang = lang || 'cs-CZ';
  const ogLocale = htmlLang === 'cs-CZ' ? 'cs_CZ' : htmlLang === 'es-MX' ? 'es_MX' : 'en_US';

  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;
  const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  // Generate podcast episode structured data
  const episodeStructuredData = episodeTitle ? {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode',
    'name': episodeTitle,
    'description': episodeDescription || description,
    'url': episodeUrl || fullUrl,
    'image': episodeImage || fullImage,
    'duration': episodeDuration,
    'partOfSeries': {
      '@type': 'PodcastSeries',
      'name': SITE_NAME,
      'url': SITE_URL
    },
    'author': {
      '@type': 'Person',
      'name': author
    }
  } : null;

  // Generate website structured data
  const websiteStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': SITE_NAME,
    'url': SITE_URL,
    'description': DEFAULT_DESCRIPTION,
    'author': {
      '@type': 'Person',
      'name': 'Zuzana Husarova',
      'url': 'https://www.instagram.com/zuzzimentor/'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'ICONIC',
      'logo': {
        '@type': 'ImageObject',
        'url': `${SITE_URL}/logo.png`
      }
    }
  };

  // Generate podcast series structured data
  const podcastStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'PodcastSeries',
    'name': SITE_NAME,
    'description': DEFAULT_DESCRIPTION,
    'url': SITE_URL,
    'image': DEFAULT_IMAGE,
    'author': {
      '@type': 'Person',
      'name': 'Zuzana Husarova'
    },
    'webFeed': [
      'https://open.spotify.com/show/5TNpvLzycWShFtP0uu39bE',
      'https://podcasts.apple.com/cz/podcast/iconic-podcast-by-zuzzi-mentor/id1831207868'
    ]
  };

  // Update document title, lang attribute, and meta tags using useEffect
  useEffect(() => {
    // Set html lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = htmlLang;
    }
    // Set title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta
    setMeta('description', description);
    setMeta('author', author);

    // Open Graph
    setMeta('og:type', type, true);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:image', fullImage, true);
    setMeta('og:url', fullUrl, true);
    setMeta('og:site_name', SITE_NAME, true);
    setMeta('og:locale', ogLocale, true);

    // Twitter
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', fullImage);
  }, [fullTitle, description, author, type, fullImage, fullUrl, htmlLang, ogLocale]);

  // This component doesn't render anything visible
  return null;
};

export default SEOHead;
