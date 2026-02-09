import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { currentUser } from '@clerk/nextjs/server';
import { WeeklySurvey } from '@/components/survey/WeeklySurvey';
import { EventRegistration } from '@/components/events/EventRegistration';
import type { Event } from '@/types/database';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = await createClient();
  const user = await currentUser();

  // Get current runner ID
  let currentRunnerId: string | null = null;
  if (user) {
    const serviceClient = createServiceClient();
    const { data: runner } = await serviceClient
      .from('runners')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();
    currentRunnerId = runner?.id || null;
  }

  // Fetch all upcoming events
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .eq('is_past', false)
    .order('event_date', { ascending: true });

  // Split into next event and other events
  const nextEvent = upcomingEvents?.[0];
  const otherEvents = upcomingEvents?.slice(1) || [];

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-6 pb-2">
          <h1 className="text-5xl font-extrabold text-white mb-3 drop-shadow-lg">
            Running Group 🏃
          </h1>
          <p className="text-white/90 text-lg font-medium">
            Your running community, all in one place
          </p>
        </div>

        {/* Weekly Survey */}
        <WeeklySurvey />

        {/* Next Event - Full Featured */}
        {nextEvent && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              🎯 Next Run
            </h2>

            {/* Event Details */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {nextEvent.title}
                  </h3>
                  {nextEvent.description && (
                    <p className="text-gray-600 mb-4">{nextEvent.description}</p>
                  )}
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-gray-700">
                      <span>📅</span>
                      <span className="font-semibold">
                        {new Date(nextEvent.event_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {' at '}
                        {new Date(nextEvent.event_date).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </p>
                    {nextEvent.location && (
                      <p className="flex items-center gap-2 text-gray-700">
                        <span>📍</span>
                        <span>{nextEvent.location}</span>
                      </p>
                    )}
                    {nextEvent.distance && (
                      <p className="flex items-center gap-2 text-gray-700">
                        <span>🏃</span>
                        <span>{nextEvent.distance}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Component */}
            <EventRegistration event={nextEvent} currentRunnerId={currentRunnerId} />
          </div>
        )}

        {/* Other Upcoming Events - Summary View */}
        {otherEvents.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                📅 Upcoming Runs
              </h2>
              <Link
                href="/events"
                className="text-sm text-white/90 hover:text-white font-semibold"
              >
                View All →
              </Link>
            </div>

            <div className="grid gap-4">
              {otherEvents.map((event: Event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20 hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <span>📅</span>
                          <span>
                            {new Date(event.event_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                            {' at '}
                            {new Date(event.event_date).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </p>
                        {event.location && (
                          <p className="flex items-center gap-2">
                            <span>📍</span>
                            <span>{event.location}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-purple-600 font-semibold text-sm">
                      View Details →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
