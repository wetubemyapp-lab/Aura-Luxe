import { Router, Response } from 'express';
import { pg } from '../db.ts';
import { requireAdmin, requireAuth, AuthenticatedRequest } from '../middleware/auth.ts';

export const ledgerRouter = Router();

// Process Checkout & Payment (Cash, UPI, Card, Online, Wallet)
ledgerRouter.post('/checkout', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      booking_id,
      payment_method = 'upi',
      amount,
      tip_amount = 0,
      notes,
    } = req.body;

    if (!booking_id || amount === undefined) {
      return res.status(400).json({ error: 'Booking ID and amount are required' });
    }

    // Fetch booking details
    const bookingRes = await pg.query<any>(
      `SELECT b.*, s.title as service_title, st.name as staff_name, st.commission_rate,
              bus.tax_rate, bus.platform_fee_pct, bus.primary_currency, bus.name as business_name,
              u.name as customer_name, u.email as customer_email
       FROM bookings b
       LEFT JOIN services s ON b.service_id = s.id
       LEFT JOIN staff st ON b.staff_id = st.id
       LEFT JOIN businesses bus ON b.business_id = bus.id
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [booking_id]
    );

    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingRes.rows[0];
    const businessId = booking.business_id || 1;
    const finalPaymentAmount = parseFloat(amount);
    const refNo = `TXN-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Record primary customer payment in Universal Ledger
    const paymentEntry = await pg.query<any>(
      `INSERT INTO ledger_entries (
        business_id, booking_id, entry_type, payment_method, amount, status, reference_no, notes
      ) VALUES ($1, $2, 'payment', $3, $4, 'completed', $5, $6)
      RETURNING *`,
      [
        businessId,
        booking_id,
        finalPaymentAmount,
        payment_method,
        refNo,
        notes || `Settlement for Appointment #${booking_id}`
      ]
    );

    // 2. If tip is included, record tip ledger entry
    if (parseFloat(tip_amount) > 0) {
      await pg.query(
        `INSERT INTO ledger_entries (
          business_id, booking_id, entry_type, payment_method, amount, status, reference_no, notes
        ) VALUES ($1, $2, 'tip', $3, $4, 'completed', $5, $6)`,
        [
          businessId,
          booking_id,
          payment_method,
          parseFloat(tip_amount),
          `${refNo}-TIP`,
          `Gratuity for ${booking.staff_name || 'Staff'}`
        ]
      );
    }

    // 3. Compute and record staff commission liability in ledger
    if (booking.staff_id && booking.commission_rate) {
      const commissionRate = parseFloat(booking.commission_rate) / 100;
      const commissionAmount = parseFloat((parseFloat(booking.service_amount || finalPaymentAmount) * commissionRate).toFixed(2));

      await pg.query(
        `INSERT INTO ledger_entries (
          business_id, booking_id, entry_type, payment_method, amount, status, reference_no, notes
        ) VALUES ($1, $2, 'staff_commission', $3, $4, 'completed', $5, $6)`,
        [
          businessId,
          booking_id,
          payment_method,
          commissionAmount,
          `${refNo}-COMM`,
          `Commission payable to ${booking.staff_name} (${booking.commission_rate}%)`
        ]
      );
    }

    // 4. Update booking payment status
    await pg.query(
      `UPDATE bookings
       SET payment_status = 'paid', status = 'completed'
       WHERE id = $1`,
      [booking_id]
    );

    return res.json({
      success: true,
      message: 'Payment settled and recorded in Universal Ledger',
      reference_no: refNo,
      ledger_entry: paymentEntry.rows[0],
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: 'Checkout processing failed' });
  }
});

// Admin: Get ledger entries
ledgerRouter.get('/entries', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : null;
    let query = `
      SELECT l.*, b.booking_date, b.booking_time, u.name as customer_name, s.title as service_title
      FROM ledger_entries l
      LEFT JOIN bookings b ON l.booking_id = b.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (businessId) {
      params.push(businessId);
      query += ` AND l.business_id = $${params.length}`;
    }

    query += ' ORDER BY l.id DESC LIMIT 100';

    const result = await pg.query(query, params);
    return res.json({ entries: result.rows });
  } catch (error: any) {
    console.error('Fetch ledger entries error:', error);
    return res.status(500).json({ error: 'Failed to retrieve ledger entries' });
  }
});

// Admin: Get ledger financial metrics & analytics
ledgerRouter.get('/summary', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : null;
    const filterClause = businessId ? 'WHERE business_id = $1' : '';
    const params = businessId ? [businessId] : [];

    const [totalRevenue, paymentMethods, commissions, unpaidBookings] = await Promise.all([
      pg.query<{ total: string }>(
        `SELECT COALESCE(SUM(amount), 0) as total FROM ledger_entries ${filterClause} ${businessId ? "AND entry_type = 'payment'" : "WHERE entry_type = 'payment'"}`,
        params
      ),
      pg.query<{ payment_method: string; total: string }>(
        `SELECT payment_method, COALESCE(SUM(amount), 0) as total FROM ledger_entries ${filterClause} ${businessId ? "AND entry_type = 'payment'" : "WHERE entry_type = 'payment'"} GROUP BY payment_method`,
        params
      ),
      pg.query<{ total: string }>(
        `SELECT COALESCE(SUM(amount), 0) as total FROM ledger_entries ${filterClause} ${businessId ? "AND entry_type = 'staff_commission'" : "WHERE entry_type = 'staff_commission'"}`,
        params
      ),
      pg.query<{ count: string; unpaid_total: string }>(
        `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as unpaid_total FROM bookings ${filterClause} ${businessId ? "AND payment_status = 'unpaid'" : "WHERE payment_status = 'unpaid'"}`,
        params
      ),
    ]);

    return res.json({
      totalRevenue: parseFloat(totalRevenue.rows[0]?.total || '0'),
      commissionsOwed: parseFloat(commissions.rows[0]?.total || '0'),
      unpaidCount: parseInt(unpaidBookings.rows[0]?.count || '0'),
      unpaidAmount: parseFloat(unpaidBookings.rows[0]?.unpaid_total || '0'),
      paymentBreakdown: paymentMethods.rows.map((r) => ({
        method: r.payment_method,
        amount: parseFloat(r.total),
      })),
    });
  } catch (error: any) {
    console.error('Fetch ledger summary error:', error);
    return res.status(500).json({ error: 'Failed to retrieve financial summary' });
  }
});

// Itemized Invoice Generator
ledgerRouter.get('/invoice/:bookingId', async (req, res): Promise<any> => {
  try {
    const { bookingId } = req.params;
    const result = await pg.query<any>(
      `SELECT b.*, s.title as service_title, s.price as service_unit_price, s.duration_mins,
              st.name as staff_name, st.role_title as staff_role,
              bus.name as business_name, bus.category, bus.address as business_address,
              bus.phone as business_phone, bus.email as business_email, bus.primary_currency,
              bus.tax_rate, bus.logo_url as business_logo,
              u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM bookings b
       LEFT JOIN services s ON b.service_id = s.id
       LEFT JOIN staff st ON b.staff_id = st.id
       LEFT JOIN businesses bus ON b.business_id = bus.id
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const booking = result.rows[0];
    const ledger = await pg.query<any>(
      'SELECT * FROM ledger_entries WHERE booking_id = $1 ORDER BY id ASC',
      [bookingId]
    );

    return res.json({
      invoice: {
        invoiceNumber: `INV-${new Date(booking.created_at).getFullYear()}-${booking.id.toString().padStart(5, '0')}`,
        booking,
        ledgerEntries: ledger.rows,
      }
    });
  } catch (error: any) {
    console.error('Invoice generation error:', error);
    return res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

// Admin: Get all settlements and payout batches
ledgerRouter.get('/settlements', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const result = await pg.query(
      `SELECT * FROM settlements WHERE business_id = $1 ORDER BY id DESC`,
      [businessId]
    );
    return res.json({ settlements: result.rows });
  } catch (err: any) {
    console.error('Fetch settlements error:', err);
    return res.status(500).json({ error: 'Failed to fetch settlements' });
  }
});

// Admin: Create / Trigger a settlement batch
ledgerRouter.post('/settlements/create', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      business_id = 1,
      settlement_period_start,
      settlement_period_end,
      payout_method = 'bank_transfer',
      notes,
    } = req.body;

    // Calculate sum of completed bookings in this period that haven't been settled
    const totalsRes = await pg.query<{ gross: string; platform_fee: string; net: string }>(
      `SELECT
        COALESCE(SUM(amount), 0) as gross,
        COALESCE(SUM(platform_fee_amount), 0) as platform_fee,
        COALESCE(SUM(merchant_net_amount), 0) as net
       FROM ledger_entries
       WHERE business_id = $1 AND entry_type IN ('payment', 'deposit') AND status = 'completed'`,
      [business_id]
    );

    const gross = parseFloat(totalsRes.rows[0]?.gross || '0');
    const platformCommission = parseFloat(totalsRes.rows[0]?.platform_fee || '0');
    const netPayout = parseFloat(totalsRes.rows[0]?.net || '0');

    const startDate = settlement_period_start || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const endDate = settlement_period_end || new Date().toISOString().slice(0, 10);
    const refNo = `SETTLE-${Date.now().toString().slice(-6)}`;

    const result = await pg.query(
      `INSERT INTO settlements (
        business_id, settlement_period_start, settlement_period_end,
        gross_amount, platform_commission, net_payout, status, payout_method, reference_no, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, 'settled', $7, $8, $9)
      RETURNING *`,
      [business_id, startDate, endDate, gross, platformCommission, netPayout, payout_method, refNo, notes || 'Automated Settlement Batch']
    );

    return res.status(201).json({ settlement: result.rows[0], message: 'Settlement batch generated successfully' });
  } catch (err: any) {
    console.error('Create settlement error:', err);
    return res.status(500).json({ error: 'Failed to create settlement batch' });
  }
});

// Admin: Update platform commission %
ledgerRouter.put('/platform-commission', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { business_id = 1, platform_commission_pct, advance_payment_percentage } = req.body;

    const result = await pg.query(
      `UPDATE businesses
       SET platform_commission_pct = COALESCE($1, platform_commission_pct),
           advance_payment_percentage = COALESCE($2, advance_payment_percentage),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, platform_commission_pct, advance_payment_percentage`,
      [platform_commission_pct || null, advance_payment_percentage || null, business_id]
    );

    return res.json({
      config: result.rows[0],
      message: 'Platform commission and advance payment settings updated',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update commission settings' });
  }
});

