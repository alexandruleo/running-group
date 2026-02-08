import { createClient } from '@/lib/supabase/server';
import { WeeklySurvey } from '@/components/survey/WeeklySurvey';
import { EventCard } from '@/components/events/EventCard';
import type { Event } from '@/types/database';

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch upcoming events (limit to 3)
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .eq('is_past', false)
    .order('event_date', { ascending: true })
    .limit(3);

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

        {/* Upcoming Events */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Upcoming Runs
              </h2>
              <a
                href="/events"
                className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
              >
                View All →
              </a>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event: Event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4">
          <a
            href="/runners"
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all text-center border border-white/20"
          >
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-bold text-gray-900 text-lg">Runners</h3>
            <p className="text-sm text-gray-600 mt-2">
              Meet your running crew
            </p>
          </a>
          <a
            href="/events"
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all text-center border border-white/20"
          >
            <div className="text-4xl mb-3">📅</div>
            <h3 className="font-bold text-gray-900 text-lg">Events</h3>
            <p className="text-sm text-gray-600 mt-2">
              View all runs & photos
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
