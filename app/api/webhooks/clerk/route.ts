import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Verification failed', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Get primary email
    const email = email_addresses[0]?.email_address;

    if (!email) {
      return new Response('Error: No email found', { status: 400 });
    }

    // Create name from first and last name, or use email
    const name = first_name && last_name
      ? `${first_name} ${last_name}`
      : first_name || last_name || email.split('@')[0];

    try {
      const supabase = createServiceClient();

      // Create runner profile with Google profile photo
      const { error } = await supabase
        .from('runners')
        .insert({
          clerk_user_id: id,
          email,
          name,
          avatar_url: image_url || null, // Automatically use Google profile photo
          is_admin: false, // Set manually in Supabase for admin users
        });

      if (error) {
        console.error('Error creating runner profile:', error);
        return new Response('Error: Failed to create profile', { status: 500 });
      }

      return new Response('Webhook processed successfully', { status: 200 });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return new Response('Error: Internal server error', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Get primary email
    const email = email_addresses[0]?.email_address;

    if (!email) {
      return new Response('Error: No email found', { status: 400 });
    }

    // Create name from first and last name, or use email
    const name = first_name && last_name
      ? `${first_name} ${last_name}`
      : first_name || last_name || email.split('@')[0];

    try {
      const supabase = createServiceClient();

      // Update runner profile with new data
      const { error } = await supabase
        .from('runners')
        .update({
          email,
          name,
          avatar_url: image_url || null,
        })
        .eq('clerk_user_id', id);

      if (error) {
        console.error('Error updating runner profile:', error);
        return new Response('Error: Failed to update profile', { status: 500 });
      }

      return new Response('Webhook processed successfully', { status: 200 });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return new Response('Error: Internal server error', { status: 500 });
    }
  }

  return new Response('Webhook event not handled', { status: 200 });
}
