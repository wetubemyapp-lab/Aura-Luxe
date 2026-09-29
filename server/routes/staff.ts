import { Router, Response } from 'express';
import { pg, logAuditEvent } from '../db.ts';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

export const staffRouter = Router();

// Public: Get all staff members for a business
staffRouter.get('/', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const includeArchived = req.query.archived === 'true';

    let query = 'SELECT * FROM staff WHERE business_id = $1';
    if (!includeArchived) {
      query += ' AND is_archived = FALSE AND is_active = TRUE';
    } else {
      query += ' AND is_archived = TRUE';
    }

    query += ' ORDER BY id ASC';
    const result = await pg.query(query, [businessId]);

    // Fallback if empty
    if (result.rows.length === 0 && !includeArchived) {
      const fallback = await pg.query('SELECT * FROM staff WHERE is_archived = FALSE AND is_active = TRUE ORDER BY id ASC');
      return res.json({ staff: fallback.rows });
    }

    return res.json({ staff: result.rows });
  } catch (error: any) {
    console.error('Fetch staff error:', error);
    return res.status(500).json({ error: 'Failed to fetch staff members' });
  }
});

// Admin: Create staff member (Section 29)
staffRouter.post('/', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      business_id = 1,
      name,
      role_title,
      role_title_hi,
      bio,
      experience,
      skills,
      phone,
      email,
      image_url,
      specialties,
      working_hours = '09:00 - 18:00',
      status = 'ACTIVE',
      home_service_enabled = true,
      online_booking_enabled = true,
      commission_rate = 15.00,
    } = req.body;

    if (!name || !role_title) {
      return res.status(400).json({ error: 'Staff name and role title are required' });
    }

    const result = await pg.query<any>(
      `INSERT INTO staff (
        business_id, name, role_title, role_title_hi, bio, experience, skills,
        phone, email, image_url, specialties, working_hours, status,
        home_service_enabled, online_booking_enabled, commission_rate
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        business_id,
        name,
        role_title,
        role_title_hi || null,
        bio || null,
        experience || null,
        skills || null,
        phone || null,
        email || null,
        image_url || null,
        specialties || null,
        working_hours,
        status.toUpperCase(),
        home_service_enabled,
        online_booking_enabled,
        commission_rate,
      ]
    );

    const staffMember = result.rows[0];

    await logAuditEvent({
      business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'STAFF_CREATED',
      entity_type: 'staff',
      entity_id: staffMember.id,
      details: { name, role_title, status },
    });

    return res.status(201).json({ staff: staffMember, message: 'Staff member created successfully' });
  } catch (error: any) {
    console.error('Create staff error:', error);
    return res.status(500).json({ error: 'Failed to create staff member' });
  }
});

// Admin: Update staff member
staffRouter.put('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      name,
      role_title,
      role_title_hi,
      bio,
      experience,
      skills,
      phone,
      email,
      image_url,
      specialties,
      working_hours,
      status,
      home_service_enabled,
      online_booking_enabled,
      commission_rate,
      is_active,
    } = req.body;

    const result = await pg.query<any>(
      `UPDATE staff
       SET name = COALESCE($1, name),
           role_title = COALESCE($2, role_title),
           role_title_hi = COALESCE($3, role_title_hi),
           bio = COALESCE($4, bio),
           experience = COALESCE($5, experience),
           skills = COALESCE($6, skills),
           phone = COALESCE($7, phone),
           email = COALESCE($8, email),
           image_url = COALESCE($9, image_url),
           specialties = COALESCE($10, specialties),
           working_hours = COALESCE($11, working_hours),
           status = COALESCE($12, status),
           home_service_enabled = COALESCE($13, home_service_enabled),
           online_booking_enabled = COALESCE($14, online_booking_enabled),
           commission_rate = COALESCE($15, commission_rate),
           is_active = COALESCE($16, is_active)
       WHERE id = $17
       RETURNING *`,
      [
        name,
        role_title,
        role_title_hi,
        bio,
        experience,
        skills,
        phone,
        email,
        image_url,
        specialties,
        working_hours,
        status ? status.toUpperCase() : undefined,
        home_service_enabled,
        online_booking_enabled,
        commission_rate,
        is_active,
        id,
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Staff member not found' });

    await logAuditEvent({
      business_id: result.rows[0].business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'STAFF_UPDATED',
      entity_type: 'staff',
      entity_id: parseInt(id),
      details: { name, role_title, status },
    });

    return res.json({ staff: result.rows[0], message: 'Staff member updated successfully' });
  } catch (error: any) {
    console.error('Update staff error:', error);
    return res.status(500).json({ error: 'Failed to update staff member' });
  }
});

// Admin: Archive staff (Soft Delete)
staffRouter.patch('/:id/archive', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query<any>(
      `UPDATE staff SET is_archived = TRUE, is_active = FALSE, status = 'IN_SESSION' WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Staff member not found' });

    await logAuditEvent({
      business_id: result.rows[0].business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'STAFF_ARCHIVED',
      entity_type: 'staff',
      entity_id: parseInt(id),
    });

    return res.json({ message: 'Staff member archived successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to archive staff member' });
  }
});

// Admin: Restore staff
staffRouter.patch('/:id/restore', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query<any>(
      `UPDATE staff SET is_archived = FALSE, is_active = TRUE, status = 'ACTIVE' WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Staff member not found' });

    await logAuditEvent({
      business_id: result.rows[0].business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'STAFF_RESTORED',
      entity_type: 'staff',
      entity_id: parseInt(id),
    });

    return res.json({ message: 'Staff member restored successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to restore staff member' });
  }
});
