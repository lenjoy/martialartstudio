// Mock data for demonstration when database is not available

export const mockCoaches = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@martialartsstudio.com",
    phone: "+1-555-0101",
    bio: "Master Sarah has been practicing martial arts since childhood and holds black belts in multiple disciplines. She specializes in traditional forms and self-defense techniques.",
    martial_arts_background: "Started training in Karate at age 6, achieved black belt at 16. Later studied Kung Fu in China for 3 years and earned instructor certification in Krav Maga.",
    specialties: ["Karate", "Kung Fu", "Krav Maga", "Self-Defense"],
    years_experience: 15,
    photo_url: "/static/images/sarah-chen.jpg",
    active: true,
    created_at: "2025-08-29 09:38:22",
    updated_at: "2025-08-29 09:38:22"
  },
  {
    id: 2,
    name: "Marcus Johnson",
    email: "marcus.johnson@martialartsstudio.com",
    phone: "+1-555-0102",
    bio: "Former MMA competitor turned instructor, Marcus brings high-energy training and real combat experience to his classes.",
    martial_arts_background: "Professional MMA fighter for 8 years with a record of 12-3. Specialized in Brazilian Jiu-Jitsu and Muay Thai. Retired from competition to focus on teaching.",
    specialties: ["MMA", "Brazilian Jiu-Jitsu", "Muay Thai", "Wrestling"],
    years_experience: 12,
    photo_url: "/static/images/marcus-johnson.jpg",
    active: true,
    created_at: "2025-08-29 09:38:22",
    updated_at: "2025-08-29 09:38:22"
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    email: "elena.rodriguez@martialartsstudio.com",
    phone: "+1-555-0103",
    bio: "Traditional Taekwondo master with Olympic coaching experience. Elena focuses on discipline, flexibility, and precise technique.",
    martial_arts_background: "Olympic Taekwondo team coach for Team USA. 4th Dan Black Belt in Taekwondo with expertise in forms, sparring, and breaking techniques.",
    specialties: ["Taekwondo", "Olympic Sparring", "Forms", "Flexibility Training"],
    years_experience: 18,
    photo_url: "/static/images/elena-rodriguez.jpg",
    active: true,
    created_at: "2025-08-29 09:38:22",
    updated_at: "2025-08-29 09:38:22"
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@martialartsstudio.com",
    phone: "+1-555-0104",
    bio: "Aikido and Judo specialist focusing on throws, joint locks, and the philosophical aspects of martial arts.",
    martial_arts_background: "Studied Aikido and Judo in Japan for 10 years under renowned masters. Holds 3rd Dan in Aikido and 2nd Dan in Judo.",
    specialties: ["Aikido", "Judo", "Joint Locks", "Meditation"],
    years_experience: 20,
    photo_url: "/static/images/david-kim.jpg",
    active: true,
    created_at: "2025-08-29 09:38:22",
    updated_at: "2025-08-29 09:38:22"
  }
];

export const mockAvailabilitySlots = [
  // Sarah Chen - Monday, Wednesday, Friday
  { id: 1, coach_id: 1, day_of_week: 1, start_time: "09:00", end_time: "17:00", slot_duration: 60, active: true, created_at: "2025-08-29 09:38:22" },
  { id: 2, coach_id: 1, day_of_week: 3, start_time: "09:00", end_time: "17:00", slot_duration: 60, active: true, created_at: "2025-08-29 09:38:22" },
  { id: 3, coach_id: 1, day_of_week: 5, start_time: "09:00", end_time: "17:00", slot_duration: 60, active: true, created_at: "2025-08-29 09:38:22" },
  
  // Marcus Johnson - Tuesday, Thursday, Saturday
  { id: 4, coach_id: 2, day_of_week: 2, start_time: "10:00", end_time: "18:00", slot_duration: 60, active: true, created_at: "2025-08-29 09:38:22" },
  { id: 5, coach_id: 2, day_of_week: 4, start_time: "10:00", end_time: "18:00", slot_duration: 60, active: true, created_at: "2025-08-29 09:38:22" },
  { id: 6, coach_id: 2, day_of_week: 6, start_time: "08:00", end_time: "16:00", slot_duration: 60, active: true, created_at: "2025-08-29 09:38:22" },
  
  // Elena Rodriguez - Monday, Tuesday, Wednesday, Thursday
  { id: 7, coach_id: 3, day_of_week: 1, start_time: "14:00", end_time: "20:00", slot_duration: 60, active: true, created_at: "2025-08-29 09:38:22" },
  { id: 8, coach_id: 3, day_of_week: 2, start_time: "14:00", end_time: "20:00", slot_duration: 60, active: true, created_at: "2025-08-29 09:38:22" },
  { id: 9, coach_id: 3, day_of_week: 3, start_time: "14:00", end_time: "20:00", slot_duration: 60, active: true, created_at: "2025-08-29 09:38:22" },
  { id: 10, coach_id: 3, day_of_week: 4, start_time: "14:00", end_time: "20:00", slot_duration: 60, active: true, created_at: "2025-08-29 09:38:22" },
  
  // David Kim - Wednesday, Thursday, Friday, Saturday
  { id: 11, coach_id: 4, day_of_week: 3, start_time: "08:00", end_time: "16:00", slot_duration: 60, active: true, created_at: "2025-08-29 09:38:22" },
  { id: 12, coach_id: 4, day_of_week: 4, start_time: "08:00", end_time: "16:00", slot_duration: 60, active: true, created_at: "2025-08-29 09:38:22" },
  { id: 13, coach_id: 4, day_of_week: 5, start_time: "08:00", end_time: "16:00", slot_duration: 60, active: true, created_at: "2025-08-29 09:38:22" },
  { id: 14, coach_id: 4, day_of_week: 6, start_time: "10:00", end_time: "18:00", slot_duration: 60, active: true, created_at: "2025-08-29 09:38:22" }
];

export const mockBookings = [
  {
    id: 1,
    student_id: 1,
    coach_id: 1,
    booking_date: "2025-09-03",
    start_time: "14:00",
    end_time: "15:00",
    class_type: "private",
    status: "confirmed",
    notes: "Karate kata practice",
    created_at: "2025-08-29 09:38:22",
    updated_at: "2025-08-29 09:38:22"
  }
];

// Storage for demo bookings (in-memory, will reset on restart)
export let demoBookings = [...mockBookings];
let nextBookingId = 2;
let nextStudentId = 2;

export function addDemoBooking(booking: any) {
  const newBooking = {
    ...booking,
    id: nextBookingId++,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  demoBookings.push(newBooking);
  return newBooking;
}

export function createDemoStudent(studentData: any) {
  return {
    id: nextStudentId++,
    ...studentData,
    created_at: new Date().toISOString()
  };
}