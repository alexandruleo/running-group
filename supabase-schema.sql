-- =====================================================
-- Running Group Database Schema
-- =====================================================
-- Run this in your Supabase SQL Editor
-- Go to: Supabase Dashboard > SQL Editor > New Query
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Runners table (profiles)
CREATE TABLE IF NOT EXISTS runners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  distance TEXT,
  created_by UUID REFERENCES runners(id),
  is_past BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Event photos
CREATE TABLE IF NOT EXISTS event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID REFERENCES runners(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Weekly surveys
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  survey_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Survey responses
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  runner_id UUID REFERENCES runners(id) ON DELETE CASCADE,
  is_coming BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(survey_id, runner_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_runners_clerk_user_id ON runners(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_is_past ON events(is_past);
CREATE INDEX IF NOT EXISTS idx_event_photos_event_id ON event_photos(event_id);
CREATE INDEX IF NOT EXISTS idx_surveys_is_active ON surveys(is_active);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE runners ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Runners policies
-- Anyone authenticated can view runners
CREATE POLICY "Anyone can view runners"
  ON runners FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON runners FOR UPDATE
  TO authenticated
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can insert their own profile (for webhook)
CREATE POLICY "Users can insert own profile"
  ON runners FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Events policies
-- Anyone can view events
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

-- Admins can create events
CREATE POLICY "Admins can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM runners
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND is_admin = true
    )
  );

-- Admins can update events
CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM runners
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND is_admin = true
    )
  );

-- Event photos policies
-- Anyone can view photos
CREATE POLICY "Anyone can view event photos"
  ON event_photos FOR SELECT
  TO authenticated
  USING (true);

-- Anyone can upload photos
CREATE POLICY "Anyone can upload event photos"
  ON event_photos FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos"
  ON event_photos FOR DELETE
  TO authenticated
  USING (
    uploaded_by IN (
      SELECT id FROM runners
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Surveys policies
-- Anyone can view surveys
CREATE POLICY "Anyone can view surveys"
  ON surveys FOR SELECT
  TO authenticated
  USING (true);

-- Admins can create surveys
CREATE POLICY "Admins can create surveys"
  ON surveys FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM runners
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND is_admin = true
    )
  );

-- Survey responses policies
-- Anyone can view responses
CREATE POLICY "Anyone can view survey responses"
  ON survey_responses FOR SELECT
  TO authenticated
  USING (true);

-- Users can create their own responses
CREATE POLICY "Users can create responses"
  ON survey_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    runner_id IN (
      SELECT id FROM runners
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Users can update their own responses
CREATE POLICY "Users can update own responses"
  ON survey_responses FOR UPDATE
  TO authenticated
  USING (
    runner_id IN (
      SELECT id FROM runners
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
-- Run these commands in the Supabase Storage section
-- OR uncomment and run here if you have the proper extensions

-- Create storage buckets (you may need to do this in the Supabase UI)
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('event-photos', 'event-photos', true);

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Note: This will be populated via Clerk webhook when users sign up
-- But you can manually add a test user if needed:

-- INSERT INTO runners (clerk_user_id, email, name, is_admin, bio)
-- VALUES
--   ('your_clerk_user_id', 'admin@example.com', 'Admin User', true, 'Running group organizer'),
--   ('test_user_1', 'user1@example.com', 'Test Runner', false, 'Love morning runs!');

-- Sample survey
-- INSERT INTO surveys (question, survey_date, is_active)
-- VALUES ('Are you coming to this week''s run?', CURRENT_DATE, true);

-- Sample event
-- INSERT INTO events (title, description, event_date, location, distance, is_past)
-- VALUES
--   ('Weekend Long Run', 'Join us for a scenic 10-mile run through the park', NOW() + INTERVAL '3 days', 'Central Park', '10 miles', false),
--   ('Track Workout', 'Speed work session at the local track', NOW() - INTERVAL '5 days', 'City Track', '5K repeats', true);

-- =====================================================
-- FUNCTIONS (Optional but useful)
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_runners_updated_at BEFORE UPDATE ON runners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMPLETE!
-- =====================================================
-- After running this:
-- 1. Create storage buckets in Supabase Storage UI:
--    - avatars (public)
--    - event-photos (public)
-- 2. Get your Supabase credentials from Settings > API
-- 3. Add them to your .env.local file
-- =====================================================
