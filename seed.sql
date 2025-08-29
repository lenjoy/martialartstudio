-- Sample data for Martial Arts Studio

-- Insert sample coaches
INSERT OR IGNORE INTO coaches (name, email, phone, bio, martial_arts_background, specialties, years_experience, photo_url) VALUES 
  (
    'Sarah Chen', 
    'sarah.chen@martialartsstudio.com', 
    '+1-555-0101',
    'Master Sarah has been practicing martial arts since childhood and holds black belts in multiple disciplines. She specializes in traditional forms and self-defense techniques.',
    'Started training in Karate at age 6, achieved black belt at 16. Later studied Kung Fu in China for 3 years and earned instructor certification in Krav Maga.',
    '["Karate", "Kung Fu", "Krav Maga", "Self-Defense"]',
    15,
    '/static/images/sarah-chen.jpg'
  ),
  (
    'Marcus Johnson', 
    'marcus.johnson@martialartsstudio.com', 
    '+1-555-0102',
    'Former MMA competitor turned instructor, Marcus brings high-energy training and real combat experience to his classes.',
    'Professional MMA fighter for 8 years with a record of 12-3. Specialized in Brazilian Jiu-Jitsu and Muay Thai. Retired from competition to focus on teaching.',
    '["MMA", "Brazilian Jiu-Jitsu", "Muay Thai", "Wrestling"]',
    12,
    '/static/images/marcus-johnson.jpg'
  ),
  (
    'Elena Rodriguez', 
    'elena.rodriguez@martialartsstudio.com', 
    '+1-555-0103',
    'Traditional Taekwondo master with Olympic coaching experience. Elena focuses on discipline, flexibility, and precise technique.',
    'Olympic Taekwondo team coach for Team USA. 4th Dan Black Belt in Taekwondo with expertise in forms, sparring, and breaking techniques.',
    '["Taekwondo", "Olympic Sparring", "Forms", "Flexibility Training"]',
    18,
    '/static/images/elena-rodriguez.jpg'
  ),
  (
    'David Kim', 
    'david.kim@martialartsstudio.com', 
    '+1-555-0104',
    'Aikido and Judo specialist focusing on throws, joint locks, and the philosophical aspects of martial arts.',
    'Studied Aikido and Judo in Japan for 10 years under renowned masters. Holds 3rd Dan in Aikido and 2nd Dan in Judo.',
    '["Aikido", "Judo", "Joint Locks", "Meditation"]',
    20,
    '/static/images/david-kim.jpg'
  );

-- Insert sample availability slots (Monday to Friday, various times)
INSERT OR IGNORE INTO availability_slots (coach_id, day_of_week, start_time, end_time) VALUES
  -- Sarah Chen - Monday, Wednesday, Friday
  (1, 1, '09:00', '17:00'), -- Monday
  (1, 3, '09:00', '17:00'), -- Wednesday
  (1, 5, '09:00', '17:00'), -- Friday
  -- Marcus Johnson - Tuesday, Thursday, Saturday
  (2, 2, '10:00', '18:00'), -- Tuesday
  (2, 4, '10:00', '18:00'), -- Thursday
  (2, 6, '08:00', '16:00'), -- Saturday
  -- Elena Rodriguez - Monday, Tuesday, Wednesday, Thursday
  (3, 1, '14:00', '20:00'), -- Monday
  (3, 2, '14:00', '20:00'), -- Tuesday
  (3, 3, '14:00', '20:00'), -- Wednesday
  (3, 4, '14:00', '20:00'), -- Thursday
  -- David Kim - Wednesday, Thursday, Friday, Saturday
  (4, 3, '08:00', '16:00'), -- Wednesday
  (4, 4, '08:00', '16:00'), -- Thursday
  (4, 5, '08:00', '16:00'), -- Friday
  (4, 6, '10:00', '18:00'); -- Saturday

-- Insert sample students
INSERT OR IGNORE INTO students (name, email, phone, experience_level) VALUES
  ('John Smith', 'john.smith@email.com', '+1-555-1001', 'beginner'),
  ('Lisa Wang', 'lisa.wang@email.com', '+1-555-1002', 'intermediate'),
  ('Mike Brown', 'mike.brown@email.com', '+1-555-1003', 'advanced'),
  ('Anna Davis', 'anna.davis@email.com', '+1-555-1004', 'beginner'),
  ('Carlos Martinez', 'carlos.martinez@email.com', '+1-555-1005', 'intermediate');

-- Insert sample class types
INSERT OR IGNORE INTO class_types (name, description, duration, price, max_participants) VALUES
  ('Private Lesson', 'One-on-one training session with personalized instruction', 60, 80.00, 1),
  ('Semi-Private (2-3 people)', 'Small group training for friends or family', 60, 60.00, 3),
  ('Group Class', 'Regular group class with up to 8 students', 75, 35.00, 8),
  ('Sparring Session', 'Controlled sparring practice for intermediate+ students', 90, 45.00, 6),
  ('Forms Workshop', 'Intensive workshop focusing on traditional forms', 120, 55.00, 10);

-- Insert some sample bookings (upcoming classes)
INSERT OR IGNORE INTO bookings (student_id, coach_id, booking_date, start_time, end_time, class_type, notes) VALUES
  (1, 1, '2024-08-30', '10:00', '11:00', 'private', 'First lesson - focus on basics'),
  (2, 2, '2024-08-31', '11:00', '12:00', 'private', 'Continue working on grappling techniques'),
  (3, 3, '2024-09-01', '15:00', '16:15', 'group', 'Advanced Taekwondo class'),
  (4, 4, '2024-09-02', '09:00', '10:00', 'private', 'Introduction to Aikido philosophy'),
  (5, 1, '2024-09-03', '14:00', '15:00', 'private', 'Karate kata practice');