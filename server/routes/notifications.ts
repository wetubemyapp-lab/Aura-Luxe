import { Router, Request, Response } from 'express';
import { pg } from '../db.ts';
import { notificationService } from '../services/notificationService.ts';

export const notificationsRouter = Router();

// Get notification dispatch history logs
notificationsRouter.get('/history', async (req: Request, res: Response): Promise<any> => {
  try {
    const businessId = Number(req.query.business_id || 1);
    const limit = Number(req.query.limit || 50);

    const historyRes = await pg.query<any>(`
      SELECT id, booking_id, event_type, channel, provider, recipient, title, message, status, template_name, created_at
      FROM notifications
      WHERE business_id = $1
      ORDER BY id DESC
      LIMIT $2
    `, [businessId, limit]);

    // Fetch breakdown stats
    const statsRes = await pg.query<any>(`
      SELECT channel, status, COUNT(*) as count
      FROM notifications
      WHERE business_id = $1
      GROUP BY channel, status
    `, [businessId]);

    const activeProviders = notificationService.getRegisteredProviders();

    return res.json({
      history: historyRes.rows,
      stats: statsRes.rows,
      providers: activeProviders,
    });
  } catch (error: any) {
    console.error('Failed to load notifications history:', error);
    return res.status(500).json({ error: 'Failed to load notifications history' });
  }
});

// Trigger a mock event simulation for any booking
notificationsRouter.post('/simulate', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      eventType,
      bookingId,
      businessId = 1,
      recipientPhone = '+91 98765 43210',
      recipientEmail = 'customer@auraluxe.com',
      recipientUserId = 2,
      customerName = 'Amit Sharma',
    } = req.body;

    if (!eventType || !bookingId) {
      return res.status(400).json({ error: 'eventType and bookingId are required' });
    }

    const result = await notificationService.dispatch({
      eventType,
      bookingId: Number(bookingId),
      businessId: Number(businessId),
      recipientPhone,
      recipientEmail,
      recipientUserId: Number(recipientUserId),
      customerName,
    });

    return res.json({
      success: true,
      message: 'Event simulated successfully',
      dispatchResult: result,
    });
  } catch (error: any) {
    console.error('Failed to simulate notification event:', error);
    return res.status(500).json({ error: error.message || 'Simulation failed' });
  }
});
