import { createServiceClient } from '@/lib/supabase/service';
import { NextResponse } from 'next/server';

/**
 * Cron job to create next week's recurring events
 * Should run every Sunday at midnight
 *
 * Vercel Cron: Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/create-recurring-events",
 *     "schedule": "0 0 * * 0"
 *   }]
 * }
 */
export async function GET(request: Request) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const today = new Date();

    // Get all recurring events that end today (Sunday)
    const { data: recurringEvents, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('is_recurring', true)
      .eq('is_past', false)
      .lte('event_date', today.toISOString());

    if (fetchError) {
      console.error('Error fetching recurring events:', fetchError);
      throw fetchError;
    }

    const createdEvents = [];

    for (const event of recurringEvents || []) {
      // Calculate next week's date
      const eventDate = new Date(event.event_date);
      const nextWeekDate = new Date(eventDate);

      if (event.recurrence_pattern === 'weekly') {
        nextWeekDate.setDate(nextWeekDate.getDate() + 7);
      }

      // Format the new title with date (e.g., "Herastrau Run - Feb 22")
      const dateStr = nextWeekDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const newTitle = `Herastrau Run - ${dateStr}`;

      // Check if next week's event already exists
      const { data: existingEvent } = await supabase
        .from('events')
        .select('id')
        .eq('title', newTitle)
        .eq('is_recurring', true)
        .single();

      if (!existingEvent) {
        // Create next week's event
        const { data: newEvent, error: createError } = await supabase
          .from('events')
          .insert({
            title: newTitle,
            description: event.description,
            event_date: nextWeekDate.toISOString(),
            location: event.location,
            distance: event.distance, // "8:40 lap, 9:30 lap, 10:30 coffee"
            created_by: event.created_by,
            is_past: false,
            is_recurring: true,
            recurrence_pattern: event.recurrence_pattern,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating recurring event:', createError);
          continue;
        }

        createdEvents.push(newEvent);
      }

      // Mark the current event as past
      await supabase
        .from('events')
        .update({ is_past: true })
        .eq('id', event.id);
    }

    return NextResponse.json({
      success: true,
      createdCount: createdEvents.length,
      events: createdEvents,
    });
  } catch (error) {
    console.error('Error in create-recurring-events cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
