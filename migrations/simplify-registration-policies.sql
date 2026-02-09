-- =====================================================
-- Simplified Event Registrations RLS Policies
-- =====================================================
-- Since authentication is handled in API routes via Clerk,
-- we can use simpler RLS policies
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view event registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can create registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can update own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can delete own registrations" ON event_registrations;

-- Recreate with simpler policies that allow authenticated users
-- (API routes handle the actual authorization logic)

-- Anyone authenticated can view registrations (public attendee list)
CREATE POLICY "Anyone can view event registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert registrations
-- (API route verifies they're registering themselves)
CREATE POLICY "Users can create registrations"
  ON event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update registrations
-- (API route verifies they own the registration)
CREATE POLICY "Users can update own registrations"
  ON event_registrations FOR UPDATE
  TO authenticated
  USING (true);

-- Authenticated users can delete registrations
-- (API route verifies they own the registration)
CREATE POLICY "Users can delete own registrations"
  ON event_registrations FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- Migration Complete!
-- =====================================================
