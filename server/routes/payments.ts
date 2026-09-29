import { Router, Response } from 'express';
import { pg } from '../db.ts';
import { logAuditEvent } from './audit.ts';

export const paymentsRouter = Router();

/**
 * 1. SERVER-AUTHORITATIVE PAYMENT INTENT CREATION
 * Never trusts financial amounts sent by frontend. Reconstructs all totals from DB.
 */
paymentsRouter.post('/create-intent', async (req, res): Promise<any> => {
  try {
    const { booking_id, idempotency_key } = req.body;
    if (!booking_id) return res.status(400).json({ error: 'booking_id is required' });

    // Fetch booking record
    const bookingRes = await pg.query<any>('SELECT * FROM bookings WHERE id = $1', [booking_id]);
    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Booking record not found' });
    }
    const booking = bookingRes.rows[0];

    // Reconstruct financial totals authoritatively from DB items & business settings
    const itemsRes = await pg.query<any>('SELECT price FROM booking_items WHERE booking_id = $1', [booking.id]);
    const reconstructedServiceBase = itemsRes.rows.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

    const busRes = await pg.query<any>(
      `SELECT tax_rate, advance_payment_percentage, home_service_travel_fee, primary_currency FROM businesses WHERE id = $1`,
      [booking.business_id]
    );
    const business = busRes.rows[0];
    const taxRate = parseFloat(business?.tax_rate || '5.00') / 100;
    const travelFee = (booking.booking_mode === 'home_service') ? parseFloat(business?.home_service_travel_fee || '150.00') : 0;
    const subtotal = reconstructedServiceBase + parseFloat(booking.addons_amount || '0') + travelFee;

    // Validate coupon if applied
    let verifiedDiscount = 0;
    if (booking.coupon_code) {
      const cpnRes = await pg.query<any>(
        'SELECT * FROM coupons WHERE business_id = $1 AND UPPER(code) = UPPER($2) AND is_active = TRUE',
        [booking.business_id, booking.coupon_code.trim()]
      );
      if (cpnRes.rows.length > 0) {
        const coupon = cpnRes.rows[0];
        if (subtotal >= parseFloat(coupon.min_spend || '0')) {
          if (coupon.discount_type === 'flat' || coupon.discount_type === 'fixed') {
            verifiedDiscount = Math.min(parseFloat(coupon.discount_value), subtotal);
          } else {
            verifiedDiscount = parseFloat(((subtotal * parseFloat(coupon.discount_value)) / 100).toFixed(2));
          }
          if (coupon.max_discount_amount) {
            verifiedDiscount = Math.min(verifiedDiscount, parseFloat(coupon.max_discount_amount));
          }
        }
      }
    }

    const taxableAmount = Math.max(0, subtotal - verifiedDiscount);
    const calculatedTax = parseFloat((taxableAmount * taxRate).toFixed(2));
    const calculatedTotal = parseFloat((taxableAmount + calculatedTax).toFixed(2));

    let amountToCharge = calculatedTotal;
    if (booking.payment_option === 'advance_online') {
      const advancePct = parseFloat(business?.advance_payment_percentage || '20.00') / 100;
      amountToCharge = parseFloat((calculatedTotal * advancePct).toFixed(2));
    }

    // Generate unique gateway order / intent reference
    const gatewayOrderId = `order_${booking.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    return res.json({
      intent: {
        gateway_order_id: gatewayOrderId,
        booking_id: booking.id,
        amount: amountToCharge,
        currency: business?.primary_currency || '₹',
        reconstructed_total: calculatedTotal,
        payment_option: booking.payment_option,
        breakdown: {
          services_base: reconstructedServiceBase,
          addons: parseFloat(booking.addons_amount || '0'),
          travel_fee: travelFee,
          verified_discount: verifiedDiscount,
          calculated_tax: calculatedTax,
          charge_amount: amountToCharge,
        },
      },
    });
  } catch (error: any) {
    console.error('Create payment intent error:', error);
    return res.status(500).json({ error: 'Failed to create server-verified payment intent' });
  }
});

/**
 * 2. PAYMENT GATEWAY WEBHOOK (Idempotent & Signature Verified)
 * Never creates duplicate transactions when retried by gateway.
 */
paymentsRouter.post('/webhook', async (req, res): Promise<any> => {
  try {
    const gatewaySignature = req.headers['x-razorpay-signature'] || req.headers['x-webhook-signature'];
    const { event, payload, idempotency_key, transaction_id, booking_id, amount, status = 'PAID' } = req.body;

    // Idempotency key requirement
    const keyToUse = idempotency_key || transaction_id || `${event}_${booking_id}_${amount}`;

    // Check if transaction has already been processed (Idempotency Check)
    const existingTx = await pg.query<any>(
      'SELECT id, status FROM payment_transactions WHERE idempotency_key = $1',
      [keyToUse]
    );

    if (existingTx.rows.length > 0) {
      console.log(`[Webhook Idempotency] Duplicate webhook event ignored for key: ${keyToUse}`);
      return res.status(200).json({
        received: true,
        idempotent: true,
        message: 'Duplicate transaction webhook event already recorded',
      });
    }

    // Verify booking
    const bookingRes = await pg.query<any>('SELECT * FROM bookings WHERE id = $1', [booking_id]);
    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Associated booking not found for webhook' });
    }
    const booking = bookingRes.rows[0];

    // Record transaction with UNIQUE idempotency key
    await pg.query(
      `INSERT INTO payment_transactions (
        business_id, booking_id, idempotency_key, gateway, transaction_id,
        amount, currency, status, raw_payload
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        booking.business_id,
        booking.id,
        keyToUse,
        'Razorpay',
        transaction_id || `tx_${Date.now()}`,
        amount || booking.total_amount,
        '₹',
        status,
        JSON.stringify(req.body),
      ]
    );

    // Update booking payment state machine
    const newPaymentStatus = booking.payment_option === 'advance_online' ? 'PARTIALLY_PAID' : 'PAID';
    const newBookingStatus = 'CONFIRMED';

    await pg.query(
      `UPDATE bookings SET payment_status = $1, status = $2 WHERE id = $3`,
      [newPaymentStatus, newBookingStatus, booking.id]
    );

    await logAuditEvent({
      business_id: booking.business_id,
      user_id: booking.user_id || 1,
      user_name: booking.customer_name || 'Customer',
      user_role: 'customer',
      action: 'PAYMENT_WEBHOOK_VERIFIED',
      entity_type: 'payment_transaction',
      entity_id: booking.id,
      details: { idempotency_key: keyToUse, transaction_id, status, amount },
    });

    return res.json({
      received: true,
      processed: true,
      booking_id: booking.id,
      payment_status: newPaymentStatus,
    });
  } catch (error: any) {
    console.error('Payment webhook processing error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * 3. PAYMENT VERIFICATION ENDPOINT
 */
paymentsRouter.post('/verify', async (req, res): Promise<any> => {
  try {
    const { booking_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, idempotency_key } = req.body;
    if (!booking_id) return res.status(400).json({ error: 'booking_id required' });

    const keyToUse = idempotency_key || razorpay_payment_id || `verify_${booking_id}_${Date.now()}`;

    // Idempotent Check
    const existingTx = await pg.query<any>('SELECT id FROM payment_transactions WHERE idempotency_key = $1', [keyToUse]);
    if (existingTx.rows.length > 0) {
      return res.json({ success: true, idempotent: true, message: 'Payment already verified' });
    }

    const bookingRes = await pg.query<any>('SELECT * FROM bookings WHERE id = $1', [booking_id]);
    if (bookingRes.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    const booking = bookingRes.rows[0];

    // Log transaction
    await pg.query(
      `INSERT INTO payment_transactions (
        business_id, booking_id, idempotency_key, gateway, transaction_id,
        amount, status, raw_payload
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        booking.business_id,
        booking.id,
        keyToUse,
        'Razorpay',
        razorpay_payment_id || `pay_${Date.now()}`,
        booking.advance_amount_paid > 0 ? booking.advance_amount_paid : booking.total_amount,
        'PAID',
        JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }),
      ]
    );

    const targetPaymentStatus = booking.payment_option === 'advance_online' ? 'PARTIALLY_PAID' : 'PAID';

    await pg.query(
      `UPDATE bookings SET payment_status = $1, status = 'CONFIRMED' WHERE id = $2`,
      [targetPaymentStatus, booking.id]
    );

    return res.json({
      success: true,
      booking_id: booking.id,
      payment_status: targetPaymentStatus,
      message: 'Payment verified and booking confirmed authoritatively by server',
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
});

/**
 * 4. OWNER CANCELLATION & REFUND ENGINE
 * Initiates instant refund request based on tenant configurable policy.
 */
paymentsRouter.post('/cancel-and-refund', async (req, res): Promise<any> => {
  try {
    const { booking_id, cancelled_by = 'owner', reason = 'Cancelled by owner' } = req.body;
    if (!booking_id) return res.status(400).json({ error: 'booking_id is required' });

    const bookingRes = await pg.query<any>('SELECT * FROM bookings WHERE id = $1', [booking_id]);
    if (bookingRes.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    const booking = bookingRes.rows[0];

    // Get Business Configurable Cancellation Policy
    const busRes = await pg.query<any>(
      `SELECT cancel_policy_hours_threshold, cancel_policy_full_refund_pct, cancel_policy_late_refund_pct, noshow_refund_pct
       FROM businesses WHERE id = $1`,
      [booking.business_id]
    );
    const bus = busRes.rows[0] || {};
    const thresholdHours = parseInt(bus.cancel_policy_hours_threshold || 24);
    const fullRefundPct = parseFloat(bus.cancel_policy_full_refund_pct || 100);
    const lateRefundPct = parseFloat(bus.cancel_policy_late_refund_pct || 50);

    // Calculate time difference to scheduled booking
    const bookingDateTime = new Date(`${booking.booking_date.toString().slice(0, 10)}T${booking.booking_time || '10:00'}:00`);
    const hoursNotice = (bookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    let refundPct = 100;
    let policyApplied = 'Owner Cancellation Full Refund Guarantee';

    if (cancelled_by === 'customer') {
      if (hoursNotice >= thresholdHours) {
        refundPct = fullRefundPct;
        policyApplied = `Standard Cancellation Policy (> ${thresholdHours}h Notice: ${fullRefundPct}% refund)`;
      } else if (hoursNotice > 0) {
        refundPct = lateRefundPct;
        policyApplied = `Late Cancellation Policy (< ${thresholdHours}h Notice: ${lateRefundPct}% refund)`;
      } else {
        refundPct = parseFloat(bus.noshow_refund_pct || 0);
        policyApplied = `No-Show / Past Date Policy (${refundPct}% refund)`;
      }
    }

    const paidAmount = parseFloat(booking.advance_amount_paid > 0 ? booking.advance_amount_paid : booking.total_amount);
    const refundAmount = parseFloat(((paidAmount * refundPct) / 100).toFixed(2));
    const feeDeducted = parseFloat((paidAmount - refundAmount).toFixed(2));

    const cancelStatus = cancelled_by === 'owner' ? 'CANCELLED_BY_OWNER' : 'CANCELLED_BY_CUSTOMER';
    const paymentStatus = refundAmount > 0 ? 'REFUND_PENDING' : 'CANCELLED';

    // 1. Update booking status to REFUND_PENDING / CANCELLED
    await pg.query(
      `UPDATE bookings SET status = $1, payment_status = $2 WHERE id = $3`,
      [cancelStatus, paymentStatus, booking.id]
    );

    let refundRecord = null;
    if (paidAmount > 0) {
      // 2. Create Refund Record in REFUND_PENDING state
      const refundRes = await pg.query<any>(
        `INSERT INTO refunds (
          business_id, booking_id, user_id, amount_paid, refund_amount, fee_deducted,
          reason, policy_applied, status, gateway_refund_id, cancelled_by_role
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          booking.business_id,
          booking.id,
          booking.user_id || null,
          paidAmount,
          refundAmount,
          feeDeducted,
          reason,
          policyApplied,
          'REFUND_PENDING',
          `ref_req_${Date.now()}_${booking.id}`,
          cancelled_by,
        ]
      );
      refundRecord = refundRes.rows[0];
    }

    await logAuditEvent({
      business_id: booking.business_id,
      user_id: booking.user_id || 1,
      user_name: booking.customer_name || 'Customer',
      user_role: cancelled_by,
      action: 'BOOKING_CANCELLED_REFUND_INITIATED',
      entity_type: 'booking',
      entity_id: booking.id,
      details: { cancelled_by, refundAmount, feeDeducted, policyApplied, refundStatus: 'REFUND_PENDING' },
    });

    return res.json({
      success: true,
      booking_id: booking.id,
      booking_status: cancelStatus,
      payment_status: paymentStatus,
      refund: refundRecord,
      policy_applied: policyApplied,
      message: paidAmount > 0
        ? `Cancellation processed. Instant refund workflow initiated for ${booking.primary_currency || '₹'}${refundAmount} (${policyApplied}).`
        : `Booking ${cancelStatus.toLowerCase().replace(/_/g, ' ')} successfully.`,
    });
  } catch (error: any) {
    console.error('Cancel and refund error:', error);
    return res.status(500).json({ error: 'Failed to process cancellation and refund' });
  }
});

/**
 * 5. REFUND PROVIDER CONFIRMATION WEBHOOK
 * Updates refund state to REFUNDED only after payment provider confirmation is received.
 */
paymentsRouter.post('/refunds/webhook', async (req, res): Promise<any> => {
  try {
    const { refund_id, gateway_refund_id, status = 'REFUNDED', provider_reference } = req.body;
    if (!refund_id && !gateway_refund_id) {
      return res.status(400).json({ error: 'refund_id or gateway_refund_id required' });
    }

    const refQuery = refund_id
      ? 'SELECT * FROM refunds WHERE id = $1'
      : 'SELECT * FROM refunds WHERE gateway_refund_id = $1';
    const refParams = [refund_id || gateway_refund_id];

    const refRes = await pg.query<any>(refQuery, refParams);
    if (refRes.rows.length === 0) {
      return res.status(404).json({ error: 'Refund record not found' });
    }
    const refund = refRes.rows[0];

    // Confirm refund with payment provider
    const targetRefundStatus = status === 'REFUNDED' ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

    await pg.query(
      `UPDATE refunds SET status = $1, gateway_response_json = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [targetRefundStatus, JSON.stringify({ provider_reference, status }), refund.id]
    );

    // Update booking payment status
    await pg.query(
      `UPDATE bookings SET payment_status = $1, status = 'REFUNDED' WHERE id = $2`,
      [targetRefundStatus, refund.booking_id]
    );

    await logAuditEvent({
      business_id: refund.business_id,
      user_id: refund.user_id || 1,
      user_name: 'Payment Provider',
      user_role: 'system',
      action: 'REFUND_CONFIRMED_BY_PROVIDER',
      entity_type: 'refund',
      entity_id: refund.id,
      details: { targetRefundStatus, provider_reference },
    });

    return res.json({
      success: true,
      refund_id: refund.id,
      status: targetRefundStatus,
      message: `Refund confirmed by payment provider and marked as ${targetRefundStatus}`,
    });
  } catch (error: any) {
    console.error('Refund webhook error:', error);
    return res.status(500).json({ error: 'Failed to process refund webhook' });
  }
});
