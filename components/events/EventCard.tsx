import Link from 'next/link';
import { Event } from '@/types/database';
import { formatDateTime } from '@/lib/utils/dates';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-5 hover:shadow-2xl hover:scale-105 transition-all border border-white/20">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-gray-900 truncate">
              {event.title}
            </h3>
            <div className="mt-3 space-y-2">
              <p className="text-sm text-gray-700 flex items-center gap-2 font-medium">
                <span>📅</span>
                <span>{formatDateTime(event.event_date)}</span>
              </p>
              {event.location && (
                <div className="text-sm text-gray-700 flex items-center gap-2 font-medium">
                  <span>📍</span>
                  <span>{event.location}</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 ml-1"
                  >
                    🗺️
                  </a>
                </div>
              )}
              {event.distance && (
                <div className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">🏃</span>
                  <div className="flex flex-wrap gap-1.5">
                    {event.distance.split(', ').map((dist: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2.5 py-1 rounded-full shadow-sm"
                      >
                        {dist}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {event.description && (
              <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
          {event.is_past && (
            <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-bold">
              Past
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
