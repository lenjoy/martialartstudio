import { Hono } from 'hono';
import type { Bindings, Coach, CreateCoachRequest, CoachWithAvailability } from '../types';

const coaches = new Hono<{ Bindings: Bindings }>();

// Get all active coaches
coaches.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM coaches WHERE active = TRUE ORDER BY name
    `).all();

    const coachesData = results.map((coach: any) => ({
      ...coach,
      specialties: coach.specialties ? JSON.parse(coach.specialties) : []
    }));

    return c.json({ success: true, coaches: coachesData });
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return c.json({ success: false, error: 'Failed to fetch coaches' }, 500);
  }
});

// Get single coach by ID with availability
coaches.get('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    // Get coach details
    const coach = await c.env.DB.prepare(`
      SELECT * FROM coaches WHERE id = ? AND active = TRUE
    `).bind(id).first();

    if (!coach) {
      return c.json({ success: false, error: 'Coach not found' }, 404);
    }

    // Get coach's availability
    const { results: availability } = await c.env.DB.prepare(`
      SELECT * FROM availability_slots 
      WHERE coach_id = ? AND active = TRUE 
      ORDER BY day_of_week, start_time
    `).bind(id).all();

    const coachWithAvailability = {
      ...coach,
      specialties: coach.specialties ? JSON.parse(coach.specialties) : [],
      availability: availability
    };

    return c.json({ success: true, coach: coachWithAvailability });
  } catch (error) {
    console.error('Error fetching coach:', error);
    return c.json({ success: false, error: 'Failed to fetch coach' }, 500);
  }
});

// Create new coach (admin function)
coaches.post('/', async (c) => {
  try {
    const body: CreateCoachRequest = await c.req.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.martial_arts_background) {
      return c.json({ 
        success: false, 
        error: 'Name, email, and martial arts background are required' 
      }, 400);
    }

    const result = await c.env.DB.prepare(`
      INSERT INTO coaches (
        name, email, phone, bio, martial_arts_background, 
        specialties, years_experience, photo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.name,
      body.email,
      body.phone || null,
      body.bio || null,
      body.martial_arts_background,
      JSON.stringify(body.specialties || []),
      body.years_experience || 0,
      body.photo_url || null
    ).run();

    return c.json({ 
      success: true, 
      coach_id: result.meta.last_row_id,
      message: 'Coach created successfully' 
    });
  } catch (error) {
    console.error('Error creating coach:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return c.json({ success: false, error: 'Email already exists' }, 400);
    }
    return c.json({ success: false, error: 'Failed to create coach' }, 500);
  }
});

// Update coach
coaches.put('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const body: Partial<CreateCoachRequest> = await c.req.json();
    
    // Build dynamic update query
    const updateFields = [];
    const values = [];
    
    if (body.name) {
      updateFields.push('name = ?');
      values.push(body.name);
    }
    if (body.email) {
      updateFields.push('email = ?');
      values.push(body.email);
    }
    if (body.phone !== undefined) {
      updateFields.push('phone = ?');
      values.push(body.phone);
    }
    if (body.bio !== undefined) {
      updateFields.push('bio = ?');
      values.push(body.bio);
    }
    if (body.martial_arts_background) {
      updateFields.push('martial_arts_background = ?');
      values.push(body.martial_arts_background);
    }
    if (body.specialties) {
      updateFields.push('specialties = ?');
      values.push(JSON.stringify(body.specialties));
    }
    if (body.years_experience !== undefined) {
      updateFields.push('years_experience = ?');
      values.push(body.years_experience);
    }
    if (body.photo_url !== undefined) {
      updateFields.push('photo_url = ?');
      values.push(body.photo_url);
    }

    if (updateFields.length === 0) {
      return c.json({ success: false, error: 'No fields to update' }, 400);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await c.env.DB.prepare(`
      UPDATE coaches 
      SET ${updateFields.join(', ')} 
      WHERE id = ? AND active = TRUE
    `).bind(...values).run();

    if (result.meta.changes === 0) {
      return c.json({ success: false, error: 'Coach not found' }, 404);
    }

    return c.json({ success: true, message: 'Coach updated successfully' });
  } catch (error) {
    console.error('Error updating coach:', error);
    return c.json({ success: false, error: 'Failed to update coach' }, 500);
  }
});

// Soft delete coach
coaches.delete('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const result = await c.env.DB.prepare(`
      UPDATE coaches 
      SET active = FALSE, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND active = TRUE
    `).bind(id).run();

    if (result.meta.changes === 0) {
      return c.json({ success: false, error: 'Coach not found' }, 404);
    }

    return c.json({ success: true, message: 'Coach deactivated successfully' });
  } catch (error) {
    console.error('Error deleting coach:', error);
    return c.json({ success: false, error: 'Failed to delete coach' }, 500);
  }
});

export default coaches;