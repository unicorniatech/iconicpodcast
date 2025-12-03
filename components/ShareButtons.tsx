import React, { useState } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Link2, Check, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = supabase;
import { useLanguage } from '../contexts/LanguageContext';

interface ShareButtonsProps {
  episodeId: string;
  title: string;
  url?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ episodeId, title, url }) => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const shareUrl = url || `${window.location.origin}/episodes/${episodeId}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const t = {
    'cs-CZ': {
      share: 'Sdílet',
      copy_link: 'Kopírovat odkaz',
      copied: 'Zkopírováno!',
      like: 'Líbí se mi',
    },
    'en-US': {
      share: 'Share',
      copy_link: 'Copy link',
      copied: 'Copied!',
      like: 'Like',
    },
  }[lang] || {
    share: 'Share',
    copy_link: 'Copy link',
    copied: 'Copied!',
    like: 'Like',
  };

  // Track the last fetched episode to prevent duplicate fetches
  const lastFetchedEpisodeRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    // Only fetch if this is a new episode we haven't fetched yet
    if (lastFetchedEpisodeRef.current !== episodeId) {
      lastFetchedEpisodeRef.current = episodeId;
      fetchLikeStatus();
    }
  }, [episodeId]);

  const fetchLikeStatus = async () => {
    try {
      // Run both queries in parallel
      const countPromise = db
        .from('episode_likes')
        .select('*', { count: 'exact', head: true })
        .eq('episode_id', episodeId);
      
      const userLikedPromise = user 
        ? db
            .from('episode_likes')
            .select('id')
            .eq('episode_id', episodeId)
            .eq('user_id', user.id)
            .maybeSingle()
        : Promise.resolve({ data: null });

      const [countResult, userLikedResult] = await Promise.all([countPromise, userLikedPromise]);
      
      if (countResult.error) {
        console.log('Likes fetch error:', countResult.error.message);
        return;
      }
      
      setLikeCount(countResult.count || 0);
      setLiked(!!userLikedResult.data);
    } catch (err) {
      console.error('Like status fetch failed:', err);
    }
  };

  const handleLike = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      if (liked) {
        const { error } = await db
          .from('episode_likes')
          .delete()
          .eq('episode_id', episodeId)
          .eq('user_id', user.id);
        
        if (!error) {
          setLiked(false);
          setLikeCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        // Use upsert to handle 409 conflict (already liked)
        const { error } = await db.from('episode_likes').upsert({
          episode_id: episodeId,
          user_id: user.id,
        }, { onConflict: 'episode_id,user_id' });
        
        if (!error) {
          setLiked(true);
          setLikeCount((prev) => prev + 1);
        } else if (error.code === '23505') {
          // Already liked - just update UI state
          setLiked(true);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'hover:bg-black hover:text-white',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-blue-600 hover:text-white',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-blue-700 hover:text-white',
    },
    {
      name: 'WhatsApp',
      icon: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:bg-green-500 hover:text-white',
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
      {/* Like button */}
      <button
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${
          liked
            ? 'bg-iconic-pink text-white border-iconic-pink'
            : 'bg-white text-gray-600 border-gray-200 hover:border-iconic-pink hover:text-iconic-pink'
        }`}
      >
        <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
        <span className="text-sm font-medium">
          {likeCount > 0 ? likeCount : ''} {t.like}
        </span>
      </button>

      {/* Share buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-400 mr-1 hidden sm:inline-flex items-center">
          <Share2 size={16} className="mr-1" />
          {t.share}:
        </span>
        
        <div className="flex items-center gap-2">
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2.5 sm:p-2 rounded-full border border-gray-200 text-gray-500 transition-all ${link.color}`}
              title={link.name}
            >
              <link.icon size={20} className="sm:w-[18px] sm:h-[18px]" />
            </a>
          ))}

          {/* Copy link button */}
          <button
            onClick={handleCopyLink}
            className={`p-2.5 sm:p-2 rounded-full border transition-all ${
              copied
                ? 'bg-green-500 text-white border-green-500'
                : 'border-gray-200 text-gray-500 hover:bg-gray-100'
            }`}
            title={t.copy_link}
          >
            {copied ? <Check size={20} className="sm:w-[18px] sm:h-[18px]" /> : <Link2 size={20} className="sm:w-[18px] sm:h-[18px]" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareButtons;
