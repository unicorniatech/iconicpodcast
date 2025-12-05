-- Migration 005: Podcast Tools (Guests, Episode Plans, Calendar)
-- NOTE: Run this in your Supabase SQL editor before using the Podcast Tools CRM section.

-- Guests invited or considered for episodes
CREATE TABLE IF NOT EXISTS podcast_guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT,
  instagram_handle TEXT,
  notes TEXT,
  expertise TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_podcast_guests_name ON podcast_guests(full_name);

-- Episode planning workspace (one row per episode idea/recording)
CREATE TABLE IF NOT EXISTS podcast_episode_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'planned', 'recorded', 'published')),
  planned_date DATE,
  recording_link TEXT,
  outline TEXT,
  resources JSONB DEFAULT '[]', -- array of { label, url }
  guest_id UUID REFERENCES podcast_guests(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_podcast_episode_plans_status ON podcast_episode_plans(status);
CREATE INDEX IF NOT EXISTS idx_podcast_episode_plans_planned_date ON podcast_episode_plans(planned_date);

-- Basic RLS (admins only)
ALTER TABLE podcast_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_episode_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage podcast_guests" ON podcast_guests FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins manage podcast_episode_plans" ON podcast_episode_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- updated_at triggers
CREATE TRIGGER update_podcast_guests_updated_at
  BEFORE UPDATE ON podcast_guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_podcast_episode_plans_updated_at
  BEFORE UPDATE ON podcast_episode_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
