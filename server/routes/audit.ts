import { Router, Response } from 'express';
import { pg } from '../db.ts';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

export const auditRouter = Router();

// Admin: Get auditable system operations
auditRouter.get('/', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const action = req.query.action as string;
    const entityType = req.query.entityType as string;

    let query = `SELECT * FROM audit_logs WHERE business_id = $1`;
    const params: any[] = [businessId];

    if (action) {
      params.push(action);
      query += ` AND action = $${params.length}`;
    }

    if (entityType) {
      params.push(entityType);
      query += ` AND entity_type = $${params.length}`;
    }

    query += ` ORDER BY id DESC LIMIT 150`;

    const result = await pg.query(query, params);
    return res.json({ logs: result.rows });
  } catch (error: any) {
    console.error('Fetch audit logs error:', error);
    return res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});
