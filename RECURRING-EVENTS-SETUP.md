# Recurring Events Setup Guide - Herastrau Run

## Overview

The Herastrau Run is a weekly recurring event that auto-creates the next week's event every Sunday at midnight.

**Features:**
- Event name: "Herastrau Run - [date]" (e.g., "Herastrau Run - Feb 22")
- Options: "8:40 lap, 9:30 lap, 10:30 coffee"
- Multiple selection allowed (checkboxes instead of radio buttons)
- Auto-creates next week's event at Sunday midnight
- Previous event marked as "past" when new one is created

## Step 1: Run Database Migration

1. Open Supabase Dashboard → SQL Editor → New Query
2. Copy and paste this SQL:

```sql
-- Add recurring event fields to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT;

-- Change event_registrations to support multiple distance selections
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS selected_distances JSONB;

-- Migrate existing single distance to array format
UPDATE event_registrations
SET selected_distances = jsonb_build_array(selected_distance)
WHERE selected_distances IS NULL AND selected_distance IS NOT NULL;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_events_is_recurring ON events(is_recurring) WHERE is_recurring = true;
CREATE INDEX IF NOT EXISTS idx_events_event_date_recurring ON events(event_date, is_recurring);
```

3. Click "Run"
4. Verify success: "Success. No rows returned"

## Step 2: Create the First Herastrau Run Event

You need to manually create the first event with the proper settings:

### Via Supabase SQL:

```sql
INSERT INTO events (
  title,
  description,
  event_date,
  location,
  distance,
  is_recurring,
  recurrence_pattern,
  is_past
)
VALUES (
  'Herastrau Run - Feb 16',  -- Update with next Sunday's date
  'Weekly running group at Herastrau Park',
  '2026-02-16 08:00:00+00',  -- Next Sunday at 8 AM (adjust to your timezone)
  'Herastrau Park',
  '8:40 lap, 9:30 lap, 10:30 coffee',
  true,  -- is_recurring = true
  'weekly',
  false
);
```

### Or via UI:

1. Go to /events/create
2. Fill in:
   - **Title:** "Herastrau Run - Feb 16" (use next Sunday's date)
   - **Description:** "Weekly running group at Herastrau Park"
   - **Date/Time:** Next Sunday at 8:00 AM
   - **Location:** Herastrau Park
   - **Distance:** `8:40 lap, 9:30 lap, 10:30 coffee` (exactly this format)
3. After creating, manually update in Supabase:

```sql
UPDATE events
SET is_recurring = true, recurrence_pattern = 'weekly'
WHERE title LIKE 'Herastrau Run%';
```

## Step 3: Set Up Cron Secret

Add a CRON_SECRET to your environment variables for security:

### Local Development:

Add to `.env.local`:
```
CRON_SECRET=your-random-secret-here-123456
```

### Vercel Production:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   - **Name:** `CRON_SECRET`
   - **Value:** A random secure string (e.g., generate with `openssl rand -base64 32`)
   - **Environment:** Production
3. Click "Save"
4. Redeploy your application

## Step 4: Verify Vercel Cron Configuration

The `vercel.json` file should already be configured:

```json
{
  "crons": [
    {
      "path": "/api/cron/create-recurring-events",
      "schedule": "0 0 * * 0"
    }
  ]
}
```

This runs every Sunday at midnight (00:00 UTC).

**Note:** Vercel Cron only works in production, not in preview deployments.

## Step 5: Deploy to Production

```bash
git add .
git commit -m "Add recurring events feature for Herastrau Run"
git push origin main
```

Vercel will automatically deploy with cron enabled.

## Step 6: Test the Feature

### Test Multi-Select Registration:

1. Visit the Herastrau Run event page
2. Click "Register for this Event"
3. You should see **checkboxes** instead of radio buttons
4. Select multiple options (e.g., "8:40 lap" AND "9:30 lap")
5. Click "Confirm"
6. You should see both options displayed in your registration

### Test Manual Cron Trigger (Optional):

You can manually trigger the cron to test it:

```bash
curl -X GET "https://your-domain.vercel.app/api/cron/create-recurring-events" \
  -H "Authorization: Bearer your-cron-secret"
```

This will:
- Create next week's event (if current event ends today)
- Mark current event as past
- Return JSON with created events

## How It Works

1. **Every Sunday at midnight (UTC):**
   - Vercel Cron calls `/api/cron/create-recurring-events`
   - API checks for recurring events ending today
   - Creates new event for next Sunday with updated date in title
   - Marks old event as past

2. **Multi-Select Registration:**
   - Herastrau Run event has `is_recurring = true`
   - UI shows checkboxes instead of radio buttons
   - Multiple options stored in `selected_distances` JSON array
   - Displayed as badge list when registered

3. **Attendee List:**
   - Shows all registered runners
   - Groups by distance option
   - Runners with multiple selections appear in multiple groups

## Troubleshooting

### Cron not running:
- Verify `vercel.json` exists in project root
- Check Vercel Dashboard → Project → Settings → Cron Jobs
- Cron only works in production (not preview)
- Check Vercel logs for errors

### Multi-select not showing:
- Verify event has `is_recurring = true` in database
- Check browser console for errors
- Refresh the page

### Event not auto-creating:
- Check Vercel Function Logs for cron execution
- Verify CRON_SECRET matches in code and environment
- Ensure event date format is correct in database

## Future Enhancements

If you want to add more recurring events:

1. Create the event with `is_recurring = true`
2. Set `recurrence_pattern = 'weekly'`
3. Update the cron logic if different title pattern needed
4. Consider adding UI to mark events as recurring during creation

---

**Last Updated:** 2026-02-09
**Status:** Ready to deploy
