import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

interface EpisodeRow {
  id: string;
  title: string;
  description: string;
  published_at: string;
  audio_url?: string | null;
  image_url?: string | null;
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PODCAST_RSS_URL = process.env.PODCAST_RSS_URL;

const createServiceClient = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase service credentials are not configured');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
};

const stripCdata = (value: string | null): string | null => {
  if (!value) return value;
  // Remove leading/trailing CDATA markers if present
  return value
    .replace(/^<!\[CDATA\[/i, '')
    .replace(/\]\]>$/i, '')
    .trim();
};

const parseRss = (xml: string): EpisodeRow[] => {
  const items: EpisodeRow[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>/g;
  const matches = xml.match(itemRegex) || [];

  for (const rawItem of matches) {
    const getTag = (tag: string): string | null => {
      const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i');
      const m = rawItem.match(re);
      return m ? m[1].trim() : null;
    };

    const getAttr = (tag: string, attr: string): string | null => {
      const re = new RegExp(`<${tag}[^>]*${attr}="([^"]+)"[^>]*>`, 'i');
      const m = rawItem.match(re);
      return m ? m[1].trim() : null;
    };

    const guid = stripCdata(getTag('guid') || getTag('id'));
    const title = stripCdata(getTag('title'));
    const description = stripCdata(getTag('description'));
    const pubDate = getTag('pubDate') || getTag('published');
    const enclosureUrl = getAttr('enclosure', 'url');
    const itunesImage = getAttr('itunes:image', 'href');

    if (!guid || !title || !description || !pubDate) continue;

    const publishedAt = new Date(pubDate).toISOString();

    items.push({
      id: guid,
      title,
      description,
      published_at: publishedAt,
      audio_url: enclosureUrl || null,
      image_url: itunesImage || null
    });
  }

  return items;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!PODCAST_RSS_URL) {
    return res.status(500).json({ error: 'PODCAST_RSS_URL is not configured' });
  }

  try {
    const response = await fetch(PODCAST_RSS_URL);
    if (!response.ok) {
      return res.status(502).json({ error: `Failed to fetch RSS: ${response.status}` });
    }

    const xml = await response.text();
    const episodes = parseRss(xml);

    if (!episodes.length) {
      return res.status(200).json({ message: 'No episodes found in RSS feed', count: 0 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from('episodes')
      .upsert(episodes, { onConflict: 'id' });

    if (error) {
      console.error('Supabase upsert error:', error);
      return res.status(500).json({ error: 'Failed to upsert episodes' });
    }

    return res.status(200).json({ message: 'Episodes synced', count: episodes.length });
  } catch (err) {
    console.error('Sync error:', err);
    return res.status(500).json({ error: 'Unexpected error during sync' });
  }
}
