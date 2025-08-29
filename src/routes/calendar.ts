import { Hono } from 'hono';
import type { Bindings } from '../types';
import { mockCoaches, mockAvailabilitySlots, demoBookings } from '../mockData';

const calendar = new Hono<{ Bindings: Bindings }>();

// Interface for calendar slot
interface CalendarSlot {
  coach_id: number;
  coach_name: string;
  coach_specialties: string[];
  time_slot: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked' | 'unavailable';
  booking_id?: number;
  student_name?: string;
  class_type?: string;
}

// Interface for daily calendar view
interface DailyCalendar {
  date: string;
  day_of_week: number;
  day_name: string;
  total_coaches: number;
  available_slots: number;
  booked_slots: number;
  time_slots: {
    [time: string]: CalendarSlot[];
  };
  coaches_summary: {
    coach_id: number;
    coach_name: string;
    specialties: string[];
    total_slots: number;
    available_slots: number;
    booked_slots: number;
  }[];
}

// Get daily calendar view for all coaches
calendar.get('/daily', async (c) => {
  const date = c.req.query('date'); // YYYY-MM-DD format
  
  if (!date) {
    return c.json({ success: false, error: 'Date parameter is required' }, 400);
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return c.json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
  }

  try {
    const dayOfWeek = new Date(date).getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    let coaches: any[] = [];
    let availabilitySlots: any[] = [];
    let bookings: any[] = [];

    if (c.env.DB) {
      // Use database
      const coachesResult = await c.env.DB.prepare(`
        SELECT * FROM coaches WHERE active = TRUE ORDER BY name
      `).all();
      coaches = coachesResult.results.map((coach: any) => ({
        ...coach,
        specialties: coach.specialties ? JSON.parse(coach.specialties) : []
      }));

      const availabilityResult = await c.env.DB.prepare(`
        SELECT * FROM availability_slots 
        WHERE day_of_week = ? AND active = TRUE 
        ORDER BY coach_id, start_time
      `).bind(dayOfWeek).all();
      availabilitySlots = availabilityResult.results;

      const bookingsResult = await c.env.DB.prepare(`
        SELECT b.*, s.name as student_name 
        FROM bookings b
        LEFT JOIN students s ON b.student_id = s.id
        WHERE b.booking_date = ? AND b.status = 'confirmed'
        ORDER BY b.coach_id, b.start_time
      `).bind(date).all();
      bookings = bookingsResult.results;
    } else {
      // Use mock data
      coaches = mockCoaches;
      availabilitySlots = mockAvailabilitySlots.filter(slot => 
        slot.day_of_week === dayOfWeek && slot.active
      );
      bookings = demoBookings.filter(booking => 
        booking.booking_date === date && booking.status === 'confirmed'
      );
    }

    // Build calendar data
    const calendar: DailyCalendar = {
      date,
      day_of_week: dayOfWeek,
      day_name: dayNames[dayOfWeek],
      total_coaches: coaches.length,
      available_slots: 0,
      booked_slots: bookings.length,
      time_slots: {},
      coaches_summary: []
    };

    // Generate time slots for each coach
    const allTimeSlots = new Set<string>();
    
    for (const coach of coaches) {
      const coachAvailability = availabilitySlots.filter(slot => slot.coach_id === coach.id);
      const coachBookings = bookings.filter(booking => booking.coach_id === coach.id);
      
      let coachTotalSlots = 0;
      let coachAvailableSlots = 0;
      let coachBookedSlots = coachBookings.length;

      for (const availability of coachAvailability) {
        const slotStart = parseTime(availability.start_time);
        const slotEnd = parseTime(availability.end_time);
        const duration = availability.slot_duration || 60;
        
        let currentTime = slotStart;
        
        while (currentTime + duration <= slotEnd) {
          const startTimeStr = formatTime(currentTime);
          const endTimeStr = formatTime(currentTime + duration);
          const timeSlotKey = startTimeStr;
          
          allTimeSlots.add(timeSlotKey);
          coachTotalSlots++;
          
          // Check if this slot is booked
          const booking = coachBookings.find(b => 
            timeOverlap(startTimeStr, endTimeStr, b.start_time, b.end_time)
          );
          
          const slot: CalendarSlot = {
            coach_id: coach.id,
            coach_name: coach.name,
            coach_specialties: coach.specialties,
            time_slot: `${startTimeStr} - ${endTimeStr}`,
            start_time: startTimeStr,
            end_time: endTimeStr,
            status: booking ? 'booked' : 'available',
            booking_id: booking?.id,
            student_name: booking?.student_name,
            class_type: booking?.class_type || 'private'
          };

          if (!calendar.time_slots[timeSlotKey]) {
            calendar.time_slots[timeSlotKey] = [];
          }
          calendar.time_slots[timeSlotKey].push(slot);
          
          if (!booking) {
            coachAvailableSlots++;
          }
          
          currentTime += duration;
        }
      }

      // Add coach summary
      calendar.coaches_summary.push({
        coach_id: coach.id,
        coach_name: coach.name,
        specialties: coach.specialties,
        total_slots: coachTotalSlots,
        available_slots: coachAvailableSlots,
        booked_slots: coachBookedSlots
      });
    }

    // Calculate total available slots
    calendar.available_slots = calendar.coaches_summary.reduce(
      (sum, coach) => sum + coach.available_slots, 0
    );

    // Sort time slots
    const sortedTimeSlots = Array.from(allTimeSlots).sort((a, b) => {
      return parseTime(a) - parseTime(b);
    });

    const sortedCalendarSlots: { [time: string]: CalendarSlot[] } = {};
    for (const timeSlot of sortedTimeSlots) {
      if (calendar.time_slots[timeSlot]) {
        sortedCalendarSlots[timeSlot] = calendar.time_slots[timeSlot].sort((a, b) => 
          a.coach_name.localeCompare(b.coach_name)
        );
      }
    }
    calendar.time_slots = sortedCalendarSlots;

    return c.json({ success: true, calendar });
  } catch (error) {
    console.error('Error fetching daily calendar:', error);
    return c.json({ success: false, error: 'Failed to fetch daily calendar' }, 500);
  }
});

// Get weekly calendar view
calendar.get('/weekly', async (c) => {
  const startDate = c.req.query('start_date'); // YYYY-MM-DD format for week start
  
  if (!startDate) {
    return c.json({ success: false, error: 'start_date parameter is required' }, 400);
  }

  try {
    const weeklyCalendar = [];
    const start = new Date(startDate);
    
    // Generate 7 days starting from start_date
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Get daily calendar for each day
      const dailyResponse = await fetch(
        `${c.req.url.replace('/weekly', '/daily')}?date=${dateString}`,
        { headers: c.req.header() }
      );
      
      if (dailyResponse.ok) {
        const dailyData = await dailyResponse.json();
        weeklyCalendar.push(dailyData.calendar);
      }
    }

    return c.json({ success: true, weekly_calendar: weeklyCalendar });
  } catch (error) {
    console.error('Error fetching weekly calendar:', error);
    return c.json({ success: false, error: 'Failed to fetch weekly calendar' }, 500);
  }
});

// Get coach availability summary for a date range
calendar.get('/summary', async (c) => {
  const startDate = c.req.query('start_date');
  const endDate = c.req.query('end_date');
  
  if (!startDate || !endDate) {
    return c.json({ 
      success: false, 
      error: 'start_date and end_date parameters are required' 
    }, 400);
  }

  try {
    let coaches: any[] = [];
    
    if (c.env.DB) {
      const coachesResult = await c.env.DB.prepare(`
        SELECT id, name, specialties FROM coaches WHERE active = TRUE ORDER BY name
      `).all();
      coaches = coachesResult.results.map((coach: any) => ({
        ...coach,
        specialties: coach.specialties ? JSON.parse(coach.specialties) : []
      }));
    } else {
      coaches = mockCoaches.map(coach => ({
        id: coach.id,
        name: coach.name,
        specialties: coach.specialties
      }));
    }

    const summary = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (const coach of coaches) {
      let totalSlots = 0;
      let availableSlots = 0;
      let bookedSlots = 0;
      
      const current = new Date(start);
      while (current <= end) {
        const dateString = current.toISOString().split('T')[0];
        
        // This would need to be optimized for production with batch queries
        // For now, we'll provide a simplified version
        totalSlots += 8; // Assume 8 potential slots per day
        availableSlots += 6; // Simplified calculation
        bookedSlots += 2; // Simplified calculation
        
        current.setDate(current.getDate() + 1);
      }
      
      summary.push({
        coach_id: coach.id,
        coach_name: coach.name,
        specialties: coach.specialties,
        date_range: `${startDate} to ${endDate}`,
        total_slots: totalSlots,
        available_slots: availableSlots,
        booked_slots: bookedSlots,
        utilization_rate: totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0
      });
    }

    return c.json({ success: true, summary });
  } catch (error) {
    console.error('Error fetching calendar summary:', error);
    return c.json({ success: false, error: 'Failed to fetch calendar summary' }, 500);
  }
});

// Helper functions
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function timeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const start1Minutes = parseTime(start1);
  const end1Minutes = parseTime(end1);
  const start2Minutes = parseTime(start2);
  const end2Minutes = parseTime(end2);
  
  return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
}

export default calendar;