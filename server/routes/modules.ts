import { Router, Response } from 'express';
import { pg, logAuditEvent } from '../db.ts';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

export const modulesRouter = Router();

// ==================== STAFF ====================
modulesRouter.get('/staff', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : null;
    const date = req.query.date as string;
    const time = req.query.time as string;
    const includeArchived = req.query.archived === 'true';

    let query = 'SELECT * FROM staff WHERE business_id = $1';
    const params: any[] = [businessId];

    if (!includeArchived) {
      query += ' AND is_archived = FALSE AND is_active = TRUE';
    } else {
      query += ' AND is_archived = TRUE';
    }

    if (branchId) {
      params.push(branchId);
      query += ` AND (branch_id = $${params.length} OR branch_id IS NULL)`;
    }

    if (date && time) {
      params.push(date, time);
      const dateIdx = params.length - 1;
      const timeIdx = params.length;
      query += ` AND id NOT IN (
        SELECT staff_id FROM bookings
        WHERE business_id = $1 AND booking_date = $${dateIdx} AND booking_time = $${timeIdx}
          AND status NOT IN ('cancelled', 'refunded') AND is_archived = FALSE AND staff_id IS NOT NULL
      )`;
    }

    query += ' ORDER BY id ASC';

    const result = await pg.query(query, params);
    return res.json({ staff: result.rows });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

modulesRouter.post('/staff', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { business_id = 1, branch_id = 1, name, role_title, role_title_hi, bio, image_url, specialties, commission_rate = 15 } = req.body;
    if (!name || !role_title) return res.status(400).json({ error: 'Name and role title are required' });

    const result = await pg.query<any>(
      `INSERT INTO staff (business_id, branch_id, name, role_title, role_title_hi, bio, image_url, specialties, commission_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [business_id, branch_id, name, role_title, role_title_hi || null, bio || null, image_url || null, specialties || null, commission_rate]
    );

    const staffMember = result.rows[0];

    await logAuditEvent({
      business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'STAFF_CREATED',
      entity_type: 'staff',
      entity_id: (staffMember as any).id,
      details: { name, role_title },
    });

    return res.status(201).json({ staff: staffMember, message: 'Staff member added' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to add staff' });
  }
});

modulesRouter.put('/staff/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, role_title, role_title_hi, bio, image_url, specialties, commission_rate, branch_id, is_active } = req.body;

    const result = await pg.query(
      `UPDATE staff
       SET name = COALESCE($1, name),
           role_title = COALESCE($2, role_title),
           role_title_hi = COALESCE($3, role_title_hi),
           bio = COALESCE($4, bio),
           image_url = COALESCE($5, image_url),
           specialties = COALESCE($6, specialties),
           commission_rate = COALESCE($7, commission_rate),
           branch_id = COALESCE($8, branch_id),
           is_active = COALESCE($9, is_active)
       WHERE id = $10
       RETURNING *`,
      [name, role_title, role_title_hi, bio, image_url, specialties, commission_rate, branch_id, is_active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Staff member not found' });
    return res.json({ staff: result.rows[0], message: 'Staff updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update staff' });
  }
});

modulesRouter.patch('/staff/:id/archive', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query('UPDATE staff SET is_archived = TRUE, is_active = FALSE, deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Staff not found' });
    return res.json({ message: 'Staff archived' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to archive staff' });
  }
});

modulesRouter.patch('/staff/:id/restore', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query('UPDATE staff SET is_archived = FALSE, is_active = TRUE, deleted_at = NULL WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Staff not found' });
    return res.json({ message: 'Staff restored' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to restore staff' });
  }
});

// ==================== PACKAGES ====================
modulesRouter.get('/packages', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const includeArchived = req.query.archived === 'true';

    let query = 'SELECT * FROM packages WHERE business_id = $1';
    if (!includeArchived) {
      query += ' AND is_archived = FALSE AND is_active = TRUE';
    } else {
      query += ' AND is_archived = TRUE';
    }
    const result = await pg.query(query, [businessId]);
    return res.json({ packages: result.rows });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

modulesRouter.post('/packages', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { business_id = 1, name, description, price, original_price, service_ids } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });

    const result = await pg.query(
      `INSERT INTO packages (business_id, name, description, price, original_price, service_ids)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [business_id, name, description || null, price, original_price || null, service_ids || null]
    );
    return res.status(201).json({ package: result.rows[0], message: 'Package created' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create package' });
  }
});

modulesRouter.patch('/packages/:id/archive', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const result = await pg.query('UPDATE packages SET is_archived = TRUE, is_active = FALSE, deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Package not found' });
    return res.json({ message: 'Package archived' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to archive package' });
  }
});

modulesRouter.patch('/packages/:id/restore', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const result = await pg.query('UPDATE packages SET is_archived = FALSE, is_active = TRUE, deleted_at = NULL WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Package not found' });
    return res.json({ message: 'Package restored' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to restore package' });
  }
});

// ==================== OFFERS ====================
modulesRouter.get('/offers', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const includeArchived = req.query.archived === 'true';

    let query = 'SELECT * FROM offers WHERE business_id = $1';
    if (!includeArchived) {
      query += ' AND is_archived = FALSE AND is_active = TRUE';
    } else {
      query += ' AND is_archived = TRUE';
    }
    const result = await pg.query(query, [businessId]);
    return res.json({ offers: result.rows });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

modulesRouter.post('/offers', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      business_id = 1,
      title,
      title_hi,
      subtitle,
      description,
      banner_image,
      festival_tag = 'Diwali',
      start_at,
      end_at,
      offer_type = 'festival',
      discount_type = 'percentage',
      discount_value = 0,
      coupon_code,
      included_services,
      included_package,
      outlets,
      discount_pct,
      code,
      valid_until,
      is_featured = true,
      is_active = true,
    } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const result = await pg.query(
      `INSERT INTO offers (
        business_id, title, title_hi, subtitle, description, banner_image,
        festival_tag, start_at, end_at, offer_type, discount_type, discount_value,
        coupon_code, included_services, included_package, outlets, discount_pct, code,
        valid_until, is_featured, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        business_id, title, title_hi || null, subtitle || null, description || null, banner_image || null,
        festival_tag, start_at || null, end_at || null, offer_type, discount_type, discount_value,
        coupon_code || code || null, included_services || null, included_package || null, outlets || null,
        discount_pct || discount_value, code || coupon_code || null, valid_until || end_at || null, is_featured, is_active
      ]
    );
    return res.status(201).json({ offer: result.rows[0], message: 'Festival Offer Published' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create festival offer' });
  }
});

modulesRouter.put('/offers/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      title, title_hi, subtitle, description, banner_image, festival_tag,
      start_at, end_at, offer_type, discount_type, discount_value, coupon_code,
      included_services, included_package, outlets, is_featured, is_active
    } = req.body;

    const result = await pg.query(
      `UPDATE offers SET
        title = COALESCE($1, title),
        title_hi = COALESCE($2, title_hi),
        subtitle = COALESCE($3, subtitle),
        description = COALESCE($4, description),
        banner_image = COALESCE($5, banner_image),
        festival_tag = COALESCE($6, festival_tag),
        start_at = COALESCE($7, start_at),
        end_at = COALESCE($8, end_at),
        offer_type = COALESCE($9, offer_type),
        discount_type = COALESCE($10, discount_type),
        discount_value = COALESCE($11, discount_value),
        coupon_code = COALESCE($12, coupon_code),
        included_services = COALESCE($13, included_services),
        included_package = COALESCE($14, included_package),
        outlets = COALESCE($15, outlets),
        is_featured = COALESCE($16, is_featured),
        is_active = COALESCE($17, is_active)
      WHERE id = $18
      RETURNING *`,
      [
        title, title_hi, subtitle, description, banner_image, festival_tag,
        start_at, end_at, offer_type, discount_type, discount_value, coupon_code,
        included_services, included_package, outlets, is_featured, is_active, id
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Offer not found' });
    return res.json({ offer: result.rows[0], message: 'Offer updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update offer' });
  }
});

modulesRouter.patch('/offers/:id/archive', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const result = await pg.query('UPDATE offers SET is_archived = TRUE, is_active = FALSE, deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Offer not found' });
    return res.json({ message: 'Offer archived' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to archive offer' });
  }
});

modulesRouter.patch('/offers/:id/restore', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const result = await pg.query('UPDATE offers SET is_archived = FALSE, is_active = TRUE, deleted_at = NULL WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Offer not found' });
    return res.json({ message: 'Offer restored' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to restore offer' });
  }
});

// ==================== COUPONS ====================
modulesRouter.get('/coupons', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const includeArchived = req.query.archived === 'true';

    let query = 'SELECT * FROM coupons WHERE business_id = $1';
    if (!includeArchived) {
      query += ' AND is_archived = FALSE AND is_active = TRUE';
    } else {
      query += ' AND is_archived = TRUE';
    }
    const result = await pg.query(query, [businessId]);
    return res.json({ coupons: result.rows });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

modulesRouter.post('/coupons', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { business_id = 1, code, discount_type = 'percentage', discount_value, min_spend = 0 } = req.body;
    if (!code || !discount_value) return res.status(400).json({ error: 'Code and discount value required' });

    const result = await pg.query(
      `INSERT INTO coupons (business_id, code, discount_type, discount_value, min_spend)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [business_id, code.toUpperCase(), discount_type, discount_value, min_spend]
    );
    return res.status(201).json({ coupon: result.rows[0], message: 'Coupon created' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// Coupon Validation Endpoint (for Customer Booking checkout)
modulesRouter.post('/coupons/validate', async (req, res): Promise<any> => {
  try {
    const { code, business_id = 1, subtotal = 0 } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code required' });

    const result = await pg.query<any>(
      `SELECT * FROM coupons
       WHERE business_id = $1 AND UPPER(code) = UPPER($2) AND is_active = TRUE AND is_archived = FALSE`,
      [business_id, code.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ valid: false, error: 'Invalid or non-existent coupon code' });
    }

    const coupon: any = result.rows[0];
    const today = new Date().toISOString().split('T')[0];

    // Check validity date window
    if (coupon.valid_from && coupon.valid_from.toString().slice(0, 10) > today) {
      return res.status(400).json({ valid: false, error: 'This promo code is not active yet.' });
    }
    if (coupon.valid_until && coupon.valid_until.toString().slice(0, 10) < today) {
      return res.status(400).json({ valid: false, error: 'This coupon code has expired.' });
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ valid: false, error: 'This promo code has reached its maximum redemption limit.' });
    }

    const numSubtotal = parseFloat(subtotal);
    const minSpend = parseFloat(coupon.min_spend || '0');

    if (numSubtotal < minSpend) {
      return res.status(400).json({
        valid: false,
        error: `Minimum order value of ₹${minSpend} required for code ${coupon.code}`,
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'flat' || coupon.discount_type === 'fixed') {
      discount = Math.min(parseFloat(coupon.discount_value), numSubtotal);
    } else {
      discount = parseFloat(((numSubtotal * parseFloat(coupon.discount_value)) / 100).toFixed(2));
    }

    // Max discount ceiling
    if (coupon.max_discount_amount && parseFloat(coupon.max_discount_amount) > 0) {
      discount = Math.min(discount, parseFloat(coupon.max_discount_amount));
    }

    return res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discount,
      },
      message: `Coupon ${coupon.code} applied! You save ₹${discount.toFixed(2)}`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

modulesRouter.patch('/coupons/:id/archive', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const result = await pg.query('UPDATE coupons SET is_archived = TRUE, is_active = FALSE, deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Coupon not found' });
    return res.json({ message: 'Coupon archived' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to archive coupon' });
  }
});

modulesRouter.patch('/coupons/:id/restore', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const result = await pg.query('UPDATE coupons SET is_archived = FALSE, is_active = TRUE, deleted_at = NULL WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Coupon not found' });
    return res.json({ message: 'Coupon restored' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to restore coupon' });
  }
});

// ==================== GALLERY & VIDEOS ====================
modulesRouter.get('/gallery', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const includeArchived = req.query.archived === 'true';

    let query = 'SELECT * FROM gallery WHERE business_id = $1';
    if (!includeArchived) {
      query += ' AND is_archived = FALSE';
    } else {
      query += ' AND is_archived = TRUE';
    }
    const result = await pg.query(query, [businessId]);
    return res.json({ gallery: result.rows });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

modulesRouter.post('/gallery', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { business_id = 1, title, category, image_url } = req.body;
    if (!title || !image_url) return res.status(400).json({ error: 'Title and image URL required' });

    const result = await pg.query(
      `INSERT INTO gallery (business_id, title, category, image_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [business_id, title, category || 'Portfolio', image_url]
    );
    return res.status(201).json({ item: result.rows[0], message: 'Image added to gallery' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to add gallery item' });
  }
});

modulesRouter.patch('/gallery/:id/archive', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const result = await pg.query('UPDATE gallery SET is_archived = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    return res.json({ message: 'Gallery item archived' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to archive gallery item' });
  }
});

modulesRouter.patch('/gallery/:id/restore', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const result = await pg.query('UPDATE gallery SET is_archived = FALSE, deleted_at = NULL WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    return res.json({ message: 'Gallery item restored' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to restore gallery item' });
  }
});

modulesRouter.get('/videos', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const includeArchived = req.query.archived === 'true';

    let query = 'SELECT * FROM videos WHERE business_id = $1';
    if (!includeArchived) {
      query += ' AND is_archived = FALSE';
    } else {
      query += ' AND is_archived = TRUE';
    }
    const result = await pg.query(query, [businessId]);
    return res.json({ videos: result.rows });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

modulesRouter.post('/videos', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { business_id = 1, title, video_url, thumbnail_url } = req.body;
    if (!title || !video_url) return res.status(400).json({ error: 'Title and video URL required' });

    const result = await pg.query(
      `INSERT INTO videos (business_id, title, video_url, thumbnail_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [business_id, title, video_url, thumbnail_url || null]
    );
    return res.status(201).json({ video: result.rows[0], message: 'Video added' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to add video' });
  }
});

modulesRouter.patch('/videos/:id/archive', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const result = await pg.query('UPDATE videos SET is_archived = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Video not found' });
    return res.json({ message: 'Video archived' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to archive video' });
  }
});

modulesRouter.patch('/videos/:id/restore', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const result = await pg.query('UPDATE videos SET is_archived = FALSE, deleted_at = NULL WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Video not found' });
    return res.json({ message: 'Video restored' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to restore video' });
  }
});

// ==================== REVIEWS ====================
modulesRouter.get('/reviews', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const result = await pg.query(
      'SELECT * FROM reviews WHERE business_id = $1 AND is_verified = TRUE ORDER BY id DESC',
      [businessId]
    );
    return res.json({ reviews: result.rows });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

modulesRouter.post('/reviews', async (req, res): Promise<any> => {
  try {
    const { business_id = 1, user_name, rating, comment } = req.body;
    if (!user_name || !rating || !comment) return res.status(400).json({ error: 'Name, rating, and review text required' });

    const result = await pg.query(
      `INSERT INTO reviews (business_id, user_name, rating, comment, is_verified)
       VALUES ($1, $2, $3, $4, TRUE) RETURNING *`,
      [business_id, user_name, rating, comment]
    );
    return res.status(201).json({ review: result.rows[0], message: 'Thank you for your review!' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to submit review' });
  }
});
