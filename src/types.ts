// TypeScript type definitions for the Martial Arts Studio

export interface Coach {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  martial_arts_background: string;
  specialties: string[]; // JSON array
  years_experience: number;
  photo_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySlot {
  id: number;
  coach_id: number;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  slot_duration: number; // minutes
  active: boolean;
  created_at: string;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
}

export interface Booking {
  id: number;
  student_id: number;
  coach_id: number;
  booking_date: string; // YYYY-MM-DD format
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  class_type: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ClassType {
  id: number;
  name: string;
  description?: string;
  duration: number; // minutes
  price: number;
  max_participants: number;
  active: boolean;
  created_at: string;
}

// Extended types with joined data
export interface CoachWithAvailability extends Coach {
  availability: AvailabilitySlot[];
}

export interface BookingWithDetails extends Booking {
  coach_name: string;
  student_name: string;
  student_email: string;
}

// API Request/Response types
export interface CreateCoachRequest {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  martial_arts_background: string;
  specialties: string[];
  years_experience: number;
  photo_url?: string;
}

export interface CreateBookingRequest {
  student_name: string;
  student_email: string;
  student_phone?: string;
  experience_level?: 'beginner' | 'intermediate' | 'advanced';
  coach_id: number;
  booking_date: string;
  start_time: string;
  class_type?: string;
  notes?: string;
}

export interface AvailableSlot {
  coach_id: number;
  coach_name: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
}

// Cloudflare bindings
export type Bindings = {
  DB: D1Database;
};