# Running Group Web App

A mobile-first web application for managing a small running group with member profiles, event tracking, photo sharing, and weekly attendance surveys.

## Features

- **Authentication**: Invite-only access via Clerk with persistent sessions
- **Runner Profiles**: Member bios, avatars, and profile management
- **Events**: Create and view running events with photos and details
- **Photo Gallery**: Upload and view event photos with lightbox
- **Weekly Survey**: Track who's coming to the next run
- **Mobile-First Design**: Optimized for mobile with bottom tab navigation

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk (invite-only)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (avatars & event photos)
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ installed
- A Clerk account (free tier works)
- A Supabase account (free tier works)
- A Vercel account (optional, for deployment)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. In your Clerk dashboard, go to **Configure** → **Email, Phone, Username**
4. Enable **Email** authentication
5. Go to **User & Authentication** → **Restrictions** → Enable **Invite-only mode**
6. Copy your API keys from the **API Keys** section
7. Update `.env.local` with your Clerk keys

### 3. Setup Supabase Database

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project (choose a region close to you)
3. Wait for the project to finish setting up (~2 minutes)
4. Go to **SQL Editor** → **New Query**
5. Copy and paste the entire contents of `supabase-schema.sql`
6. Click **Run** to create all tables and policies
7. Go to **Storage** → **Create Bucket**:
   - Create bucket: `avatars` (Public: ✅)
   - Create bucket: `event-photos` (Public: ✅)
8. Go to **Settings** → **API**
9. Copy your credentials and update `.env.local`

### 4. Setup Clerk Webhook (for Auto-Profile Creation)

1. In your Clerk dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. For development, use ngrok:
   ```bash
   npx ngrok http 3000
   ```
4. Add endpoint URL: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
5. Subscribe to the `user.created` event
6. Copy the **Signing Secret** and add to `.env.local`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Invite Your First Member

1. Go to your Clerk dashboard
2. Click **Users** → **Invite**
3. Enter email address and send invitation
4. When they sign up, a runner profile is automatically created
5. To make someone an admin:
   - Go to Supabase → **Table Editor** → `runners`
   - Find their row and set `is_admin` to `true`

### 7. Create a Test Survey

```sql
-- Run this in Supabase SQL Editor
INSERT INTO surveys (question, survey_date, is_active)
VALUES ('Are you coming to this week''s run?', CURRENT_DATE, true);
```

## Project Structure

```
running-group/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes (survey, webhooks)
│   ├── events/            # Events pages
│   ├── runners/           # Runner profile pages
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── events/           # Event-related components
│   ├── layout/           # Navigation components
│   ├── runners/          # Runner-related components
│   ├── survey/           # Survey components
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities
│   ├── supabase/         # Supabase clients
│   └── utils/            # Helper functions
├── types/                 # TypeScript types
└── supabase-schema.sql   # Database schema
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Add all environment variables from `.env.local`
5. Click **Deploy**

### 3. Update Clerk Webhook

1. After deployment, go to your Clerk dashboard
2. Update the webhook endpoint to your production URL:
   `https://your-app.vercel.app/api/webhooks/clerk`

## Common Tasks

### Make a User Admin

```sql
UPDATE runners
SET is_admin = true
WHERE email = 'user@example.com';
```

### Create a New Survey

```sql
-- Deactivate old surveys
UPDATE surveys SET is_active = false WHERE is_active = true;

-- Create new survey
INSERT INTO surveys (question, survey_date, is_active)
VALUES ('Are you joining us this Saturday at 8am?', CURRENT_DATE, true);
```

## Troubleshooting

### Webhook Not Working
- Verify webhook URL in Clerk dashboard
- Check `CLERK_WEBHOOK_SECRET` environment variable
- Check Vercel deployment logs

### Images Not Uploading
- Verify Supabase storage buckets are public
- Check bucket names: `avatars` and `event-photos`

### Database Errors
- Re-run `supabase-schema.sql` if tables are missing
- Verify RLS policies are enabled
- Check environment variables

## License

MIT
