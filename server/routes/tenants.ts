import { Router, Response } from 'express';
import { pg } from '../db.ts';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

export const tenantsRouter = Router();

// Public: Get all active businesses / tenants
tenantsRouter.get('/', async (_req, res): Promise<any> => {
  try {
    const result = await pg.query('SELECT * FROM businesses ORDER BY id ASC');
    return res.json({ businesses: result.rows });
  } catch (error: any) {
    console.error('Fetch tenants error:', error);
    return res.status(500).json({ error: 'Failed to retrieve businesses' });
  }
});

// Public: Get single business by slug or ID
tenantsRouter.get('/:identifier', async (req, res): Promise<any> => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const query = isNumeric
      ? 'SELECT * FROM businesses WHERE id = $1'
      : 'SELECT * FROM businesses WHERE slug = $1';

    const result = await pg.query(query, [isNumeric ? parseInt(identifier) : identifier]);

    if (result.rows.length === 0) {
      // Fallback to first business
      const fallback = await pg.query('SELECT * FROM businesses ORDER BY id ASC LIMIT 1');
      return res.json({ business: fallback.rows[0] });
    }

    return res.json({ business: result.rows[0] });
  } catch (error: any) {
    console.error('Fetch tenant error:', error);
    return res.status(500).json({ error: 'Failed to retrieve business' });
  }
});

// Admin: Update business rules, branding & operating configuration
tenantsRouter.put('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
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
      tax_rate,
      slot_interval_mins,
      buffer_time_mins,
      deposit_required,
      deposit_percentage,
      advance_payment_percentage,
      home_service_travel_fee,
      features_config,
    } = req.body;

    const result = await pg.query(
      `UPDATE businesses
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
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
           tax_rate = COALESCE($15, tax_rate),
           slot_interval_mins = COALESCE($16, slot_interval_mins),
           buffer_time_mins = COALESCE($17, buffer_time_mins),
           deposit_required = COALESCE($18, deposit_required),
           deposit_percentage = COALESCE($19, deposit_percentage),
           advance_payment_percentage = COALESCE($20, advance_payment_percentage),
           home_service_travel_fee = COALESCE($21, home_service_travel_fee),
           features_config = COALESCE($22, features_config),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $23
       RETURNING *`,
      [
        name,
        category,
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
        tax_rate,
        slot_interval_mins,
        buffer_time_mins,
        deposit_required,
        deposit_percentage,
        advance_payment_percentage,
        home_service_travel_fee,
        typeof features_config === 'object' ? JSON.stringify(features_config) : features_config,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    return res.json({
      business: result.rows[0],
      message: 'Business configuration updated successfully',
    });
  } catch (error: any) {
    console.error('Update tenant error:', error);
    return res.status(500).json({ error: 'Failed to update business configuration' });
  }
});
