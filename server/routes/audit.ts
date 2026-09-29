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

// Export helper for recording audit events
export async function logAuditEvent(data: {
  business_id: number;
  user_id: number;
  user_name: string;
  user_role: string;
  action: string;
  entity_type: string;
  entity_id?: number;
  details?: any;
}) {
  try {
    await pg.query(
      `INSERT INTO audit_logs (business_id, user_id, user_name, user_role, action, entity_type, entity_id, details_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        data.business_id,
        data.user_id,
        data.user_name,
        data.user_role,
        data.action,
        data.entity_type,
        data.entity_id || null,
        data.details ? JSON.stringify(data.details) : null,
      ]
    );
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}
