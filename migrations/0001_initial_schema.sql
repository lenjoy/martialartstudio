-- Martial Arts Studio Database Schema

-- Coaches table - stores coach information and profiles
CREATE TABLE IF NOT EXISTS coaches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  bio TEXT,
  martial_arts_background TEXT NOT NULL,
  specialties TEXT, -- JSON array of specialties
  years_experience INTEGER DEFAULT 0,
  photo_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Availability slots table - defines when coaches are available
CREATE TABLE IF NOT EXISTS availability_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coach_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time TIME NOT NULL, -- format: HH:MM
  end_time TIME NOT NULL, -- format: HH:MM
  slot_duration INTEGER DEFAULT 60, -- duration in minutes
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE
);

-- Students table - stores student information
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  experience_level TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table - stores class bookings/appointments
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  coach_id INTEGER NOT NULL,
  booking_date DATE NOT NULL, -- format: YYYY-MM-DD
  start_time TIME NOT NULL, -- format: HH:MM
  end_time TIME NOT NULL, -- format: HH:MM
  class_type TEXT DEFAULT 'private', -- private, group, seminar
  status TEXT DEFAULT 'confirmed', -- confirmed, cancelled, completed
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE
);

-- Class types table - defines different types of classes offered
CREATE TABLE IF NOT EXISTS class_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER DEFAULT 60, -- duration in minutes
  price DECIMAL(10,2),
  max_participants INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coaches_active ON coaches(active);
CREATE INDEX IF NOT EXISTS idx_coaches_email ON coaches(email);
CREATE INDEX IF NOT EXISTS idx_availability_coach_day ON availability_slots(coach_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_availability_active ON availability_slots(active);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_bookings_coach_date ON bookings(coach_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_student ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_class_types_active ON class_types(active);