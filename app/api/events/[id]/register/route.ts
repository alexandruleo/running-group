import { createServiceClient } from '@/lib/supabase/service';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { selected_distance, selected_distances } = body;

    // Support both single and multiple distance selection
    const distances = selected_distances || (selected_distance ? [selected_distance] : []);

    if (!distances || distances.length === 0) {
      return NextResponse.json(
        { error: 'At least one distance must be selected' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get current runner
    const { data: runner, error: runnerError } = await supabase
      .from('runners')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();

    if (runnerError || !runner) {
      console.error('Runner lookup failed:', {
        clerk_user_id: user.id,
        error: runnerError,
        runner: runner,
      });
      return NextResponse.json({ error: 'Runner not found' }, { status: 404 });
    }

    // Get event and validate
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if event has started or is past
    const eventDate = new Date(event.event_date);
    const now = new Date();

    if (event.is_past || eventDate <= now) {
      return NextResponse.json(
        { error: 'Cannot register for past or started events' },
        { status: 400 }
      );
    }

    // Validate selected distances are available for this event
    const availableDistances = event.distance
      ? event.distance.split(',').map((d: string) => d.trim())
      : [];

    const invalidDistances = distances.filter((d: string) => !availableDistances.includes(d));
    if (invalidDistances.length > 0) {
      return NextResponse.json(
        { error: `Invalid distance selection: ${invalidDistances.join(', ')}` },
        { status: 400 }
      );
    }

    // Upsert registration (insert or update)
    // Store in both formats for compatibility
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .upsert(
        {
          event_id: eventId,
          runner_id: runner.id,
          selected_distance: distances[0], // Legacy single value (first selection)
          selected_distances: distances, // New array format
          status: 'registered',
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'event_id,runner_id',
        }
      )
      .select()
      .single();

    if (regError) {
      throw regError;
    }

    return NextResponse.json({ success: true, registration });
  } catch (error) {
    console.error('Error creating event registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
