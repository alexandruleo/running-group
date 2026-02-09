'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserPhotoUploadProps {
  eventId: string;
  runnerId: string;
  isRegistered: boolean;
  eventDate: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function UserPhotoUpload({
  eventId,
  runnerId,
  isRegistered,
  eventDate,
}: UserPhotoUploadProps) {
  const router = useRouter();
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const eventHasStarted = new Date(eventDate) <= new Date();
  const canUpload = isRegistered && eventHasStarted;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + photoFiles.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    // Validate files
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Only images (JPEG, PNG, WebP) are allowed`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large: ${file.name}. Maximum size is 5MB`);
        return;
      }
    }

    setError(null);
    setPhotoFiles((prev) => [...prev, ...files]);

    // Generate previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (photoFiles.length === 0) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      photoFiles.forEach((file) => {
        formData.append('photos', file);
      });

      const response = await fetch(`/api/events/${eventId}/photos/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Successfully uploaded ${data.count} photo(s)!`);
        setPhotoFiles([]);
        setPhotoPreviews([]);
        // Refresh the page to show new photos
        router.refresh();
      } else {
        setError(data.error || 'Failed to upload photos');
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Don't show anything if user is not registered
  if (!isRegistered) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          📸 Add Your Photos
        </h2>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-center">
          Register for this event to upload photos
        </div>
      </div>
    );
  }

  // Show message if event hasn't started yet
  if (!eventHasStarted) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          📸 Add Your Photos
        </h2>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-center">
          <p className="font-semibold mb-1">Photo uploads available during/after the event</p>
          <p className="text-sm">
            ⏰ Event starts: {new Date(eventDate).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        📸 Add Your Photos
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* File Input */}
      <div className="mb-4">
        <label
          htmlFor="photo-upload"
          className="block w-full py-4 px-4 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
        >
          <span className="text-gray-600 font-medium">
            📁 Choose Photos (Max {MAX_FILES}, up to 5MB each)
          </span>
          <input
            id="photo-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handlePhotoChange}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Preview Grid */}
      {photoPreviews.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Selected Photos ({photoFiles.length}/{MAX_FILES})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photoPreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg shadow-md"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold hover:bg-red-600"
                  disabled={isUploading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {photoFiles.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-bold hover:from-purple-600 hover:to-blue-700 transition-all shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : `Upload ${photoFiles.length} Photo${photoFiles.length > 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
}
