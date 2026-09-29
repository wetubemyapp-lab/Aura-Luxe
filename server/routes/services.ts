import { Router, Response } from 'express';
import { pg, logAuditEvent } from '../db.ts';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

export const servicesRouter = Router();

// Public: Get all services for a business (active or archived)
servicesRouter.get('/', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const includeArchived = req.query.archived === 'true';

    let query = 'SELECT * FROM services WHERE business_id = $1';
    if (!includeArchived) {
      query += ' AND is_archived = FALSE AND is_active = TRUE';
    } else {
      query += ' AND is_archived = TRUE';
    }

    query += ' ORDER BY category ASC, id ASC';

    const result = await pg.query(query, [businessId]);

    // Fallback if empty
    if (result.rows.length === 0 && !includeArchived) {
      const fallback = await pg.query('SELECT * FROM services WHERE is_archived = FALSE AND is_active = TRUE ORDER BY category ASC, id ASC');
      return res.json({ services: fallback.rows });
    }

    return res.json({ services: result.rows });
  } catch (error: any) {
    console.error('Fetch services error:', error);
    return res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Public: Get add-ons for a specific service or business
servicesRouter.get('/addons', async (req, res): Promise<any> => {
  try {
    const { businessId, serviceId } = req.query;
    let query = 'SELECT * FROM service_addons WHERE 1=1';
    const params: any[] = [];

    if (businessId) {
      params.push(parseInt(businessId as string));
      query += ` AND business_id = $${params.length}`;
    }
    if (serviceId) {
      params.push(parseInt(serviceId as string));
      query += ` AND (service_id = $${params.length} OR service_id IS NULL)`;
    }

    query += ' ORDER BY id ASC';
    const result = await pg.query(query, params);
    return res.json({ addons: result.rows });
  } catch (error: any) {
    console.error('Fetch addons error:', error);
    return res.status(500).json({ error: 'Failed to fetch service add-ons' });
  }
});

// Alias routes under /api/services/ for modular endpoints
servicesRouter.get('/offers', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const result = await pg.query('SELECT * FROM offers WHERE business_id = $1 AND is_archived = FALSE AND is_active = TRUE', [businessId]);
    return res.json({ offers: result.rows });
  } catch (err) {
    return res.json({ offers: [] });
  }
});

servicesRouter.get('/packages', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const result = await pg.query('SELECT * FROM packages WHERE business_id = $1 AND is_archived = FALSE AND is_active = TRUE', [businessId]);
    return res.json({ packages: result.rows });
  } catch (err) {
    return res.json({ packages: [] });
  }
});

servicesRouter.get('/coupons', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const result = await pg.query('SELECT * FROM coupons WHERE business_id = $1 AND is_archived = FALSE AND is_active = TRUE', [businessId]);
    return res.json({ coupons: result.rows });
  } catch (err) {
    return res.json({ coupons: [] });
  }
});

servicesRouter.get('/gallery', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const result = await pg.query('SELECT * FROM gallery WHERE business_id = $1 AND is_archived = FALSE', [businessId]);
    return res.json({ gallery: result.rows });
  } catch (err) {
    return res.json({ gallery: [] });
  }
});

servicesRouter.get('/videos', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const result = await pg.query('SELECT * FROM videos WHERE business_id = $1 AND is_archived = FALSE', [businessId]);
    return res.json({ videos: result.rows });
  } catch (err) {
    return res.json({ videos: [] });
  }
});

servicesRouter.get('/reviews', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const result = await pg.query('SELECT * FROM reviews WHERE business_id = $1 AND is_verified = TRUE ORDER BY id DESC', [businessId]);
    return res.json({ reviews: result.rows });
  } catch (err) {
    return res.json({ reviews: [] });
  }
});

// Admin: Add service
servicesRouter.post('/', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      business_id = 1,
      title,
      title_hi,
      category,
      description,
      description_hi,
      price,
      duration_mins = 45,
      buffer_mins = 10,
      image_url,
    } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ error: 'Title, category, and price are required' });
    }

    const result = await pg.query<any>(
      `INSERT INTO services (business_id, title, title_hi, category, description, description_hi, price, duration_mins, buffer_mins, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [business_id, title, title_hi || null, category, description || null, description_hi || null, price, duration_mins, buffer_mins, image_url || null]
    );

    const service = result.rows[0];

    await logAuditEvent({
      business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'SERVICE_CREATED',
      entity_type: 'service',
      entity_id: service.id,
      details: { title, price, category },
    });

    return res.status(201).json({ service, message: 'Service created successfully' });
  } catch (error: any) {
    console.error('Create service error:', error);
    return res.status(500).json({ error: 'Failed to create service' });
  }
});

// Admin: Update service
servicesRouter.put('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      title,
      title_hi,
      category,
      description,
      description_hi,
      price,
      duration_mins,
      buffer_mins,
      image_url,
      is_active,
    } = req.body;

    const result = await pg.query<any>(
      `UPDATE services
       SET title = COALESCE($1, title),
           title_hi = COALESCE($2, title_hi),
           category = COALESCE($3, category),
           description = COALESCE($4, description),
           description_hi = COALESCE($5, description_hi),
           price = COALESCE($6, price),
           duration_mins = COALESCE($7, duration_mins),
           buffer_mins = COALESCE($8, buffer_mins),
           image_url = COALESCE($9, image_url),
           is_active = COALESCE($10, is_active)
       WHERE id = $11
       RETURNING *`,
      [title, title_hi, category, description, description_hi, price, duration_mins, buffer_mins, image_url, is_active, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Service not found' });

    await logAuditEvent({
      business_id: (result.rows[0] as any).business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'SERVICE_UPDATED',
      entity_type: 'service',
      entity_id: parseInt(id),
      details: { title, price },
    });

    return res.json({ service: result.rows[0], message: 'Service updated successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update service' });
  }
});

// Duplicate service endpoint (Section 30)
servicesRouter.post('/:id/duplicate', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const origRes = await pg.query<any>('SELECT * FROM services WHERE id = $1', [id]);
    if (origRes.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
    const s = origRes.rows[0];

    const dupRes = await pg.query<any>(
      `INSERT INTO services (business_id, title, title_hi, category, description, description_hi, price, discount_price, travel_fee, duration_mins, buffer_mins, image_url, video_url, is_popular, is_featured, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        s.business_id,
        `${s.title} (Copy)`,
        s.title_hi ? `${s.title_hi} (प्रतिलिपि)` : null,
        s.category,
        s.description,
        s.description_hi,
        s.price,
        s.discount_price,
        s.travel_fee,
        s.duration_mins,
        s.buffer_mins,
        s.image_url,
        s.video_url,
        s.is_popular,
        s.is_featured,
        true,
      ]
    );

    const duplicated = dupRes.rows[0];

    await logAuditEvent({
      business_id: s.business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'SERVICE_DUPLICATED',
      entity_type: 'service',
      entity_id: duplicated.id,
      details: { original_id: s.id, new_title: duplicated.title },
    });

    return res.status(201).json({ service: duplicated, message: 'Service duplicated successfully' });
  } catch (error: any) {
    console.error('Duplicate service error:', error);
    return res.status(500).json({ error: 'Failed to duplicate service' });
  }
});

// Archive service (Soft Delete)
servicesRouter.patch('/:id/archive', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query<any>(
      `UPDATE services SET is_archived = TRUE, is_active = FALSE, deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Service not found' });

    await logAuditEvent({
      business_id: (result.rows[0] as any).business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'SERVICE_ARCHIVED',
      entity_type: 'service',
      entity_id: parseInt(id),
    });

    return res.json({ message: 'Service archived successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to archive service' });
  }
});

// Restore service
servicesRouter.patch('/:id/restore', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query<any>(
      `UPDATE services SET is_archived = FALSE, is_active = TRUE, deleted_at = NULL WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Service not found' });

    await logAuditEvent({
      business_id: (result.rows[0] as any).business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'SERVICE_RESTORED',
      entity_type: 'service',
      entity_id: parseInt(id),
    });

    return res.json({ message: 'Service restored successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to restore service' });
  }
});

// Admin: Delete service permanently
servicesRouter.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await pg.query('DELETE FROM services WHERE id = $1', [id]);
    return res.json({ message: 'Service deleted permanently' });
  } catch (error: any) {
    console.error('Delete service error:', error);
    return res.status(500).json({ error: 'Failed to delete service' });
  }
});
