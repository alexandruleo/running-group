import { createServiceClient } from '@/lib/supabase/service';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Get current runner
    const { data: runner, error: runnerError } = await supabase
      .from('runners')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();

    if (runnerError || !runner) {
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

    // Check if event has started
    const eventDate = new Date(event.event_date);
    const now = new Date();

    if (eventDate <= now) {
      return NextResponse.json(
        { error: 'Cannot unregister after event has started' },
        { status: 400 }
      );
    }

    // Update status to cancelled (soft delete)
    const { error: updateError } = await supabase
      .from('event_registrations')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('event_id', eventId)
      .eq('runner_id', runner.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling event registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
