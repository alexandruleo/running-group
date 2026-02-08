# Google Maps Autocomplete Setup

The location autocomplete feature uses Google Places API. Follow these steps to enable it:

## Step 1: Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project (or select an existing one)
   - Click "Select a project" at the top
   - Click "New Project"
   - Name it: "Running Group App"
   - Click "Create"

3. Enable the Places API
   - Go to "APIs & Services" → "Library"
   - Search for "Places API"
   - Click on it and click "Enable"
   - Also enable "Maps JavaScript API" (same process)

4. Create API credentials
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API key"
   - Copy your API key (looks like: `AIzaSyXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX`)

5. Restrict your API key (recommended)
   - Click on your API key to edit it
   - Under "Application restrictions":
     - Select "HTTP referrers (web sites)"
     - Add: `http://localhost:3000/*` (for development)
     - Add: `https://your-domain.vercel.app/*` (for production)
   - Under "API restrictions":
     - Select "Restrict key"
     - Check: "Places API" and "Maps JavaScript API"
   - Click "Save"

## Step 2: Add to Environment Variables

Add this to your `.env.local` file:

```env
# Google Maps (for location autocomplete)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

Replace `YOUR_API_KEY_HERE` with your actual API key.

## Step 3: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 4: Test It!

1. Go to create an event: `/events/create`
2. Start typing in the Location field
3. You should see autocomplete suggestions appear!

## Pricing

Google Maps has a generous free tier:
- **$200 credit per month** (free)
- Places Autocomplete: ~$2.83 per 1,000 requests
- That's about **70,000 free autocompletes per month**

For a small running group, you'll likely never exceed the free tier!

## Troubleshooting

**Autocomplete not working?**
- Check the browser console for errors
- Verify your API key is correct in `.env.local`
- Make sure you enabled both "Places API" and "Maps JavaScript API"
- Restart your dev server after adding the key

**Getting billing errors?**
- You need to enable billing in Google Cloud (but you won't be charged under the free tier)
- Go to "Billing" in Google Cloud Console and add a payment method

## Without API Key

The location input will still work as a regular text field. Users can type locations manually, they just won't get autocomplete suggestions.

The Google Maps links (🗺️) will still work without an API key!
