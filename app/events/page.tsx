import { createClient } from '@/lib/supabase/server';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { EventCard } from '@/components/events/EventCard';
import type { Event } from '@/types/database';

export default async function EventsPage() {
  const user = await currentUser();
  const supabase = await createClient();

  // Fetch all events
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false });

  // Check if user is admin
  const { data: runner } = await supabase
    .from('runners')
    .select('is_admin')
    .eq('clerk_user_id', user?.id)
    .single();

  const isAdmin = runner?.is_admin || false;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 text-red-800 p-4 rounded-lg">
            Error loading events. Please try again.
          </div>
        </div>
      </div>
    );
  }

  // Separate upcoming and past events
  const upcomingEvents = events?.filter((e: Event) => !e.is_past) || [];
  const pastEvents = events?.filter((e: Event) => e.is_past) || [];

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">📅 Events</h1>
          {isAdmin && (
            <Link
              href="/events/create"
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-xl hover:scale-105 transition-all shadow-lg font-bold"
            >
              ✨ Create Event
            </Link>
          )}
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upcoming Runs
            </h2>
            <div className="grid gap-4">
              {upcomingEvents.map((event: Event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Past Runs
            </h2>
            <div className="grid gap-4">
              {pastEvents.map((event: Event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!events || events.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600 mb-4">No events scheduled yet.</p>
            {isAdmin && (
              <Link
                href="/events/create"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Event
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
