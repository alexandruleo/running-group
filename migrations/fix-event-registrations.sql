-- =====================================================
-- Fix Event Registrations (Safe Migration)
-- =====================================================
-- This safely recreates policies even if they exist
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view event registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can create registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can update own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can delete own registrations" ON event_registrations;
DROP POLICY IF EXISTS "service_role_all_registrations" ON event_registrations;

-- Event registrations table (IF NOT EXISTS is safe)
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  runner_id UUID REFERENCES runners(id) ON DELETE CASCADE NOT NULL,
  selected_distance TEXT NOT NULL,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, runner_id)
);

-- Indexes (IF NOT EXISTS is safe)
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_runner_id ON event_registrations(runner_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);

-- Enable RLS
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Recreate RLS Policies
-- Anyone can view registrations (public attendee list)
CREATE POLICY "Anyone can view event registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create registrations
CREATE POLICY "Users can create registrations"
  ON event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (
    runner_id IN (
      SELECT id FROM runners
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Users can update their own registrations
CREATE POLICY "Users can update own registrations"
  ON event_registrations FOR UPDATE
  TO authenticated
  USING (
    runner_id IN (
      SELECT id FROM runners
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Users can delete their own registrations
CREATE POLICY "Users can delete own registrations"
  ON event_registrations FOR DELETE
  TO authenticated
  USING (
    runner_id IN (
      SELECT id FROM runners
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS update_event_registrations_updated_at ON event_registrations;
CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON event_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Migration Complete!
-- =====================================================
