'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import type { Survey, SurveyResponse, Runner } from '@/types/database';

interface SurveyWithResponses extends Survey {
  responses: Array<SurveyResponse & { runner: Runner }>;
}

export function WeeklySurvey() {
  const { user } = useUser();
  const [survey, setSurvey] = useState<SurveyWithResponses | null>(null);
  const [userResponse, setUserResponse] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchActiveSurvey();
  }, [user]);

  const fetchActiveSurvey = async () => {
    try {
      const response = await fetch('/api/survey/active');
      const data = await response.json();

      if (data.survey) {
        setSurvey(data.survey);
        // Check if user already responded
        const existingResponse = data.survey.responses.find(
          (r: SurveyResponse) => r.runner_id === data.currentRunnerId
        );
        if (existingResponse) {
          setUserResponse(existingResponse.is_coming);
        }
      }
    } catch (error) {
      console.error('Error fetching survey:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = async (isComing: boolean) => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/survey/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_coming: isComing }),
      });

      if (response.ok) {
        setUserResponse(isComing);
        // Refresh survey data
        await fetchActiveSurvey();
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return null;
  }

  const comingRunners = survey.responses
    .filter((r) => r.is_coming)
    .map((r) => r.runner);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {survey.question}
      </h2>

      {/* Response Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => handleResponse(true)}
          disabled={isSubmitting}
          className={`flex-1 py-4 rounded-xl font-bold transition-all shadow-lg ${
            userResponse === true
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white scale-105'
              : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-105'
          } disabled:opacity-50`}
        >
          ✅ I'm Coming
        </button>
        <button
          onClick={() => handleResponse(false)}
          disabled={isSubmitting}
          className={`flex-1 py-4 rounded-xl font-bold transition-all shadow-lg ${
            userResponse === false
              ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white scale-105'
              : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-105'
          } disabled:opacity-50`}
        >
          ❌ Can't Make It
        </button>
      </div>

      {/* Who's Coming */}
      {comingRunners.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            🎉 Who's Coming ({comingRunners.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {comingRunners.map((runner) => (
              <div
                key={runner.id}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-full px-3 py-2 shadow-sm border border-purple-100"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                  {runner.avatar_url ? (
                    <img
                      src={runner.avatar_url}
                      alt={runner.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-white">
                      {runner.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-800">{runner.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
