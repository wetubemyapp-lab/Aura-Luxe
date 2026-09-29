import { Router, Response } from 'express';
import { pg, logAuditEvent } from '../db.ts';
import { requireBusinessStaff, AuthenticatedRequest } from '../middleware/auth.ts';

export const videosRouter = Router();

// Get all videos for a business
videosRouter.get('/', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const includeArchived = req.query.archived === 'true';

    let query = `
      SELECT 
        id, business_id, title, description, video_url, thumbnail_url,
        COALESCE(sort_order, 0) as sort_order,
        COALESCE(is_featured, false) as is_featured,
        COALESCE(is_active, true) as is_active,
        COALESCE(is_archived, false) as is_archived,
        created_at
      FROM videos 
      WHERE business_id = $1
    `;
    if (!includeArchived) {
      query += ' AND COALESCE(is_archived, false) = FALSE AND COALESCE(is_active, true) = TRUE';
    } else {
      query += ' AND COALESCE(is_archived, false) = TRUE';
    }
    query += ' ORDER BY sort_order ASC, id DESC';

    const result = await pg.query(query, [businessId]);
    return res.json({ videos: result.rows });
  } catch (error: any) {
    console.error('Fetch videos error:', error);
    return res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Admin/Staff: Add a video
videosRouter.post('/', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      business_id = 1,
      title,
      description,
      video_url,
      thumbnail_url,
      sort_order = 0,
      is_featured = false,
      is_active = true,
    } = req.body;

    if (!title || !video_url) {
      return res.status(400).json({ error: 'Title and video URL are required' });
    }

    const result = await pg.query<any>(
      `INSERT INTO videos (business_id, title, description, video_url, thumbnail_url, sort_order, is_featured, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        business_id,
        title,
        description || null,
        video_url,
        thumbnail_url || null,
        parseInt(sort_order) || 0,
        is_featured === true,
        is_active !== false,
      ]
    );

    const created = result.rows[0];

    await logAuditEvent({
      business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'VIDEO_CREATED',
      entity_type: 'video',
      entity_id: created.id,
      details: { title, video_url },
    });

    return res.json({ video: created, message: 'Video added successfully' });
  } catch (error: any) {
    console.error('Add video error:', error);
    return res.status(500).json({ error: 'Failed to add video' });
  }
});

// Admin/Staff: Edit a video
videosRouter.put('/:id', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      video_url,
      thumbnail_url,
      sort_order,
      is_featured,
      is_active,
    } = req.body;

    const result = await pg.query<any>(
      `UPDATE videos
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           video_url = COALESCE($3, video_url),
           thumbnail_url = COALESCE($4, thumbnail_url),
           sort_order = COALESCE($5, sort_order),
           is_featured = COALESCE($6, is_featured),
           is_active = COALESCE($7, is_active)
       WHERE id = $8
       RETURNING *`,
      [
        title || null,
        description || null,
        video_url || null,
        thumbnail_url || null,
        sort_order !== undefined ? parseInt(sort_order) : null,
        is_featured !== undefined ? is_featured : null,
        is_active !== undefined ? is_active : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const updated = result.rows[0];

    await logAuditEvent({
      business_id: updated.business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'VIDEO_UPDATED',
      entity_type: 'video',
      entity_id: parseInt(id),
      details: { title: updated.title },
    });

    return res.json({ video: updated, message: 'Video updated successfully' });
  } catch (error: any) {
    console.error('Update video error:', error);
    return res.status(500).json({ error: 'Failed to update video' });
  }
});

// Reorder video items
videosRouter.post('/reorder', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { items } = req.body; // Array of { id, sort_order }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid items array for reordering' });
    }

    for (const item of items) {
      await pg.query('UPDATE videos SET sort_order = $1 WHERE id = $2', [item.sort_order, item.id]);
    }

    return res.json({ message: 'Videos reordered successfully' });
  } catch (error: any) {
    console.error('Reorder videos error:', error);
    return res.status(500).json({ error: 'Failed to reorder videos' });
  }
});

// Archive video item
videosRouter.patch('/:id/archive', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query<any>(
      `UPDATE videos SET is_archived = TRUE, is_active = FALSE, deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Video not found' });
    return res.json({ video: result.rows[0], message: 'Video archived' });
  } catch (error: any) {
    console.error('Archive video error:', error);
    return res.status(500).json({ error: 'Failed to archive video' });
  }
});

// Restore video item
videosRouter.patch('/:id/restore', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query<any>(
      `UPDATE videos SET is_archived = FALSE, is_active = TRUE, deleted_at = NULL WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Video not found' });
    return res.json({ video: result.rows[0], message: 'Video restored' });
  } catch (error: any) {
    console.error('Restore video error:', error);
    return res.status(500).json({ error: 'Failed to restore video' });
  }
});
