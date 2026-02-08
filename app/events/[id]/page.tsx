import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils/dates';
import { EventPhotos } from '@/components/events/EventPhotos';
import type { Event, EventPhoto } from '@/types/database';

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (eventError || !event) {
    notFound();
  }

  // Fetch photos
  const { data: photos } = await supabase
    .from('event_photos')
    .select('*')
    .eq('event_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Event Details */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-extrabold text-gray-900">{event.title}</h1>
            {event.is_past && (
              <span className="text-sm bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-bold">
                Past Event
              </span>
            )}
          </div>

          <div className="space-y-3 mb-4">
            <p className="text-gray-700 flex items-center gap-2">
              <span className="text-lg">📅</span>
              <span className="font-medium">
                {formatDateTime(event.event_date)}
              </span>
            </p>
            {event.location && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium hover:underline"
              >
                <span className="text-lg">📍</span>
                <span>{event.location}</span>
                <span className="text-sm">🗺️ Open in Maps</span>
              </a>
            )}
            {event.distance && (
              <div className="flex items-start gap-2">
                <span className="text-lg mt-0.5">🏃</span>
                <div className="flex flex-wrap gap-2">
                  {event.distance.split(', ').map((dist, idx) => (
                    <span
                      key={idx}
                      className="text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full shadow-md"
                    >
                      {dist}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {event.description && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}
        </div>

        {/* Photos Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📸 Photos</h2>
          <EventPhotos photos={photos || []} />
        </div>

        {/* Back Button */}
        <Link
          href="/events"
          className="inline-block bg-white/95 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all text-purple-600 hover:text-purple-700 font-bold border border-white/20"
        >
          ← Back to all events
        </Link>
      </div>
    </div>
  );
}
