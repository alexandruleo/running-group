'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import type { Event, EventRegistrationWithRunner } from '@/types/database';

interface EventRegistrationProps {
  event: Event;
  currentRunnerId: string | null;
}

export function EventRegistration({ event, currentRunnerId }: EventRegistrationProps) {
  const { user } = useUser();
  const [registrations, setRegistrations] = useState<EventRegistrationWithRunner[]>([]);
  const [userRegistration, setUserRegistration] = useState<any>(null);
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState('');
  const [selectedDistances, setSelectedDistances] = useState<string[]>([]); // For multi-select
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse available distances from event
  const availableDistances = event.distance
    ? event.distance.split(',').map((d) => d.trim())
    : [];

  // Check if this is a recurring event (multi-select)
  const isRecurring = event.is_recurring === true;

  // Check if event has started or is past
  const eventDate = new Date(event.event_date);
  const now = new Date();
  const canRegister = !event.is_past && eventDate > now;

  useEffect(() => {
    fetchRegistrations();
  }, [event.id]);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}/registrations`);
      const data = await response.json();

      console.log('EventRegistration Component - Received data:', {
        ok: response.ok,
        registrationsCount: data.registrations?.length || 0,
        userRegistration: data.userRegistration ? 'FOUND' : 'NULL',
        userRegistrationData: data.userRegistration,
      });

      if (response.ok) {
        setRegistrations(data.registrations || []);
        setUserRegistration(data.userRegistration);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (distanceOrDistances?: string | string[]) => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    // Determine what to send based on event type
    let payload: any;
    if (isRecurring) {
      // Multi-select: use the selectedDistances state or passed array
      const distances = Array.isArray(distanceOrDistances)
        ? distanceOrDistances
        : selectedDistances;

      if (distances.length === 0) {
        setError('Please select at least one option');
        setIsSubmitting(false);
        return;
      }
      payload = { selected_distances: distances };
    } else {
      // Single select: use passed distance or selectedDistance state
      const distance = typeof distanceOrDistances === 'string'
        ? distanceOrDistances
        : selectedDistance;
      payload = { selected_distance: distance };
    }

    try {
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setShowDistanceModal(false);
        await fetchRegistrations();
      } else {
        setError(data.error || 'Failed to register');
      }
    } catch (error) {
      console.error('Error registering:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnregister = async () => {
    if (!user || isSubmitting) return;

    if (!confirm('Are you sure you want to cancel your registration?')) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${event.id}/unregister`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        await fetchRegistrations();
      } else {
        setError(data.error || 'Failed to unregister');
      }
    } catch (error) {
      console.error('Error unregistering:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDistanceModal = () => {
    if (!isRecurring && availableDistances.length === 1) {
      // If only one distance and not recurring, register directly
      handleRegister(availableDistances[0]);
    } else {
      // Initialize selections based on event type
      if (isRecurring) {
        // Multi-select: initialize with existing selections
        const existing = userRegistration?.selected_distances ||
          (userRegistration?.selected_distance ? [userRegistration.selected_distance] : []);
        setSelectedDistances(existing);
      } else {
        // Single select: initialize with first or existing
        setSelectedDistance(userRegistration?.selected_distance || availableDistances[0]);
      }
      setShowDistanceModal(true);
    }
  };

  // Toggle distance in multi-select
  const toggleDistance = (distance: string) => {
    setSelectedDistances((prev) =>
      prev.includes(distance)
        ? prev.filter((d) => d !== distance)
        : [...prev, distance]
    );
  };

  // Group registrations by distance
  // Handle both single and multiple selections
  const registrationsByDistance: Record<string, EventRegistrationWithRunner[]> = {};
  registrations.forEach((reg) => {
    // Check if user selected multiple distances (new format)
    if (reg.selected_distances && Array.isArray(reg.selected_distances)) {
      // Add user to each distance they selected
      reg.selected_distances.forEach((distance: string) => {
        if (!registrationsByDistance[distance]) {
          registrationsByDistance[distance] = [];
        }
        registrationsByDistance[distance].push(reg);
      });
    } else {
      // Fall back to single distance (legacy format)
      const distance = reg.selected_distance;
      if (!registrationsByDistance[distance]) {
        registrationsByDistance[distance] = [];
      }
      registrationsByDistance[distance].push(reg);
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🏃 Event Registration
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {!user ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-center">
            Please sign in to register for this event
          </div>
        ) : !canRegister ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-center">
            Registration is closed for this event
          </div>
        ) : userRegistration ? (
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <div className="flex flex-col gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800 mb-2">✅ You're registered!</p>
                  {isRecurring && userRegistration.selected_distances ? (
                    <div className="flex flex-wrap gap-2">
                      {userRegistration.selected_distances.map((dist: string) => (
                        <span
                          key={dist}
                          className="inline-block text-sm font-bold bg-white text-green-700 px-3 py-1.5 rounded-full shadow-sm border border-green-200"
                        >
                          {dist}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-green-900">
                      {userRegistration.selected_distance}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={openDistanceModal}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-white text-green-700 rounded-lg font-semibold text-sm hover:bg-green-50 transition-all shadow-sm disabled:opacity-50"
                  >
                    {isRecurring ? 'Change Options' : 'Change Distance'}
                  </button>
                  <button
                    onClick={handleUnregister}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-red-600 rounded-lg font-semibold text-sm hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={openDistanceModal}
            disabled={isSubmitting || availableDistances.length === 0}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🏃 Register for this Event
          </button>
        )}

        {/* Attendee List */}
        {registrations.length > 0 && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              👥 Who's Running ({registrations.length})
            </h3>

            <div className="space-y-4">
              {Object.entries(registrationsByDistance).map(([distance, regs]) => (
                <div key={distance}>
                  <h4 className="text-sm font-bold text-gray-700 mb-2">
                    {distance} ({regs.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {regs.map((reg) => (
                      <div
                        key={reg.id}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-full px-3 py-2 shadow-sm border border-purple-100"
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                          {reg.runner.avatar_url ? (
                            <img
                              src={reg.runner.avatar_url}
                              alt={reg.runner.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-white">
                              {reg.runner.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">
                          {reg.runner.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Distance Selection Modal */}
      {showDistanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {isRecurring ? 'Select Your Options' : 'Select Your Distance'}
            </h3>

            {isRecurring && (
              <p className="text-sm text-gray-600 mb-4">
                You can select multiple options
              </p>
            )}

            <div className="space-y-3 mb-6">
              {isRecurring ? (
                // Multi-select with checkboxes for recurring events
                availableDistances.map((distance) => {
                  const isChecked = selectedDistances.includes(distance);
                  return (
                    <label
                      key={distance}
                      className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50"
                      style={{
                        borderColor: isChecked ? '#10b981' : '#e5e7eb',
                        backgroundColor: isChecked ? '#ecfdf5' : 'white',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDistance(distance)}
                        className="w-5 h-5 text-green-600 rounded"
                      />
                      <span className="text-lg font-semibold text-gray-900">
                        {distance}
                      </span>
                    </label>
                  );
                })
              ) : (
                // Single-select with radio buttons for regular events
                availableDistances.map((distance) => (
                  <label
                    key={distance}
                    className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50"
                    style={{
                      borderColor: selectedDistance === distance ? '#10b981' : '#e5e7eb',
                      backgroundColor: selectedDistance === distance ? '#ecfdf5' : 'white',
                    }}
                  >
                    <input
                      type="radio"
                      name="distance"
                      value={distance}
                      checked={selectedDistance === distance}
                      onChange={(e) => setSelectedDistance(e.target.value)}
                      className="w-5 h-5 text-green-600"
                    />
                    <span className="text-lg font-semibold text-gray-900">
                      {distance}
                    </span>
                  </label>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDistanceModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRegister(isRecurring ? selectedDistances : selectedDistance)}
                disabled={isSubmitting || (isRecurring ? selectedDistances.length === 0 : !selectedDistance)}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Registering...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
