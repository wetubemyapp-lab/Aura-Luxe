import { Router, Response, NextFunction } from 'express';
import { pg, logAuditEvent } from '../db.ts';
import { requireBusinessStaff, AuthenticatedRequest, verifyToken } from '../middleware/auth.ts';

export const reviewsRouter = Router();

// Helper middleware to optionally verify token if present (does not block if missing)
function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
}

// GET /api/reviews (Public) - Fetch active visible reviews
reviewsRouter.get('/', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const serviceId = req.query.serviceId ? parseInt(req.query.serviceId as string) : null;
    const staffId = req.query.staffId ? parseInt(req.query.staffId as string) : null;
    const rating = req.query.rating ? parseInt(req.query.rating as string) : null;

    let query = `
      SELECT 
        r.id, r.business_id, r.user_name, r.rating, r.title, r.comment, r.images,
        r.service_id, r.staff_id, r.booking_id, r.owner_reply, r.is_verified, r.created_at,
        s.title as service_title, st.name as staff_name
      FROM reviews r
      LEFT JOIN services s ON r.service_id = s.id
      LEFT JOIN staff st ON r.staff_id = st.id
      WHERE r.business_id = $1 AND COALESCE(r.is_hidden, false) = FALSE AND COALESCE(r.is_removed, false) = FALSE
    `;

    const params: any[] = [businessId];

    if (serviceId) {
      params.push(serviceId);
      query += ` AND r.service_id = $${params.length}`;
    }
    if (staffId) {
      params.push(staffId);
      query += ` AND r.staff_id = $${params.length}`;
    }
    if (rating) {
      params.push(rating);
      query += ` AND r.rating = $${params.length}`;
    }

    query += ' ORDER BY r.created_at DESC, r.id DESC';

    const result = await pg.query(query, params);
    return res.json({ reviews: result.rows });
  } catch (error: any) {
    console.error('Fetch reviews error:', error);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET /api/reviews/admin (Admin/Staff only) - Fetch all reviews for moderation
reviewsRouter.get('/admin', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;

    const query = `
      SELECT 
        r.*,
        s.title as service_title, st.name as staff_name
      FROM reviews r
      LEFT JOIN services s ON r.service_id = s.id
      LEFT JOIN staff st ON r.staff_id = st.id
      WHERE r.business_id = $1
      ORDER BY r.created_at DESC, r.id DESC
    `;

    const result = await pg.query(query, [businessId]);
    return res.json({ reviews: result.rows });
  } catch (error: any) {
    console.error('Admin fetch reviews error:', error);
    return res.status(500).json({ error: 'Failed to fetch admin reviews' });
  }
});

// POST /api/reviews (Public/Authenticated) - Submit a review
reviewsRouter.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      business_id = 1,
      user_name,
      rating,
      title,
      comment,
      images,
      service_id,
      staff_id,
      booking_id,
    } = req.body;

    if (!user_name || !rating || !comment) {
      return res.status(400).json({ error: 'User name, rating (1-5), and comment are required' });
    }

    let isVerified = false;
    let actualServiceId = service_id ? parseInt(service_id) : null;
    let actualStaffId = staff_id ? parseInt(staff_id) : null;
    let actualBookingId = booking_id ? parseInt(booking_id) : null;

    // Check if customer is verified via Booking ID
    if (actualBookingId) {
      const bookingCheck = await pg.query<any>(
        'SELECT id, user_id, service_id, staff_id, status FROM bookings WHERE id = $1 AND business_id = $2',
        [actualBookingId, business_id]
      );

      if (bookingCheck.rows.length > 0) {
        const booking = bookingCheck.rows[0];
        
        // If logged in, ensure booking belongs to the user, OR if booking completed
        const isCompleted = ['COMPLETED', 'completed', 'CHECKED_IN', 'in_service'].includes(booking.status);
        
        if (req.user) {
          if (booking.user_id === req.user.id && isCompleted) {
            isVerified = true;
          }
        } else if (isCompleted) {
          // Unauthenticated customer but has a valid completed booking reference
          isVerified = true;
        }

        // Auto-fill service and staff if not manually selected
        if (!actualServiceId && booking.service_id) {
          actualServiceId = booking.service_id;
        }
        if (!actualStaffId && booking.staff_id) {
          actualStaffId = booking.staff_id;
        }
      }
    }

    const result = await pg.query<any>(
      `INSERT INTO reviews (business_id, user_name, rating, title, comment, images, service_id, staff_id, booking_id, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        business_id,
        user_name,
        parseInt(rating),
        title || null,
        comment,
        images || null,
        actualServiceId,
        actualStaffId,
        actualBookingId,
        isVerified,
      ]
    );

    const created = result.rows[0];

    // Log the review submission audit event
    await logAuditEvent({
      business_id,
      user_id: req.user ? req.user.id : null,
      user_name: req.user ? req.user.name : 'Guest',
      user_role: req.user ? req.user.role : 'customer',
      action: 'REVIEW_SUBMITTED',
      entity_type: 'review',
      entity_id: created.id,
      details: { rating, is_verified: isVerified },
    });

    return res.status(201).json({
      review: created,
      message: isVerified 
        ? 'Verified review submitted successfully! Thank you!' 
        : 'Review submitted successfully! Thank you!',
    });
  } catch (error: any) {
    console.error('Submit review error:', error);
    return res.status(500).json({ error: 'Failed to submit review' });
  }
});

// POST /api/reviews/:id/reply (Admin/Staff only) - Reply to a review
reviewsRouter.post('/:id/reply', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ error: 'Reply text is required' });
    }

    const result = await pg.query<any>(
      `UPDATE reviews SET owner_reply = $1 WHERE id = $2 RETURNING *`,
      [reply, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await logAuditEvent({
      business_id: result.rows[0].business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'REVIEW_REPLIED',
      entity_type: 'review',
      entity_id: parseInt(id),
      details: { reply_length: reply.length },
    });

    return res.json({ review: result.rows[0], message: 'Reply posted successfully' });
  } catch (error: any) {
    console.error('Review reply error:', error);
    return res.status(500).json({ error: 'Failed to reply to review' });
  }
});

// POST /api/reviews/:id/hide (Admin/Staff only) - Hide a review
reviewsRouter.post('/:id/hide', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query<any>(
      `UPDATE reviews SET is_hidden = TRUE WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await logAuditEvent({
      business_id: result.rows[0].business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'REVIEW_HIDDEN',
      entity_type: 'review',
      entity_id: parseInt(id),
      details: { hidden: true },
    });

    return res.json({ review: result.rows[0], message: 'Review hidden from public view' });
  } catch (error: any) {
    console.error('Hide review error:', error);
    return res.status(500).json({ error: 'Failed to hide review' });
  }
});

// POST /api/reviews/:id/report (Public) - Report a review
reviewsRouter.post('/:id/report', async (req, res): Promise<any> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Reporting reason is required' });
    }

    const result = await pg.query<any>(
      `UPDATE reviews SET is_reported = TRUE, report_reason = $1 WHERE id = $2 RETURNING *`,
      [reason, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    return res.json({ review: result.rows[0], message: 'Review reported to moderators' });
  } catch (error: any) {
    console.error('Report review error:', error);
    return res.status(500).json({ error: 'Failed to report review' });
  }
});

// POST /api/reviews/:id/restore (Admin/Staff only) - Restore a review (unhide, unreport, unremove)
reviewsRouter.post('/:id/restore', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query<any>(
      `UPDATE reviews 
       SET is_hidden = FALSE, is_reported = FALSE, report_reason = NULL, is_removed = FALSE, removal_reason = NULL 
       WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await logAuditEvent({
      business_id: result.rows[0].business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'REVIEW_RESTORED',
      entity_type: 'review',
      entity_id: parseInt(id),
      details: { restored: true },
    });

    return res.json({ review: result.rows[0], message: 'Review fully restored' });
  } catch (error: any) {
    console.error('Restore review error:', error);
    return res.status(500).json({ error: 'Failed to restore review' });
  }
});

// POST /api/reviews/:id/remove (Admin/Staff only) - Remove review with platform policy reason
reviewsRouter.post('/:id/remove', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Removal policy reason is required' });
    }

    const result = await pg.query<any>(
      `UPDATE reviews SET is_removed = TRUE, removal_reason = $1 WHERE id = $2 RETURNING *`,
      [reason, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await logAuditEvent({
      business_id: result.rows[0].business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'REVIEW_REMOVED',
      entity_type: 'review',
      entity_id: parseInt(id),
      details: { removal_reason: reason },
    });

    return res.json({ review: result.rows[0], message: 'Review removed from platform' });
  } catch (error: any) {
    console.error('Remove review error:', error);
    return res.status(500).json({ error: 'Failed to remove review' });
  }
});
