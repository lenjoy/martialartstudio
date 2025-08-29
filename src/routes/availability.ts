import { Hono } from 'hono';
import type { Bindings, AvailabilitySlot, AvailableSlot } from '../types';

const availability = new Hono<{ Bindings: Bindings }>();

// Get availability for a specific coach
availability.get('/coach/:coach_id', async (c) => {
  const coach_id = c.req.param('coach_id');
  
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM availability_slots 
      WHERE coach_id = ? AND active = TRUE 
      ORDER BY day_of_week, start_time
    `).bind(coach_id).all();

    return c.json({ success: true, availability: results });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return c.json({ success: false, error: 'Failed to fetch availability' }, 500);
  }
});

// Get available slots for a specific date and optionally coach
availability.get('/slots', async (c) => {
  const date = c.req.query('date'); // YYYY-MM-DD format
  const coach_id = c.req.query('coach_id');
  
  if (!date) {
    return c.json({ success: false, error: 'Date parameter is required' }, 400);
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return c.json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
  }

  try {
    // Get day of week (0=Sunday, 1=Monday, etc.)
    const dayOfWeek = new Date(date).getDay();
    
    let query = `
      SELECT 
        a.coach_id,
        c.name as coach_name,
        a.day_of_week,
        a.start_time,
        a.end_time,
        a.slot_duration
      FROM availability_slots a
      JOIN coaches c ON a.coach_id = c.id
      WHERE a.day_of_week = ? 
        AND a.active = TRUE 
        AND c.active = TRUE
    `;
    
    const bindings = [dayOfWeek];
    
    if (coach_id) {
      query += ' AND a.coach_id = ?';
      bindings.push(coach_id);
    }
    
    query += ' ORDER BY c.name, a.start_time';

    const { results } = await c.env.DB.prepare(query).bind(...bindings).all();

    // Get existing bookings for the date to filter out unavailable slots
    let bookingsQuery = `
      SELECT coach_id, start_time, end_time 
      FROM bookings 
      WHERE booking_date = ? AND status = 'confirmed'
    `;
    
    const bookingBindings = [date];
    if (coach_id) {
      bookingsQuery += ' AND coach_id = ?';
      bookingBindings.push(coach_id);
    }

    const { results: existingBookings } = await c.env.DB.prepare(bookingsQuery)
      .bind(...bookingBindings).all();

    // Generate available time slots
    const availableSlots: AvailableSlot[] = [];
    
    for (const slot of results) {
      const slotStart = parseTime(slot.start_time);
      const slotEnd = parseTime(slot.end_time);
      const duration = slot.slot_duration || 60;
      
      // Generate time slots within the availability window
      let currentTime = slotStart;
      
      while (currentTime + duration <= slotEnd) {
        const startTimeStr = formatTime(currentTime);
        const endTimeStr = formatTime(currentTime + duration);
        
        // Check if this slot is already booked
        const isBooked = existingBookings.some((booking: any) => 
          booking.coach_id === slot.coach_id &&
          timeOverlap(startTimeStr, endTimeStr, booking.start_time, booking.end_time)
        );
        
        if (!isBooked) {
          availableSlots.push({
            coach_id: slot.coach_id,
            coach_name: slot.coach_name,
            date: date,
            start_time: startTimeStr,
            end_time: endTimeStr,
            duration: duration
          });
        }
        
        currentTime += duration;
      }
    }

    return c.json({ success: true, available_slots: availableSlots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return c.json({ success: false, error: 'Failed to fetch available slots' }, 500);
  }
});

// Add availability slot for a coach
availability.post('/coach/:coach_id', async (c) => {
  const coach_id = c.req.param('coach_id');
  
  try {
    const body = await c.req.json();
    const { day_of_week, start_time, end_time, slot_duration = 60 } = body;
    
    // Validate required fields
    if (day_of_week === undefined || !start_time || !end_time) {
      return c.json({ 
        success: false, 
        error: 'day_of_week, start_time, and end_time are required' 
      }, 400);
    }

    // Validate day_of_week is 0-6
    if (day_of_week < 0 || day_of_week > 6) {
      return c.json({ 
        success: false, 
        error: 'day_of_week must be between 0 (Sunday) and 6 (Saturday)' 
      }, 400);
    }

    const result = await c.env.DB.prepare(`
      INSERT INTO availability_slots (
        coach_id, day_of_week, start_time, end_time, slot_duration
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(coach_id, day_of_week, start_time, end_time, slot_duration).run();

    return c.json({ 
      success: true, 
      availability_id: result.meta.last_row_id,
      message: 'Availability slot added successfully' 
    });
  } catch (error) {
    console.error('Error adding availability:', error);
    return c.json({ success: false, error: 'Failed to add availability' }, 500);
  }
});

// Update availability slot
availability.put('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const body = await c.req.json();
    const { day_of_week, start_time, end_time, slot_duration } = body;
    
    const updateFields = [];
    const values = [];
    
    if (day_of_week !== undefined) {
      if (day_of_week < 0 || day_of_week > 6) {
        return c.json({ 
          success: false, 
          error: 'day_of_week must be between 0 and 6' 
        }, 400);
      }
      updateFields.push('day_of_week = ?');
      values.push(day_of_week);
    }
    
    if (start_time) {
      updateFields.push('start_time = ?');
      values.push(start_time);
    }
    
    if (end_time) {
      updateFields.push('end_time = ?');
      values.push(end_time);
    }
    
    if (slot_duration !== undefined) {
      updateFields.push('slot_duration = ?');
      values.push(slot_duration);
    }

    if (updateFields.length === 0) {
      return c.json({ success: false, error: 'No fields to update' }, 400);
    }

    values.push(id);

    const result = await c.env.DB.prepare(`
      UPDATE availability_slots 
      SET ${updateFields.join(', ')} 
      WHERE id = ? AND active = TRUE
    `).bind(...values).run();

    if (result.meta.changes === 0) {
      return c.json({ success: false, error: 'Availability slot not found' }, 404);
    }

    return c.json({ success: true, message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Error updating availability:', error);
    return c.json({ success: false, error: 'Failed to update availability' }, 500);
  }
});

// Delete availability slot
availability.delete('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const result = await c.env.DB.prepare(`
      UPDATE availability_slots 
      SET active = FALSE 
      WHERE id = ?
    `).bind(id).run();

    if (result.meta.changes === 0) {
      return c.json({ success: false, error: 'Availability slot not found' }, 404);
    }

    return c.json({ success: true, message: 'Availability slot removed successfully' });
  } catch (error) {
    console.error('Error deleting availability:', error);
    return c.json({ success: false, error: 'Failed to delete availability' }, 500);
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

export default availability;