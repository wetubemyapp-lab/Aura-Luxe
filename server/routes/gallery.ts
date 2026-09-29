import { Router, Response } from 'express';
import { pg, logAuditEvent } from '../db.ts';
import { requireBusinessStaff, AuthenticatedRequest } from '../middleware/auth.ts';

export const galleryRouter = Router();

// Get all gallery items for a business
galleryRouter.get('/', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const includeArchived = req.query.archived === 'true';

    let query = `
      SELECT 
        id, business_id, title,
        description,
        COALESCE(category, 'Photo') as category,
        service,
        image_url,
        COALESCE(sort_order, 0) as sort_order,
        COALESCE(is_featured, false) as is_featured,
        COALESCE(is_active, true) as is_active,
        COALESCE(is_archived, false) as is_archived,
        created_at
      FROM gallery 
      WHERE business_id = $1
    `;
    if (!includeArchived) {
      query += ' AND COALESCE(is_archived, false) = FALSE AND COALESCE(is_active, true) = TRUE';
    } else {
      query += ' AND COALESCE(is_archived, false) = TRUE';
    }
    query += ' ORDER BY sort_order ASC, id DESC';

    const result = await pg.query(query, [businessId]);
    return res.json({ gallery: result.rows });
  } catch (error: any) {
    console.error('Fetch gallery error:', error);
    return res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// Admin/Staff: Add gallery item
galleryRouter.post('/', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      business_id = 1,
      title,
      description,
      category = 'Photo',
      service,
      image_url,
      sort_order = 0,
      is_featured = false,
      is_active = true,
    } = req.body;

    if (!title || !image_url) {
      return res.status(400).json({ error: 'Title and image URL are required' });
    }

    const result = await pg.query<any>(
      `INSERT INTO gallery (business_id, title, description, category, service, image_url, sort_order, is_featured, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        business_id,
        title,
        description || null,
        category,
        service || null,
        image_url,
        parseInt(sort_order) || 0,
        is_featured,
        is_active,
      ]
    );

    const created = result.rows[0];

    await logAuditEvent({
      business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'GALLERY_CREATED',
      entity_type: 'gallery',
      entity_id: created.id,
      details: { title, category },
    });

    return res.json({ item: created, message: 'Gallery item added successfully' });
  } catch (error: any) {
    console.error('Add gallery error:', error);
    return res.status(500).json({ error: 'Failed to add gallery item' });
  }
});

// Admin/Staff: Edit gallery item
galleryRouter.put('/:id', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      service,
      image_url,
      sort_order,
      is_featured,
      is_active,
    } = req.body;

    const result = await pg.query<any>(
      `UPDATE gallery
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           service = COALESCE($4, service),
           image_url = COALESCE($5, image_url),
           sort_order = COALESCE($6, sort_order),
           is_featured = COALESCE($7, is_featured),
           is_active = COALESCE($8, is_active)
       WHERE id = $9
       RETURNING *`,
      [
        title || null,
        description || null,
        category || null,
        service || null,
        image_url || null,
        sort_order !== undefined ? parseInt(sort_order) : null,
        is_featured !== undefined ? is_featured : null,
        is_active !== undefined ? is_active : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    const updated = result.rows[0];

    await logAuditEvent({
      business_id: updated.business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'GALLERY_UPDATED',
      entity_type: 'gallery',
      entity_id: parseInt(id),
      details: { title: updated.title },
    });

    return res.json({ item: updated, message: 'Gallery item updated successfully' });
  } catch (error: any) {
    console.error('Update gallery error:', error);
    return res.status(500).json({ error: 'Failed to update gallery item' });
  }
});

// Reorder gallery items
galleryRouter.post('/reorder', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { items } = req.body; // Array of { id, sort_order }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid items array for reordering' });
    }

    for (const item of items) {
      await pg.query('UPDATE gallery SET sort_order = $1 WHERE id = $2', [item.sort_order, item.id]);
    }

    return res.json({ message: 'Gallery reordered successfully' });
  } catch (error: any) {
    console.error('Reorder gallery error:', error);
    return res.status(500).json({ error: 'Failed to reorder gallery' });
  }
});

// Archive gallery item
galleryRouter.patch('/:id/archive', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query<any>(
      `UPDATE gallery SET is_archived = TRUE, is_active = FALSE WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Gallery item not found' });
    return res.json({ item: result.rows[0], message: 'Gallery item archived' });
  } catch (error: any) {
    console.error('Archive gallery error:', error);
    return res.status(500).json({ error: 'Failed to archive gallery item' });
  }
});

// Restore gallery item
galleryRouter.patch('/:id/restore', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query<any>(
      `UPDATE gallery SET is_archived = FALSE, is_active = TRUE WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Gallery item not found' });
    return res.json({ item: result.rows[0], message: 'Gallery item restored' });
  } catch (error: any) {
    console.error('Restore gallery error:', error);
    return res.status(500).json({ error: 'Failed to restore gallery item' });
  }
});
