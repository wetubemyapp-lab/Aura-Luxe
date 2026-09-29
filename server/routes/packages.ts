import { Router, Response } from 'express';
import { pg, logAuditEvent } from '../db.ts';
import { requireBusinessStaff, AuthenticatedRequest } from '../middleware/auth.ts';

export const packagesRouter = Router();

// Get all packages for a business
packagesRouter.get('/', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const includeArchived = req.query.archived === 'true';

    let query = `
      SELECT 
        id, business_id, name, description, services, duration,
        COALESCE(regular_price, original_price, price, 0) as regular_price,
        COALESCE(package_price, price, 0) as package_price,
        COALESCE(discount, '20% OFF') as discount,
        COALESCE(validity, '30 Days') as validity,
        usage_rules,
        COALESCE(outlets, 'All Outlets') as outlets,
        image_url,
        COALESCE(is_active, true) as is_active,
        COALESCE(is_archived, false) as is_archived,
        created_at
      FROM packages 
      WHERE business_id = $1
    `;
    if (!includeArchived) {
      query += ' AND COALESCE(is_archived, false) = FALSE AND COALESCE(is_active, true) = TRUE';
    } else {
      query += ' AND COALESCE(is_archived, false) = TRUE';
    }
    query += ' ORDER BY id DESC';

    const result = await pg.query(query, [businessId]);
    return res.json({ packages: result.rows });
  } catch (error: any) {
    console.error('Fetch packages error:', error);
    return res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// Admin/Staff: Create package
packagesRouter.post('/', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      business_id = 1,
      name,
      description,
      services,
      duration = '60 mins',
      regular_price,
      package_price,
      validity = '30 Days',
      usage_rules,
      outlets = 'All Outlets',
      image_url,
      is_active = true,
    } = req.body;

    if (!name || regular_price === undefined || package_price === undefined) {
      return res.status(400).json({ error: 'Name, regular price, and package price are required' });
    }

    const reg = parseFloat(regular_price);
    const pkg = parseFloat(package_price);
    const savings = Math.max(0, reg - pkg);
    const discountPct = reg > 0 ? Math.round((savings / reg) * 100) : 0;
    const discountStr = `${discountPct}% OFF`;

    const result = await pg.query<any>(
      `INSERT INTO packages (business_id, name, description, services, duration, regular_price, package_price, discount, validity, usage_rules, outlets, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        business_id,
        name,
        description || null,
        services || null,
        duration,
        reg,
        pkg,
        discountStr,
        validity,
        usage_rules || null,
        outlets,
        image_url || null,
        is_active,
      ]
    );

    const created = result.rows[0];

    await logAuditEvent({
      business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'PACKAGE_CREATED',
      entity_type: 'package',
      entity_id: created.id,
      details: { name, regular_price: reg, package_price: pkg, discount: discountStr },
    });

    return res.json({ package: created, message: 'Package created successfully' });
  } catch (error: any) {
    console.error('Create package error:', error);
    return res.status(500).json({ error: 'Failed to create package' });
  }
});

// Admin/Staff: Edit package
packagesRouter.put('/:id', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      services,
      duration,
      regular_price,
      package_price,
      validity,
      usage_rules,
      outlets,
      image_url,
      is_active,
    } = req.body;

    const reg = regular_price !== undefined ? parseFloat(regular_price) : undefined;
    const pkg = package_price !== undefined ? parseFloat(package_price) : undefined;

    let discountStr: string | undefined = undefined;
    if (reg !== undefined && pkg !== undefined) {
      const savings = Math.max(0, reg - pkg);
      const discountPct = reg > 0 ? Math.round((savings / reg) * 100) : 0;
      discountStr = `${discountPct}% OFF`;
    }

    const result = await pg.query<any>(
      `UPDATE packages
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           services = COALESCE($3, services),
           duration = COALESCE($4, duration),
           regular_price = COALESCE($5, regular_price),
           package_price = COALESCE($6, package_price),
           discount = COALESCE($7, discount),
           validity = COALESCE($8, validity),
           usage_rules = COALESCE($9, usage_rules),
           outlets = COALESCE($10, outlets),
           image_url = COALESCE($11, image_url),
           is_active = COALESCE($12, is_active)
       WHERE id = $13
       RETURNING *`,
      [
        name || null,
        description || null,
        services || null,
        duration || null,
        reg !== undefined ? reg : null,
        pkg !== undefined ? pkg : null,
        discountStr || null,
        validity || null,
        usage_rules || null,
        outlets || null,
        image_url || null,
        is_active !== undefined ? is_active : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const updated = result.rows[0];

    await logAuditEvent({
      business_id: updated.business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'PACKAGE_UPDATED',
      entity_type: 'package',
      entity_id: parseInt(id),
      details: { name: updated.name },
    });

    return res.json({ package: updated, message: 'Package updated successfully' });
  } catch (error: any) {
    console.error('Update package error:', error);
    return res.status(500).json({ error: 'Failed to update package' });
  }
});

// Archive package
packagesRouter.patch('/:id/archive', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query<any>(
      `UPDATE packages SET is_archived = TRUE, is_active = FALSE WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Package not found' });
    return res.json({ package: result.rows[0], message: 'Package archived' });
  } catch (error: any) {
    console.error('Archive package error:', error);
    return res.status(500).json({ error: 'Failed to archive package' });
  }
});

// Restore package
packagesRouter.patch('/:id/restore', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query<any>(
      `UPDATE packages SET is_archived = FALSE, is_active = TRUE WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Package not found' });
    return res.json({ package: result.rows[0], message: 'Package restored' });
  } catch (error: any) {
    console.error('Restore package error:', error);
    return res.status(500).json({ error: 'Failed to restore package' });
  }
});
