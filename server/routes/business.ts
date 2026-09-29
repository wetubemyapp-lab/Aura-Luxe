import { Router, Response } from 'express';
import { pg } from '../db.ts';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

export const businessRouter = Router();

// Public: Get business settings & profile
businessRouter.get('/settings', async (_req, res): Promise<any> => {
  try {
    const result = await pg.query('SELECT * FROM business_settings ORDER BY id ASC LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    return res.json({ settings: result.rows[0] });
  } catch (error: any) {
    console.error('Fetch settings error:', error);
    return res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

// Admin: Update business settings (Dynamic Business Management)
businessRouter.put('/settings', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      business_name,
      business_type,
      tagline,
      tagline_hi,
      phone,
      email,
      address,
      opening_hours,
      about_text,
      about_text_hi,
      banner_url,
      logo_url,
      primary_currency,
      theme_accent,
    } = req.body;

    const result = await pg.query(
      `UPDATE business_settings
       SET business_name = COALESCE($1, business_name),
           business_type = COALESCE($2, business_type),
           tagline = COALESCE($3, tagline),
           tagline_hi = COALESCE($4, tagline_hi),
           phone = COALESCE($5, phone),
           email = COALESCE($6, email),
           address = COALESCE($7, address),
           opening_hours = COALESCE($8, opening_hours),
           about_text = COALESCE($9, about_text),
           about_text_hi = COALESCE($10, about_text_hi),
           banner_url = COALESCE($11, banner_url),
           logo_url = COALESCE($12, logo_url),
           primary_currency = COALESCE($13, primary_currency),
           theme_accent = COALESCE($14, theme_accent),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = (SELECT id FROM business_settings ORDER BY id ASC LIMIT 1)
       RETURNING *`,
      [
        business_name,
        business_type,
        tagline,
        tagline_hi,
        phone,
        email,
        address,
        opening_hours,
        about_text,
        about_text_hi,
        banner_url,
        logo_url,
        primary_currency,
        theme_accent,
      ]
    );

    return res.json({
      settings: result.rows[0],
      message: 'Business settings updated successfully',
    });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return res.status(500).json({ error: 'Failed to update business settings' });
  }
});

// Admin: Summary counters for dashboard
businessRouter.get('/summary', requireAdmin, async (_req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const [servicesRes, staffRes, bookingsRes, customersRes] = await Promise.all([
      pg.query<{ count: string }>('SELECT COUNT(*) as count FROM services'),
      pg.query<{ count: string }>('SELECT COUNT(*) as count FROM staff'),
      pg.query<{ count: string }>('SELECT COUNT(*) as count FROM bookings'),
      pg.query<{ count: string }>("SELECT COUNT(*) as count FROM users WHERE role = 'customer'"),
    ]);

    return res.json({
      servicesCount: parseInt(servicesRes.rows[0]?.count || '0'),
      staffCount: parseInt(staffRes.rows[0]?.count || '0'),
      bookingsCount: parseInt(bookingsRes.rows[0]?.count || '0'),
      customersCount: parseInt(customersRes.rows[0]?.count || '0'),
    });
  } catch (error: any) {
    console.error('Fetch summary error:', error);
    return res.status(500).json({ error: 'Failed to fetch business summary' });
  }
});
