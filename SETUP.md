# Running Group - Quick Setup Guide

## What Has Been Built

A complete mobile-first running group web application with:

✅ **Phase 1 - Project Setup**
- Next.js 15 with TypeScript and Tailwind CSS
- Clerk authentication (invite-only)
- Supabase database integration

✅ **Phase 2 - Database**
- Complete database schema (runners, events, photos, surveys)
- Row Level Security policies
- Clerk webhook for automatic profile creation

✅ **Phase 3 - Runner Profiles**
- List all runners
- View individual profiles
- Edit profile with avatar upload

✅ **Phase 4 - Events & Photos**
- List events (upcoming vs past)
- Event detail pages with photo gallery
- Create events (admin only)
- Photo lightbox viewer

✅ **Phase 5 - Weekly Survey**
- Survey component with "I'm Coming" / "Can't Make It" buttons
- Show who's coming to each run
- API routes for survey responses
- Homepage integration

✅ **Phase 6 - Mobile Polish**
- Bottom tab navigation (Home, Events, Runners, Profile)
- Loading states and error handling
- Mobile-first responsive design
- 16px base font (prevents iOS zoom)
- 44px minimum touch targets

✅ **Phase 7 - Documentation**
- Comprehensive README
- Database schema SQL file
- Environment variable templates

## Next Steps

### 1. Setup Your Services (30 minutes)

#### Clerk (Authentication)
1. Visit [clerk.com](https://clerk.com) → Create account
2. Create new application
3. Enable invite-only mode
4. Copy API keys to `.env.local`

#### Supabase (Database)
1. Visit [supabase.com](https://supabase.com) → Create account
2. Create new project
3. Run `supabase-schema.sql` in SQL Editor
4. Create storage buckets: `avatars` and `event-photos` (both public)
5. Copy API credentials to `.env.local`

#### Clerk Webhook (For Development)
1. Install ngrok: `npm install -g ngrok`
2. Run: `ngrok http 3000`
3. Add webhook in Clerk: `https://your-url.ngrok.io/api/webhooks/clerk`
4. Subscribe to `user.created` event
5. Copy webhook secret to `.env.local`

### 2. Test Locally (10 minutes)

```bash
# Start the app
npm run dev

# Open http://localhost:3000
```

**Test Flow:**
1. Sign in (you'll be redirected to Clerk)
2. Invite yourself via Clerk dashboard
3. Sign up with your invite
4. Create a test survey in Supabase SQL Editor (see README)
5. Test the survey response buttons
6. (If admin) Create a test event with photos

### 3. Deploy to Production (20 minutes)

```bash
# Push to GitHub
git add .
git commit -m "Initial running group app"
git push

# Deploy to Vercel
# 1. Visit vercel.com
# 2. Import your GitHub repo
# 3. Add all environment variables
# 4. Deploy
# 5. Update Clerk webhook to production URL
```

## Environment Variables Checklist

Your `.env.local` should have:

```env
# Clerk (from clerk.com dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase (from supabase.com project settings)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

## File Structure Overview

```
running-group/
├── app/
│   ├── api/
│   │   ├── survey/          # Survey API endpoints
│   │   └── webhooks/        # Clerk webhook
│   ├── events/              # Events pages
│   │   ├── [id]/           # Event detail
│   │   ├── create/         # Create event (admin)
│   │   └── page.tsx        # Events list
│   ├── runners/             # Runner pages
│   │   ├── [id]/           # Profile view
│   │   │   └── edit/       # Edit profile
│   │   └── page.tsx        # Runners list
│   ├── page.tsx            # Homepage (survey + events)
│   └── layout.tsx          # Root layout with nav
├── components/
│   ├── events/             # Event components
│   ├── layout/             # Navigation
│   ├── runners/            # Runner components
│   ├── survey/             # Survey widget
│   └── ui/                 # Reusable UI
├── lib/
│   ├── supabase/           # DB clients
│   └── utils/              # Helpers
├── types/                   # TypeScript types
├── supabase-schema.sql     # Database setup
└── .env.local              # Environment variables
```

## Key Features

### Authentication
- Invite-only via Clerk
- Automatic profile creation on signup (webhook)
- Protected routes (middleware)

### Runner Profiles
- Avatar upload to Supabase Storage
- Bio and name editing
- View all members

### Events
- Create events with multiple photos (admin only)
- View events (all users)
- Automatic past/upcoming sorting
- Photo lightbox viewer

### Weekly Survey
- One active survey at a time
- Real-time response updates
- See who's coming with avatars
- Change response anytime

### Mobile-First
- Bottom navigation bar
- Touch-friendly (44px targets)
- Responsive layouts
- Optimized for small screens

## Common Operations

### Make Someone Admin
```sql
-- In Supabase SQL Editor
UPDATE runners
SET is_admin = true
WHERE email = 'user@example.com';
```

### Create Weekly Survey
```sql
-- Deactivate old
UPDATE surveys SET is_active = false;

-- Create new
INSERT INTO surveys (question, survey_date, is_active)
VALUES ('Are you running this Saturday at 8am?', CURRENT_DATE, true);
```

### Mark Events as Past
```sql
UPDATE events
SET is_past = true
WHERE event_date < NOW();
```

## Troubleshooting

**Can't sign in?**
- Check Clerk API keys in `.env.local`
- Verify you're invited in Clerk dashboard

**Profile not created?**
- Check webhook is configured
- Verify webhook secret is correct
- Check webhook logs in Clerk dashboard

**Photos not uploading?**
- Verify storage buckets exist: `avatars`, `event-photos`
- Check buckets are public
- Verify Supabase credentials

**Survey not showing?**
- Create a survey using SQL (see above)
- Check `is_active = true`
- Verify API routes are working

## What's Next?

Optional enhancements you could add:

1. **Admin UI for surveys** - Create surveys from the web app instead of SQL
2. **Automatic event archiving** - Cron job to mark past events
3. **Photo upload on event pages** - Add photos after event is created
4. **Push notifications** - Notify when new events are created
5. **Run stats** - Track personal/group mileage and pace
6. **Comments** - Add comments to events
7. **Route maps** - Integrate with mapping service
8. **Weather widget** - Show weather for upcoming runs

## Support

- Check the README.md for detailed documentation
- Review supabase-schema.sql for database structure
- Check .env.local.example for required environment variables

---

**Built with Next.js 15, Clerk, Supabase, and Tailwind CSS**
