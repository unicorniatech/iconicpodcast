-- ICONIC Podcast - Analytics Schema
-- Run this migration in your Supabase SQL editor AFTER 002_comments_and_likes.sql

-- ============================================================================
-- PAGE VIEWS TABLE
-- Tracks all page views with session and device info
-- ============================================================================
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT NOT NULL,
  screen_width INTEGER,
  screen_height INTEGER,
  language TEXT,
  country TEXT,
  city TEXT,
  session_id TEXT NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_page_views_path ON page_views(path);
CREATE INDEX idx_page_views_session_id ON page_views(session_id);
CREATE INDEX idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX idx_page_views_country ON page_views(country);

-- ============================================================================
-- WEB VITALS TABLE
-- Tracks Core Web Vitals (LCP, FID, CLS, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS web_vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- LCP, FID, CLS, FCP, TTFB
  value DECIMAL NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  path TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_web_vitals_name ON web_vitals(name);
CREATE INDEX idx_web_vitals_created_at ON web_vitals(created_at DESC);

-- ============================================================================
-- ANALYTICS EVENTS TABLE
-- Tracks custom events (button clicks, form submissions, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  path TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics data (anonymous tracking)
CREATE POLICY "Anyone can insert page views" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert web vitals" ON web_vitals FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert events" ON analytics_events FOR INSERT WITH CHECK (true);

-- Anyone can update page views (for duration tracking)
CREATE POLICY "Anyone can update page views" ON page_views FOR UPDATE USING (true);

-- Only admins can read analytics data
CREATE POLICY "Admins can view page views" ON page_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can view web vitals" ON web_vitals FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can view events" ON analytics_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Admins can delete old analytics data
CREATE POLICY "Admins can delete page views" ON page_views FOR DELETE USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can delete web vitals" ON web_vitals FOR DELETE USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can delete events" ON analytics_events FOR DELETE USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get analytics summary
CREATE OR REPLACE FUNCTION get_analytics_summary(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
  total_page_views BIGINT,
  unique_sessions BIGINT,
  avg_duration DECIMAL,
  bounce_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_page_views,
    COUNT(DISTINCT session_id)::BIGINT as unique_sessions,
    COALESCE(AVG(duration_seconds), 0)::DECIMAL as avg_duration,
    (COUNT(*) FILTER (WHERE duration_seconds IS NULL OR duration_seconds < 10)::DECIMAL / 
     NULLIF(COUNT(DISTINCT session_id), 0) * 100)::DECIMAL as bounce_rate
  FROM page_views
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old analytics data (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_analytics(days_to_keep INTEGER DEFAULT 90)
RETURNS void AS $$
BEGIN
  DELETE FROM page_views WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  DELETE FROM web_vitals WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  DELETE FROM analytics_events WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
