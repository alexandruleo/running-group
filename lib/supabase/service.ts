import { createClient } from '@supabase/supabase-js';

/**
 * Service role client for server-side operations
 * Use this in API routes where you've already authenticated via Clerk
 * This bypasses RLS since authentication is handled by Clerk
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
