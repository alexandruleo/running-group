-- =====================================================
-- Add Recurring Events Support
-- =====================================================

-- Add recurring event fields to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT;

-- Change event_registrations to support multiple distance selections
-- Store as JSON array instead of single text value
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS selected_distances JSONB;

-- Migrate existing single distance to array format
UPDATE event_registrations
SET selected_distances = jsonb_build_array(selected_distance)
WHERE selected_distances IS NULL AND selected_distance IS NOT NULL;

-- Create index for faster queries on recurring events
CREATE INDEX IF NOT EXISTS idx_events_is_recurring ON events(is_recurring) WHERE is_recurring = true;
CREATE INDEX IF NOT EXISTS idx_events_event_date_recurring ON events(event_date, is_recurring);

-- =====================================================
-- Migration Complete!
-- =====================================================
-- Note: We keep the old selected_distance column for backwards compatibility
-- New code will use selected_distances (JSONB array)
-- =====================================================
