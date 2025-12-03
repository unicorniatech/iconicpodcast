-- ICONIC Podcast Database Schema
-- Run this migration in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- LEADS TABLE
-- Stores all captured leads from chatbot, contact forms, newsletters, etc.
-- ============================================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interest TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN (
    'chatbot', 'contact_form', 'manual', 'newsletter', 'guest_popup',
    'youtube_description', 'instagram_bio', 'paid_social',
    'landing_youtube', 'landing_instagram', 'landing_social'
  )),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'archived')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  campaign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- ============================================================================
-- EPISODES TABLE
-- Stores podcast episode metadata (can be managed via Supabase dashboard)
-- ============================================================================
CREATE TABLE IF NOT EXISTS episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  published_at DATE NOT NULL,
  image_url TEXT NOT NULL,
  video_url TEXT,
  audio_url TEXT,
  spotify_url TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  apple_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_episodes_published_at ON episodes(published_at DESC);
CREATE INDEX idx_episodes_is_published ON episodes(is_published);

-- ============================================================================
-- COURSES TABLE
-- Stores course information for content gating
-- ============================================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'CZK',
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- MODULES TABLE
-- Course modules/sections
-- ============================================================================
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_modules_course_id ON modules(course_id);

-- ============================================================================
-- LESSONS TABLE
-- Individual lessons within modules
-- ============================================================================
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  is_free_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lessons_module_id ON lessons(module_id);

-- ============================================================================
-- SEMINARS TABLE
-- Live events and seminars
-- ============================================================================
CREATE TABLE IF NOT EXISTS seminars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_online BOOLEAN DEFAULT true,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'CZK',
  max_attendees INTEGER,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seminars_event_date ON seminars(event_date);
CREATE INDEX idx_seminars_is_published ON seminars(is_published);

-- ============================================================================
-- ENROLLMENTS TABLE
-- Tracks user enrollments in courses and seminars
-- ============================================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  seminar_id UUID REFERENCES seminars(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT enrollment_type CHECK (
    (course_id IS NOT NULL AND seminar_id IS NULL) OR
    (course_id IS NULL AND seminar_id IS NOT NULL)
  )
);

CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_seminar_id ON enrollments(seminar_id);

-- ============================================================================
-- FAQS TABLE
-- Knowledge base for chatbot and FAQ pages
-- ============================================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_is_published ON faqs(is_published);

-- ============================================================================
-- ADMIN_USERS TABLE
-- Tracks which users have admin access
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminars ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Leads: Anyone can insert, only admins can read/update/delete
CREATE POLICY "Anyone can create leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all leads" ON leads FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can update leads" ON leads FOR UPDATE USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can delete leads" ON leads FOR DELETE USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Episodes: Anyone can read published, admins can manage all
CREATE POLICY "Anyone can view published episodes" ON episodes FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage episodes" ON episodes FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Courses: Anyone can read published, admins can manage all
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage courses" ON courses FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Modules: Anyone can read (if course is published), admins can manage
CREATE POLICY "Anyone can view modules of published courses" ON modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = modules.course_id AND courses.is_published = true)
);
CREATE POLICY "Admins can manage modules" ON modules FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Lessons: Free preview for all, enrolled users see all, admins manage
CREATE POLICY "Anyone can view free preview lessons" ON lessons FOR SELECT USING (is_free_preview = true);
CREATE POLICY "Enrolled users can view course lessons" ON lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    JOIN modules m ON m.id = lessons.module_id
    WHERE e.user_id = auth.uid() AND e.course_id = m.course_id AND e.status = 'active'
  )
);
CREATE POLICY "Admins can manage lessons" ON lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Seminars: Anyone can read published, admins can manage
CREATE POLICY "Anyone can view published seminars" ON seminars FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage seminars" ON seminars FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Enrollments: Users can view own, admins can manage all
CREATE POLICY "Users can view own enrollments" ON enrollments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage enrollments" ON enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- FAQs: Anyone can read published, admins can manage
CREATE POLICY "Anyone can view published FAQs" ON faqs FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage FAQs" ON faqs FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Admin users: Only admins can view/manage
CREATE POLICY "Admins can view admin_users" ON admin_users FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Only super admins can manage admin_users" ON admin_users FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON episodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seminars_updated_at BEFORE UPDATE ON seminars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
