'use client';

import { useState } from 'react';
import { EventPhoto } from '@/types/database';

interface EventPhotosProps {
  photos: EventPhoto[];
}

export function EventPhotos({ photos }: EventPhotosProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<EventPhoto | null>(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600">No photos yet for this event.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
          >
            <img
              src={photo.photo_url}
              alt={photo.caption || 'Event photo'}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
            onClick={() => setSelectedPhoto(null)}
          >
            ×
          </button>
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedPhoto.photo_url}
              alt={selectedPhoto.caption || 'Event photo'}
              className="max-w-full max-h-[90vh] object-contain"
            />
            {selectedPhoto.caption && (
              <p className="text-white text-center mt-4">
                {selectedPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
