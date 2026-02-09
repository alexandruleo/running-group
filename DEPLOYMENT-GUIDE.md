# Event Registration & Photo Uploads - Deployment Guide

## Summary of Changes

This implementation adds three major features:
1. **Public Registration** - Anyone can create an account (no invite required)
2. **Event Registration** - Users can register for events and select their distance
3. **User Photo Uploads** - Registered attendees can upload photos during/after events

## Step 1: Database Migration

Run the SQL migration in your Supabase dashboard:

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the contents of `/migrations/add-event-registrations.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. Verify success message: "Success. No rows returned"

### What this migration does:
- Creates `event_registrations` table
- Adds indexes for performance
- Sets up Row Level Security (RLS) policies
- Creates trigger for `updated_at` timestamp

## Step 2: Configure Clerk for Public Registration

Enable anyone to sign up (disable invite-only mode):

1. Open Clerk Dashboard: https://dashboard.clerk.com
2. Select your running group application
3. Navigate to **Settings** → **Restrictions** (or **Authentication** → **Restrictions**)
4. Find the **Invite only** setting
5. **Toggle it OFF** (disable invite-only mode)
6. Save changes

Now anyone with the link can create an account!

## Step 3: Verify Local Development

Test the features locally before deploying:

```bash
cd running-group
npm run dev
```

### Test Registration Flow:
1. Create a test event with multiple distances (e.g., "5K, 10K, Half Marathon")
2. Visit the event detail page
3. Click "Register for this Event"
4. Select a distance from the modal
5. Verify you appear in the attendee list
6. Try changing your distance
7. Try canceling your registration
8. Verify you can re-register

### Test Photo Upload Flow:
1. Register for an event
2. Temporarily modify the event date to be in the past (in Supabase dashboard)
3. Visit the event detail page
4. You should now see the "Add Your Photos" section
5. Upload 1-3 test photos
6. Verify photos appear immediately after upload
7. Refresh the page - photos should persist

### Test Access Controls:
1. Visit an event you're NOT registered for
2. Verify photo upload section shows "Register for this event to upload photos"
3. Register for a future event
4. Verify photo upload section shows "Photo uploads available during/after the event"

## Step 4: Deploy to Production

Your changes are ready to deploy!

### Via Git (Vercel will auto-deploy):

```bash
git add .
git commit -m "Add event registration and user photo uploads

- Created event_registrations table with RLS policies
- Added registration API routes (register, unregister, list)
- Built EventRegistration component with distance selection
- Added photo upload API with access controls
- Created UserPhotoUpload component
- Integrated features into event detail page
- Updated TypeScript types"

git push origin main
```

Vercel will automatically:
1. Detect the push
2. Build your application
3. Deploy to production
4. Update your live URL

### Verify Deployment:

1. Open your Vercel dashboard: https://vercel.com/dashboard
2. Wait for build to complete (usually 2-3 minutes)
3. Click on your deployment
4. Click "Visit" to open your live site
5. Test registration and photo upload features

## Step 5: Post-Deployment Verification

### Test on Production:

1. **Create Account** (public registration):
   - Visit your live site
   - Click "Sign Up"
   - Create a new account (no invite code needed)
   - Verify account is created successfully

2. **Event Registration**:
   - Visit an upcoming event
   - Click "Register for this Event"
   - Select a distance
   - Verify you appear in attendee list
   - Try changing distance and canceling

3. **Photo Uploads**:
   - Register for a past event (or wait for an event to start)
   - Upload 2-3 photos
   - Verify they appear immediately
   - Refresh page to confirm persistence

4. **Mobile Testing**:
   - Open site on actual mobile device
   - Test registration flow (buttons should be touch-friendly)
   - Test photo upload (file picker should work)
   - Verify responsive layout

## Features Implemented

### Event Registration
- ✅ Public attendee list (anyone can see who's registered)
- ✅ Distance selection (one distance per user)
- ✅ Change distance (before event starts)
- ✅ Cancel registration (before event starts)
- ✅ Grouped attendee display by distance
- ✅ Real-time registration count
- ✅ Disabled registration for past/started events

### Photo Uploads
- ✅ Only registered attendees can upload
- ✅ Only during/after event starts
- ✅ File validation (type, size, count)
- ✅ Multiple file upload (max 10)
- ✅ Preview before upload
- ✅ Upload progress indicator
- ✅ Success/error feedback
- ✅ Immediate photo display

### Security
- ✅ Row Level Security (RLS) on all tables
- ✅ Authentication required for actions
- ✅ Users can only modify their own data
- ✅ Registration status checked on upload
- ✅ Event timing validated
- ✅ File size/type validation

## API Routes

New API endpoints created:

- `GET /api/events/[id]/registrations` - List all registrations with runner data
- `POST /api/events/[id]/register` - Register user for event with distance
- `DELETE /api/events/[id]/unregister` - Cancel user's registration
- `POST /api/events/[id]/photos/upload` - Upload photos (with access controls)

## Database Schema

### event_registrations table:
```sql
- id (UUID, primary key)
- event_id (UUID, foreign key to events)
- runner_id (UUID, foreign key to runners)
- selected_distance (TEXT)
- status (TEXT: 'registered' or 'cancelled')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- UNIQUE constraint on (event_id, runner_id)
```

## Troubleshooting

### Registration button doesn't appear:
- Check if user is signed in
- Verify event hasn't started yet
- Check browser console for errors

### Photo upload fails:
- Verify user is registered for the event
- Check if event has started
- Verify file size < 5MB and correct type
- Check Supabase Storage bucket permissions

### Database errors:
- Verify migration ran successfully in Supabase
- Check RLS policies are enabled
- Verify user has valid runner profile

### Build errors:
- Run `npm run build` locally first
- Check for TypeScript errors
- Verify all imports are correct

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Vercel deployment logs
3. Check Supabase logs (Database → Logs)
4. Verify environment variables are set correctly

## Success Metrics

After deployment, you should see:
- Users registering for events
- Attendee lists populated with runner names
- Photos uploaded by registered attendees
- New signups without invite codes
- Mobile users able to use all features

---

**Deployment Status:** ✅ Ready to deploy
**Last Updated:** 2026-02-09
