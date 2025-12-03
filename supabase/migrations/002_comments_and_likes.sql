-- ICONIC Podcast - Comments & Likes Schema
-- Run this migration in your Supabase SQL editor AFTER 001_initial_schema.sql

-- ============================================================================
-- USER PROFILES TABLE
-- Public profile info for users (display name, avatar)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_display_name ON user_profiles(display_name);

-- ============================================================================
-- COMMENTS TABLE
-- User comments on episodes
-- ============================================================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_id TEXT NOT NULL, -- matches episode id from constants.ts
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- for replies
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false, -- for moderation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_episode_id ON comments(episode_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- ============================================================================
-- COMMENT LIKES TABLE
-- Likes on comments
-- ============================================================================
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comment_id, user_id) -- one like per user per comment
);

CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);

-- ============================================================================
-- EPISODE LIKES TABLE
-- Likes on episodes themselves
-- ============================================================================
CREATE TABLE IF NOT EXISTS episode_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(episode_id, user_id) -- one like per user per episode
);

CREATE INDEX idx_episode_likes_episode_id ON episode_likes(episode_id);
CREATE INDEX idx_episode_likes_user_id ON episode_likes(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_likes ENABLE ROW LEVEL SECURITY;

-- User Profiles: Anyone can read, users can update own
CREATE POLICY "Anyone can view profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Comments: Anyone can read non-hidden, authenticated users can create, users can edit/delete own
CREATE POLICY "Anyone can view visible comments" ON comments FOR SELECT USING (is_hidden = false);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all comments" ON comments FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Comment Likes: Anyone can read, authenticated users can create/delete own
CREATE POLICY "Anyone can view comment likes" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like comments" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own likes" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Episode Likes: Anyone can read, authenticated users can create/delete own
CREATE POLICY "Anyone can view episode likes" ON episode_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like episodes" ON episode_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own episode likes" ON episode_likes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get comment count for an episode
CREATE OR REPLACE FUNCTION get_episode_comment_count(ep_id TEXT)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM comments WHERE episode_id = ep_id AND is_hidden = false;
$$ LANGUAGE SQL STABLE;

-- Get like count for an episode
CREATE OR REPLACE FUNCTION get_episode_like_count(ep_id TEXT)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM episode_likes WHERE episode_id = ep_id;
$$ LANGUAGE SQL STABLE;

-- Get like count for a comment
CREATE OR REPLACE FUNCTION get_comment_like_count(c_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM comment_likes WHERE comment_id = c_id;
$$ LANGUAGE SQL STABLE;

-- Check if user liked an episode
CREATE OR REPLACE FUNCTION user_liked_episode(ep_id TEXT, u_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM episode_likes WHERE episode_id = ep_id AND user_id = u_id);
$$ LANGUAGE SQL STABLE;

-- Check if user liked a comment
CREATE OR REPLACE FUNCTION user_liked_comment(c_id UUID, u_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = c_id AND user_id = u_id);
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
