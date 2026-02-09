'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LocationAutocomplete } from './LocationAutocomplete';
import { Event } from '@/types/database';

interface EventEditFormProps {
  event: Event;
}

export function EventEditForm({ event }: EventEditFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [eventDate, setEventDate] = useState(
    new Date(event.event_date).toISOString().slice(0, 16)
  );
  const [location, setLocation] = useState(event.location || '');
  const [distances, setDistances] = useState<string[]>(
    event.distance ? event.distance.split(', ') : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      // Update event
      const { error: updateError } = await supabase
        .from('events')
        .update({
          title,
          description,
          event_date: new Date(eventDate).toISOString(),
          location,
          distance: distances.join(', '),
          is_past: new Date(eventDate) < new Date(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', event.id);

      if (updateError) {
        console.error('Event update error:', updateError);
        throw new Error(`Failed to update event: ${updateError.message}`);
      }

      router.push(`/events/${event.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">{error}</div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Event Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Weekend Long Run"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
        />
      </div>

      {/* Date & Time */}
      <div>
        <label
          htmlFor="eventDate"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Date & Time *
        </label>
        <input
          type="datetime-local"
          id="eventDate"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
        />
      </div>

      {/* Location with Autocomplete */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <LocationAutocomplete value={location} onChange={setLocation} />
      </div>

      {/* Distance - Multiple Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Distance Options (select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            '5K',
            '10K',
            '15K',
            'Half Marathon',
            'Marathon',
            'Ultra Marathon',
            'Easy Run',
            'Track Workout',
            'Trail Run',
          ].map((dist) => (
            <label
              key={dist}
              className={`flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                distances.includes(dist)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 bg-white hover:border-purple-300'
              }`}
            >
              <input
                type="checkbox"
                checked={distances.includes(dist)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setDistances([...distances, dist]);
                  } else {
                    setDistances(distances.filter((d) => d !== dist));
                  }
                }}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-900">{dist}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Tell everyone about this run..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg font-bold"
        >
          {isSubmitting ? '💾 Saving...' : '✅ Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-6 py-4 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:scale-105 transition-all shadow-lg font-bold"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
