export interface Runner {
  id: string;
  clerk_user_id: string;
  email: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  distance?: string;
  created_by?: string;
  is_past: boolean;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  created_at: string;
  updated_at: string;
}

export interface EventPhoto {
  id: string;
  event_id: string;
  photo_url: string;
  caption?: string;
  uploaded_by?: string;
  created_at: string;
}

export interface Survey {
  id: string;
  question: string;
  survey_date: string;
  is_active: boolean;
  created_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  runner_id: string;
  is_coming: boolean;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  runner_id: string;
  selected_distance: string; // Legacy - single selection
  selected_distances?: string[]; // New - multiple selections
  status: 'registered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface EventRegistrationWithRunner extends EventRegistration {
  runner: Runner;
}
