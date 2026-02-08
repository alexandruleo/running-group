'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LocationAutocomplete } from './LocationAutocomplete';

interface EventCreateFormProps {
  runnerId: string;
}

export function EventCreateForm({ runnerId }: EventCreateFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [distances, setDistances] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setPhotoFiles((prev) => [...prev, ...files]);

      // Generate previews
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      // Create event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          title,
          description,
          event_date: new Date(eventDate).toISOString(),
          location,
          distance: distances.join(', '),
          created_by: runnerId,
          is_past: new Date(eventDate) < new Date(),
        })
        .select()
        .single();

      if (eventError) {
        console.error('Event creation error:', eventError);
        throw new Error(`Failed to create event: ${eventError.message}`);
      }

      // Upload photos if any
      if (photoFiles.length > 0) {
        for (const file of photoFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${event.id}-${Date.now()}-${Math.random()
            .toString(36)
            .substring(7)}.${fileExt}`;

          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('event-photos')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.error('Error uploading photo:', uploadError);
            continue;
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from('event-photos').getPublicUrl(fileName);

          // Save photo record
          await supabase.from('event_photos').insert({
            event_id: event.id,
            photo_url: publicUrl,
            uploaded_by: runnerId,
          });
        }
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

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos
        </label>
        <div className="space-y-3">
          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-block">
            <span className="text-sm text-gray-700">Add Photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg font-bold"
        >
          {isSubmitting ? '✨ Creating...' : '🎉 Create Event'}
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
