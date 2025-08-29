import { Hono } from 'hono';
import type { Bindings, CreateBookingRequest, BookingWithDetails } from '../types';
import { mockCoaches, demoBookings, addDemoBooking, createDemoStudent } from '../mockData';

const bookings = new Hono<{ Bindings: Bindings }>();

// Get all bookings with optional filters
bookings.get('/', async (c) => {
  const coach_id = c.req.query('coach_id');
  const student_email = c.req.query('student_email');
  const date = c.req.query('date');
  const status = c.req.query('status');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');
  
  try {
    let query = `
      SELECT 
        b.*,
        c.name as coach_name,
        s.name as student_name,
        s.email as student_email
      FROM bookings b
      JOIN coaches c ON b.coach_id = c.id
      JOIN students s ON b.student_id = s.id
      WHERE 1=1
    `;
    
    const bindings = [];
    
    if (coach_id) {
      query += ' AND b.coach_id = ?';
      bindings.push(coach_id);
    }
    
    if (student_email) {
      query += ' AND s.email = ?';
      bindings.push(student_email);
    }
    
    if (date) {
      query += ' AND b.booking_date = ?';
      bindings.push(date);
    }
    
    if (status) {
      query += ' AND b.status = ?';
      bindings.push(status);
    }
    
    query += ' ORDER BY b.booking_date DESC, b.start_time DESC LIMIT ? OFFSET ?';
    bindings.push(limit, offset);

    const { results } = await c.env.DB.prepare(query).bind(...bindings).all();

    return c.json({ success: true, bookings: results });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return c.json({ success: false, error: 'Failed to fetch bookings' }, 500);
  }
});

// Get single booking by ID
bookings.get('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const booking = await c.env.DB.prepare(`
      SELECT 
        b.*,
        c.name as coach_name,
        c.email as coach_email,
        c.phone as coach_phone,
        s.name as student_name,
        s.email as student_email,
        s.phone as student_phone,
        s.experience_level as student_experience
      FROM bookings b
      JOIN coaches c ON b.coach_id = c.id
      JOIN students s ON b.student_id = s.id
      WHERE b.id = ?
    `).bind(id).first();

    if (!booking) {
      return c.json({ success: false, error: 'Booking not found' }, 404);
    }

    return c.json({ success: true, booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return c.json({ success: false, error: 'Failed to fetch booking' }, 500);
  }
});

// Create new booking
bookings.post('/', async (c) => {
  try {
    const body: CreateBookingRequest = await c.req.json();
    
    // Validate required fields
    if (!body.student_name || !body.student_email || !body.coach_id || 
        !body.booking_date || !body.start_time) {
      return c.json({ 
        success: false, 
        error: 'Student name, email, coach_id, booking_date, and start_time are required' 
      }, 400);
    }

    // Calculate end time (default 60 minutes)
    const duration = 60; // minutes
    const startMinutes = parseTime(body.start_time);
    const endTime = formatTime(startMinutes + duration);

    if (!c.env.DB) {
      // Use mock data system for demo
      const newBooking = addDemoBooking({
        student_id: 999, // Demo student ID
        coach_id: body.coach_id,
        booking_date: body.booking_date,
        start_time: body.start_time,
        end_time: endTime,
        class_type: body.class_type || 'private',
        status: 'confirmed',
        notes: body.notes || null
      });

      return c.json({ 
        success: true, 
        booking_id: newBooking.id,
        message: 'Demo booking created successfully (using mock data - setup database for persistence)',
        details: {
          student_id: 999,
          coach_id: body.coach_id,
          booking_date: body.booking_date,
          start_time: body.start_time,
          end_time: endTime
        }
      });
    }

    // Check if the slot is available
    const existingBooking = await c.env.DB.prepare(`
      SELECT id FROM bookings 
      WHERE coach_id = ? AND booking_date = ? 
        AND status = 'confirmed'
        AND (
          (start_time <= ? AND end_time > ?) OR
          (start_time < ? AND end_time >= ?) OR
          (start_time >= ? AND end_time <= ?)
        )
    `).bind(
      body.coach_id, body.booking_date,
      body.start_time, body.start_time,  // booking starts during existing slot
      endTime, endTime,                  // booking ends during existing slot
      body.start_time, endTime           // booking contains existing slot
    ).first();

    if (existingBooking) {
      return c.json({ 
        success: false, 
        error: 'Time slot is already booked' 
      }, 400);
    }

    // Check if coach is available on this day and time
    const dayOfWeek = new Date(body.booking_date).getDay();
    const availability = await c.env.DB.prepare(`
      SELECT id FROM availability_slots 
      WHERE coach_id = ? AND day_of_week = ? AND active = TRUE
        AND start_time <= ? AND end_time >= ?
    `).bind(body.coach_id, dayOfWeek, body.start_time, endTime).first();

    if (!availability) {
      return c.json({ 
        success: false, 
        error: 'Coach is not available at the requested time' 
      }, 400);
    }

    // Create or get student
    let student = await c.env.DB.prepare(`
      SELECT id FROM students WHERE email = ?
    `).bind(body.student_email).first();

    if (!student) {
      const studentResult = await c.env.DB.prepare(`
        INSERT INTO students (name, email, phone, experience_level)
        VALUES (?, ?, ?, ?)
      `).bind(
        body.student_name,
        body.student_email,
        body.student_phone || null,
        body.experience_level || 'beginner'
      ).run();
      
      student = { id: studentResult.meta.last_row_id };
    }

    // Create booking
    const result = await c.env.DB.prepare(`
      INSERT INTO bookings (
        student_id, coach_id, booking_date, start_time, end_time,
        class_type, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      student.id,
      body.coach_id,
      body.booking_date,
      body.start_time,
      endTime,
      body.class_type || 'private',
      body.notes || null
    ).run();

    return c.json({ 
      success: true, 
      booking_id: result.meta.last_row_id,
      message: 'Booking created successfully',
      details: {
        student_id: student.id,
        coach_id: body.coach_id,
        booking_date: body.booking_date,
        start_time: body.start_time,
        end_time: endTime
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return c.json({ success: false, error: 'Failed to create booking' }, 500);
  }
});

// Update booking status
bookings.put('/:id/status', async (c) => {
  const id = c.req.param('id');
  
  try {
    const body = await c.req.json();
    const { status, notes } = body;
    
    if (!status || !['confirmed', 'cancelled', 'completed'].includes(status)) {
      return c.json({ 
        success: false, 
        error: 'Valid status is required (confirmed, cancelled, completed)' 
      }, 400);
    }

    const updateFields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const values = [status];
    
    if (notes !== undefined) {
      updateFields.push('notes = ?');
      values.push(notes);
    }
    
    values.push(id);

    const result = await c.env.DB.prepare(`
      UPDATE bookings 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `).bind(...values).run();

    if (result.meta.changes === 0) {
      return c.json({ success: false, error: 'Booking not found' }, 404);
    }

    return c.json({ success: true, message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return c.json({ success: false, error: 'Failed to update booking status' }, 500);
  }
});

// Cancel booking
bookings.delete('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const result = await c.env.DB.prepare(`
      UPDATE bookings 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND status = 'confirmed'
    `).bind(id).run();

    if (result.meta.changes === 0) {
      return c.json({ 
        success: false, 
        error: 'Booking not found or already cancelled' 
      }, 404);
    }

    return c.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return c.json({ success: false, error: 'Failed to cancel booking' }, 500);
  }
});

// Get upcoming bookings for a coach
bookings.get('/coach/:coach_id/upcoming', async (c) => {
  const coach_id = c.req.param('coach_id');
  const limit = parseInt(c.req.query('limit') || '10');
  
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        b.*,
        s.name as student_name,
        s.email as student_email,
        s.phone as student_phone,
        s.experience_level as student_experience
      FROM bookings b
      JOIN students s ON b.student_id = s.id
      WHERE b.coach_id = ? 
        AND b.status = 'confirmed'
        AND (
          b.booking_date > DATE('now') OR 
          (b.booking_date = DATE('now') AND b.start_time > TIME('now'))
        )
      ORDER BY b.booking_date ASC, b.start_time ASC
      LIMIT ?
    `).bind(coach_id, limit).all();

    return c.json({ success: true, bookings: results });
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error);
    return c.json({ success: false, error: 'Failed to fetch upcoming bookings' }, 500);
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

export default bookings;