import { Router, Response } from 'express';
import { pg, logAuditEvent } from '../db.ts';
import { requireAdmin, requireBusinessStaff, AuthenticatedRequest } from '../middleware/auth.ts';

export const branchesRouter = Router();

// Public: Get all active branches for a business
branchesRouter.get('/', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const includeArchived = req.query.archived === 'true';

    let query = `SELECT * FROM branches WHERE business_id = $1`;
    if (!includeArchived) {
      query += ` AND is_archived = FALSE AND is_active = TRUE`;
    } else {
      query += ` AND is_archived = TRUE`;
    }
    query += ` ORDER BY is_main DESC, name ASC`;

    const result = await pg.query(query, [businessId]);
    return res.json({ branches: result.rows });
  } catch (error: any) {
    console.error('Fetch branches error:', error);
    return res.status(500).json({ error: 'Failed to retrieve branches' });
  }
});

// Admin/Owner: Create a new branch/outlet
branchesRouter.post('/', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      business_id = 1,
      name,
      slug,
      code,
      address,
      phone,
      whatsapp,
      email,
      latitude,
      longitude,
      opening_hours = 'Mon-Sun: 09:30 AM - 09:00 PM',
      holidays,
      business_category,
      logo_url,
      cover_image,
      theme_color,
      google_maps_url,
      cancellation_policy,
      advance_deposit_pct,
      payment_settings,
      home_service_settings,
      booking_settings,
      service_ids,
      staff_ids,
      is_main = false,
    } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: 'Branch name and address are required' });
    }

    const branchCode = code || `BR-${Date.now().toString().slice(-4)}`;
    const branchSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = await pg.query<any>(
      `INSERT INTO branches (
        business_id, name, slug, code, address, phone, whatsapp, email,
        latitude, longitude, opening_hours, holidays, business_category,
        logo_url, cover_image, theme_color, google_maps_url,
        cancellation_policy, advance_deposit_pct,
        payment_settings, home_service_settings, booking_settings,
        service_ids, staff_ids, is_main
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *`,
      [
        business_id,
        name,
        branchSlug,
        branchCode,
        address,
        phone,
        whatsapp,
        email,
        latitude,
        longitude,
        opening_hours,
        holidays,
        business_category,
        logo_url,
        cover_image,
        theme_color,
        google_maps_url,
        cancellation_policy,
        advance_deposit_pct,
        payment_settings ? JSON.stringify(payment_settings) : null,
        home_service_settings ? JSON.stringify(home_service_settings) : null,
        booking_settings ? JSON.stringify(booking_settings) : null,
        service_ids ? JSON.stringify(service_ids) : '[]',
        staff_ids ? JSON.stringify(staff_ids) : '[]',
        is_main,
      ]
    );

    const branch = result.rows[0];

    await logAuditEvent({
      business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'BRANCH_CREATED',
      entity_type: 'branch',
      entity_id: branch.id,
      details: { name, slug: branchSlug, code: branchCode },
    });

    return res.status(201).json({ branch, message: 'Branch outlet created successfully' });
  } catch (error: any) {
    console.error('Create branch error:', error);
    return res.status(500).json({ error: 'Failed to create branch' });
  }
});

// Admin/Manager: Update branch
branchesRouter.put('/:id', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      code,
      address,
      phone,
      whatsapp,
      email,
      latitude,
      longitude,
      opening_hours,
      holidays,
      business_category,
      logo_url,
      cover_image,
      theme_color,
      google_maps_url,
      cancellation_policy,
      advance_deposit_pct,
      payment_settings,
      home_service_settings,
      booking_settings,
      service_ids,
      staff_ids,
      is_main,
      is_active,
    } = req.body;

    const result = await pg.query<any>(
      `UPDATE branches
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           code = COALESCE($3, code),
           address = COALESCE($4, address),
           phone = COALESCE($5, phone),
           whatsapp = COALESCE($6, whatsapp),
           email = COALESCE($7, email),
           latitude = COALESCE($8, latitude),
           longitude = COALESCE($9, longitude),
           opening_hours = COALESCE($10, opening_hours),
           holidays = COALESCE($11, holidays),
           business_category = COALESCE($12, business_category),
           logo_url = COALESCE($13, logo_url),
           cover_image = COALESCE($14, cover_image),
           theme_color = COALESCE($15, theme_color),
           google_maps_url = COALESCE($16, google_maps_url),
           cancellation_policy = COALESCE($17, cancellation_policy),
           advance_deposit_pct = COALESCE($18, advance_deposit_pct),
           payment_settings = CASE WHEN $19::text IS NOT NULL THEN $19::jsonb ELSE payment_settings END,
           home_service_settings = CASE WHEN $20::text IS NOT NULL THEN $20::jsonb ELSE home_service_settings END,
           booking_settings = CASE WHEN $21::text IS NOT NULL THEN $21::jsonb ELSE booking_settings END,
           service_ids = CASE WHEN $22::text IS NOT NULL THEN $22::jsonb ELSE service_ids END,
           staff_ids = CASE WHEN $23::text IS NOT NULL THEN $23::jsonb ELSE staff_ids END,
           is_main = COALESCE($24, is_main),
           is_active = COALESCE($25, is_active)
       WHERE id = $26
       RETURNING *`,
      [
        name,
        slug,
        code,
        address,
        phone,
        whatsapp,
        email,
        latitude,
        longitude,
        opening_hours,
        holidays,
        business_category,
        logo_url,
        cover_image,
        theme_color,
        google_maps_url,
        cancellation_policy,
        advance_deposit_pct,
        payment_settings ? JSON.stringify(payment_settings) : null,
        home_service_settings ? JSON.stringify(home_service_settings) : null,
        booking_settings ? JSON.stringify(booking_settings) : null,
        service_ids ? JSON.stringify(service_ids) : null,
        staff_ids ? JSON.stringify(staff_ids) : null,
        is_main,
        is_active,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    await logAuditEvent({
      business_id: (result.rows[0] as any).business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'BRANCH_UPDATED',
      entity_type: 'branch',
      entity_id: parseInt(id),
      details: { name, address },
    });

    return res.json({ branch: result.rows[0], message: 'Branch updated successfully' });
  } catch (error: any) {
    console.error('Update branch error:', error);
    return res.status(500).json({ error: 'Failed to update branch' });
  }
});

// Archive branch
branchesRouter.patch('/:id/archive', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query<any>(
      `UPDATE branches SET is_archived = TRUE, is_active = FALSE, deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Branch not found' });

    await logAuditEvent({
      business_id: (result.rows[0] as any).business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'BRANCH_ARCHIVED',
      entity_type: 'branch',
      entity_id: parseInt(id),
    });

    return res.json({ message: 'Branch outlet archived' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to archive branch' });
  }
});

// Restore branch
branchesRouter.patch('/:id/restore', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query<any>(
      `UPDATE branches SET is_archived = FALSE, is_active = TRUE, deleted_at = NULL WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Branch not found' });

    await logAuditEvent({
      business_id: (result.rows[0] as any).business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'BRANCH_RESTORED',
      entity_type: 'branch',
      entity_id: parseInt(id),
    });

    return res.json({ message: 'Branch outlet restored' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to restore branch' });
  }
});
