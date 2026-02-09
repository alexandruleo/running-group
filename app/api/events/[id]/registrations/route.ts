import { createServiceClient } from '@/lib/supabase/service';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const user = await currentUser();

    const supabase = createServiceClient();

    // Get all registrations for this event with runner info
    const { data: registrations, error: regError } = await supabase
      .from('event_registrations')
      .select(`
        *,
        runner:runners(*)
      `)
      .eq('event_id', eventId)
      .eq('status', 'registered')
      .order('created_at');

    if (regError) {
      throw regError;
    }

    // Get current user's registration if authenticated
    let userRegistration = null;
    if (user) {
      const { data: runner } = await supabase
        .from('runners')
        .select('id')
        .eq('clerk_user_id', user.id)
        .single();

      if (runner) {
        const { data: userReg } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('event_id', eventId)
          .eq('runner_id', runner.id)
          .eq('status', 'registered')
          .single();

        userRegistration = userReg;
      }
    }

    console.log('Registrations API Response:', {
      registrationsCount: registrations?.length || 0,
      userRegistration: userRegistration ? 'FOUND' : 'NULL',
      userRegistrationData: userRegistration,
    });

    return NextResponse.json({
      registrations: registrations || [],
      userRegistration,
    });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
