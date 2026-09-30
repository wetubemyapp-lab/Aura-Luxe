import { Router, Response } from 'express';
import { pg, logAuditEvent } from '../db.ts';
import { requireAuth, requireBusinessStaff, AuthenticatedRequest } from '../middleware/auth.ts';

export const bookingsRouter = Router();

// Helper to construct WhatsApp appointment notification link
export function buildWhatsAppLink(phone: string | undefined, data: {
  bookingId: number;
  customerName: string;
  businessName: string;
  branchName?: string;
  branchAddress?: string;
  branchPhone?: string;
  services: string[];
  staffName?: string;
  bookingDate: string;
  bookingTime: string;
  durationMins: number;
  totalAmount: number;
  paymentStatus: string;
  paymentOption: string;
  advancePaid: number;
  balanceDue: number;
  currency: string;
  googleMapsUrl?: string;
  bookingMode: string;
  homeAddress?: string;
}) {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  let msg = `✨ *Appointment Confirmed - ${data.businessName}* ✨\n\n`;
  msg += `Dear *${data.customerName}*,\n`;
  msg += `Your booking *#${data.bookingId}* has been successfully reserved!\n\n`;
  msg += `📋 *Services:* ${data.services.join(', ')}\n`;
  msg += `⏱ *Duration:* ${data.durationMins} mins\n`;
  msg += `📅 *Date:* ${data.bookingDate}\n`;
  msg += `⏰ *Time:* ${data.bookingTime}\n`;
  if (data.staffName) {
    msg += `✂️ *Stylist / Specialist:* ${data.staffName}\n`;
  }

  if (data.bookingMode === 'home_service') {
    msg += `🏠 *Service Type:* Home Service (At Doorstep)\n`;
    msg += `📍 *Delivery Address:* ${data.homeAddress || 'As provided'}\n`;
  } else {
    msg += `📍 *Branch:* ${data.branchName || 'Main Studio'}\n`;
    if (data.branchAddress) msg += `🏢 *Address:* ${data.branchAddress}\n`;
    if (data.googleMapsUrl) msg += `🗺 *Directions:* ${data.googleMapsUrl}\n`;
  }

  msg += `\n💳 *Payment Details:*\n`;
  msg += `• Total: ${data.currency}${data.totalAmount.toFixed(2)}\n`;
  if (data.paymentOption === 'advance_online') {
    msg += `• Advance Paid: ${data.currency}${data.advancePaid.toFixed(2)} (Paid Online)\n`;
    msg += `• Balance Due at Venue: ${data.currency}${data.balanceDue.toFixed(2)}\n`;
  } else if (data.paymentOption === 'pay_at_venue') {
    msg += `• Payment Mode: Pay at Venue (${data.currency}${data.totalAmount.toFixed(2)})\n`;
  } else {
    msg += `• Payment Mode: Full Paid Online (${data.currency}${data.totalAmount.toFixed(2)})\n`;
  }

  msg += `\nNeed to reschedule? Reply directly to this WhatsApp message or call us at ${data.branchPhone || '+91 98765 43210'}.\n`;
  msg += `We look forward to giving you an exceptional experience! ✨`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
}

// Dynamic Time Slots Generator Endpoint (Section 14 & 16 Buffer Time Engine)
bookingsRouter.get('/slots', async (req, res): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : null;
    const staffId = req.query.staffId ? parseInt(req.query.staffId as string) : null;
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const requestedDuration = req.query.duration ? parseInt(req.query.duration as string) : 45;

    // Fetch Business Configuration for Operating Hours & Buffer Rules
    const busRes = await pg.query<any>('SELECT slot_interval_mins, buffer_time_mins FROM businesses WHERE id = $1', [businessId]);
    const slotInterval = busRes.rows[0]?.slot_interval_mins || 30;
    const bufferTime = busRes.rows[0]?.buffer_time_mins || 15;

    // Standard business operating hours: 09:00 AM to 08:30 PM (12 hours)
    const baseSlots: string[] = [];
    const startHour = 9;
    const endHour = 20;

    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += slotInterval) {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
        const strH = displayH < 10 ? `0${displayH}` : `${displayH}`;
        const strM = m < 10 ? `0${m}` : `${m}`;
        baseSlots.push(`${strH}:${strM} ${period}`);
      }
    }

    // Query active holds and confirmed bookings for this date to purge occupied slots
    // We need to check if a potential slot overlaps with any existing booking's time window
    const occupiedRes = await pg.query<any>(
      `SELECT start_at, end_at FROM bookings
       WHERE business_id = $1 AND booking_date = $2::date
         AND status NOT IN ('cancelled', 'refunded') AND is_archived = FALSE
         AND ($3::int IS NULL OR staff_id = $3)
       UNION
       SELECT booking_date + start_time::time as start_at, booking_date + (start_time::time + (duration_mins || ' minutes')::interval) as end_at FROM booking_holds
       WHERE business_id = $1 AND booking_date = $2::date AND expires_at > CURRENT_TIMESTAMP AND status = 'ACTIVE'
         AND ($3::int IS NULL OR staff_id = $3)`,
      [businessId, date, staffId]
    );

    const parseSlot = (dateStr: string, timeStr: string) => {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      const d = new Date(dateStr);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    const availableSlots = baseSlots.map((slotTime) => {
      const slotStart = parseSlot(date, slotTime);
      const slotEnd = new Date(slotStart.getTime() + (requestedDuration + bufferTime) * 60000);
      
      const isOccupied = occupiedRes.rows.some((occ: any) => {
        const occStart = new Date(occ.start_at);
        const occEnd = new Date(occ.end_at);
        // Overlap logic: (StartA < EndB) and (EndA > StartB)
        return (slotStart < occEnd) && (slotEnd > occStart);
      });

      return {
        time: slotTime,
        available: !isOccupied,
        buffer_mins: bufferTime,
      };
    });

    return res.json({
      date,
      slot_interval_mins: slotInterval,
      buffer_time_mins: bufferTime,
      total_duration_required: requestedDuration + bufferTime,
      slots: availableSlots,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate dynamic time slots' });
  }
});

// Section 15: Temporary Slot Lock Endpoint (5-Minute Hold)
bookingsRouter.post('/hold', async (req, res): Promise<any> => {
  try {
    const {
      business_id = 1,
      outlet_id = 1,
      staff_id,
      booking_date,
      start_time,
      duration_mins = 45,
      session_id,
    } = req.body;

    if (!booking_date || !start_time || !session_id) {
      return res.status(400).json({ error: 'Date, start time, and session_id are required' });
    }

    // Check for confirmed booking conflict
    const bookingConflict = await pg.query<any>(
      `SELECT id FROM bookings
       WHERE business_id = $1 AND booking_date = $2::date AND booking_time = $3
         AND status NOT IN ('cancelled', 'refunded') AND is_archived = FALSE
         AND ($4::int IS NULL OR staff_id = $4)`,
      [business_id, booking_date, start_time, staff_id || null]
    );

    if (bookingConflict.rows.length > 0) {
      return res.status(409).json({
        error: 'This time slot is already confirmed by another client. Please select a different time.',
      });
    }

    // Check for active hold from ANOTHER session
    const holdConflict = await pg.query<any>(
      `SELECT id, session_id FROM booking_holds
       WHERE business_id = $1 AND booking_date = $2::date AND start_time = $3
         AND status = 'ACTIVE' AND expires_at > CURRENT_TIMESTAMP
         AND session_id != $4
         AND ($5::int IS NULL OR staff_id = $5)`,
      [business_id, booking_date, start_time, session_id, staff_id || null]
    );

    if (holdConflict.rows.length > 0) {
      return res.status(409).json({
        error: 'This time slot is temporarily locked by another client. Please try another slot.',
      });
    }

    // Expire any existing holds for this session
    await pg.query(
      `UPDATE booking_holds SET status = 'EXPIRED' WHERE session_id = $1 AND status = 'ACTIVE'`,
      [session_id]
    );

    // Create a 5-minute active hold
    const holdRes = await pg.query<any>(
      `INSERT INTO booking_holds (
        business_id, outlet_id, staff_id, booking_date, start_time, duration_mins,
        session_id, expires_at, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP + INTERVAL '5 minutes', 'ACTIVE'
      ) RETURNING id, expires_at, status`,
      [business_id, outlet_id, staff_id || null, booking_date, start_time, duration_mins, session_id]
    );

    const hold: any = holdRes.rows[0];
    return res.json({
      message: 'Time slot temporarily locked for 5 minutes',
      booking_hold_id: hold.id,
      expires_at: hold.expires_at,
      status: hold.status,
      ttl_seconds: 300,
    });
  } catch (err: any) {
    console.error('Create slot hold error:', err);
    return res.status(500).json({ error: 'Failed to place temporary slot hold' });
  }
});
bookingsRouter.get('/my', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;
    const result = await pg.query(
      `SELECT b.*, s.title as service_title, s.price as service_price, s.image_url as service_image,
              st.name as staff_name, br.name as branch_name, br.address as branch_address, br.google_maps_url,
              bus.name as business_name, bus.primary_currency, bus.phone as business_phone
       FROM bookings b
       LEFT JOIN services s ON b.service_id = s.id
       LEFT JOIN staff st ON b.staff_id = st.id
       LEFT JOIN branches br ON b.branch_id = br.id
       LEFT JOIN businesses bus ON b.business_id = bus.id
       WHERE b.user_id = $1 AND b.is_archived = FALSE
       ORDER BY b.booking_date DESC, b.booking_time DESC`,
      [userId]
    );

    // Attach items for each booking
    const bookings = await Promise.all(
      result.rows.map(async (booking: any) => {
        const items = await pg.query(
          'SELECT * FROM booking_items WHERE booking_id = $1',
          [booking.id]
        );
        const serviceTitles = items.rows.length > 0
          ? items.rows.map((i: any) => i.service_title)
          : [booking.service_title || 'General Service'];

        const whatsappLink = buildWhatsAppLink(booking.customer_phone || req.user?.email, {
          bookingId: booking.id,
          customerName: booking.customer_name || req.user?.name || 'Valued Guest',
          businessName: booking.business_name || 'Aura Luxe',
          branchName: booking.branch_name,
          branchAddress: booking.branch_address,
          branchPhone: booking.business_phone,
          services: serviceTitles,
          staffName: booking.staff_name,
          bookingDate: booking.booking_date?.toString().slice(0, 10),
          bookingTime: booking.booking_time,
          durationMins: booking.duration_mins,
          totalAmount: parseFloat(booking.total_amount),
          paymentStatus: booking.payment_status,
          paymentOption: booking.payment_option || 'full_online',
          advancePaid: parseFloat(booking.advance_amount_paid || '0'),
          balanceDue: parseFloat(booking.venue_balance_due || '0'),
          currency: booking.primary_currency || '₹',
          googleMapsUrl: booking.google_maps_url,
          bookingMode: booking.booking_mode || 'online',
          homeAddress: booking.home_service_address,
        });

        return {
          ...booking,
          items: items.rows,
          service_titles: serviceTitles,
          whatsapp_url: whatsappLink,
        };
      })
    );

    return res.json({ bookings });
  } catch (error: any) {
    console.error('Fetch my bookings error:', error);
    return res.status(500).json({ error: 'Failed to retrieve bookings' });
  }
});

// Universal Booking Creation with Real Transactional Locking, Multi-Service, Multi-Mode & Flexible Payment
bookingsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const client = pg;
  try {
    const userId = req.user!.id;
    const {
      business_id,
      branch_id,
      service_id,
      service_ids = [],
      staff_id,
      booking_mode = 'online', // 'online' | 'home_service' | 'walk_in'
      home_service_address,
      booking_date,
      booking_time,
      payment_option = 'full_online', // 'full_online' | 'advance_online' | 'pay_at_venue'
      addons = [],
      coupon_code,
      notes,
      customer_name,
      customer_phone,
      customer_email,
    } = req.body;

    const allServiceIds: number[] = Array.from(
      new Set(
        [
          service_id ? parseInt(service_id) : null,
          ...(Array.isArray(service_ids) ? service_ids.map((id: any) => parseInt(id)) : []),
        ].filter(Boolean) as number[]
      )
    );

    if (allServiceIds.length === 0 || !booking_date || !booking_time) {
      return res.status(400).json({ error: 'At least one service, a valid date, and a time slot are required.' });
    }

    if (booking_mode === 'home_service' && !home_service_address) {
      return res.status(400).json({ error: 'Home address is required for Home Service appointments.' });
    }

    // 1. Transaction Start for real atomic locking
    await client.query('BEGIN');

    // 2. Fetch Services and calculate aggregate duration
    const servicesRes = await client.query<any>(
      `SELECT id, business_id, title, price, duration_mins, buffer_mins FROM services WHERE id = ANY($1::int[])`,
      [allServiceIds]
    );

    if (servicesRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Selected services could not be found.' });
    }

    const bId = business_id || servicesRes.rows[0].business_id || 1;

    // Fetch Business Settings & Platform Commission
    const busRes = await client.query<any>(
      `SELECT id, name, tax_rate, deposit_required, deposit_percentage, advance_payment_percentage,
              allow_home_service, home_service_travel_fee, platform_commission_pct, primary_currency
       FROM businesses WHERE id = $1`,
      [bId]
    );
    const business = busRes.rows[0];
    const taxRate = parseFloat(business?.tax_rate || '5.00') / 100;
    const platformCommissionPct = parseFloat(business?.platform_commission_pct || '5.00') / 100;
    const advancePct = parseFloat(business?.advance_payment_percentage || '20.00') / 100;

    let totalDurationMins = 0;
    let baseServicesAmount = 0;
    for (const srv of servicesRes.rows) {
      totalDurationMins += parseInt(srv.duration_mins || 30);
      baseServicesAmount += parseFloat(srv.price || 0);
    }
    // Add buffer time
    const bufferMins = parseInt(servicesRes.rows[0]?.buffer_mins || 10);
    const totalSlotDuration = totalDurationMins + bufferMins;

    // 3. Real Transactional Conflict Detection & Auto Staff Assignment
    let assignedStaffId = staff_id ? parseInt(staff_id) : null;

    // Helper to calculate start and end timestamps
    const parseTime = (dateStr: string, timeStr: string) => {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      const d = new Date(dateStr);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    const startAt = parseTime(booking_date, booking_time);
    const endAt = new Date(startAt.getTime() + totalSlotDuration * 60000);

    if (!assignedStaffId) {
      // Auto-assign qualified staff member based on outlet, active status, and REAL slot availability (no overlaps)
      const autoStaffQuery = `
        SELECT s.id FROM staff s
        WHERE s.business_id = $1
          AND s.is_active = TRUE
          AND s.is_archived = FALSE
          AND ($2::int IS NULL OR s.branch_id = $2 OR s.branch_id IS NULL)
          AND s.id NOT IN (
            SELECT b.staff_id FROM bookings b
            WHERE b.business_id = $1
              AND b.status NOT IN ('cancelled', 'refunded')
              AND b.is_archived = FALSE
              AND b.staff_id IS NOT NULL
              AND (
                (b.start_at, b.end_at) OVERLAPS ($3, $4)
              )
          )
        ORDER BY RANDOM()
        LIMIT 1
      `;
      const autoStaffRes = await client.query<any>(autoStaffQuery, [
        bId,
        branch_id ? parseInt(branch_id) : null,
        startAt.toISOString(),
        endAt.toISOString(),
      ]);

      if (autoStaffRes.rows.length > 0) {
        assignedStaffId = autoStaffRes.rows[0].id;
      } else {
        // Fallback: assign first available active staff member (might still conflict, but handled by overlap check below if they are busy)
        const fallbackStaffRes = await client.query<any>(
          `SELECT id FROM staff WHERE business_id = $1 AND is_active = TRUE AND is_archived = FALSE ORDER BY id ASC LIMIT 1`,
          [bId]
        );
        if (fallbackStaffRes.rows.length > 0) {
          assignedStaffId = fallbackStaffRes.rows[0].id;
        }
      }
    }

    // Final Overlap Validation for the specific staff member (Atomic Locking)
    if (assignedStaffId) {
      const overlapQuery = `
        SELECT id FROM bookings
        WHERE staff_id = $1
          AND status NOT IN ('cancelled', 'refunded')
          AND is_archived = FALSE
          AND (
            (start_at, end_at) OVERLAPS ($2, $3)
          )
        FOR UPDATE
      `;
      const conflictRes = await client.query<any>(overlapQuery, [assignedStaffId, startAt.toISOString(), endAt.toISOString()]);

      if (conflictRes.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          error: 'The requested specialist is already reserved for this slot. Please select another time or specialist.',
        });
      }
    }

    // 4. Financial Calculation
    const addonsAmount = addons.reduce((sum: number, item: any) => sum + parseFloat(item.price || 0), 0);
    const travelFee = (booking_mode === 'home_service') ? parseFloat(business?.home_service_travel_fee || '150.00') : 0;
    const subtotal = baseServicesAmount + addonsAmount + travelFee;

    // Coupon discount logic
    let discountAmount = 0;
    let validatedCouponCode: string | null = null;
    if (coupon_code) {
      const couponRes = await client.query<any>(
        'SELECT * FROM coupons WHERE business_id = $1 AND UPPER(code) = UPPER($2) AND is_active = TRUE AND is_archived = FALSE',
        [bId, coupon_code.trim()]
      );
      if (couponRes.rows.length > 0) {
        const coupon = couponRes.rows[0];
        const todayStr = new Date().toISOString().split('T')[0];
        const validFromOk = !coupon.valid_from || coupon.valid_from.toString().slice(0, 10) <= todayStr;
        const validUntilOk = !coupon.valid_until || coupon.valid_until.toString().slice(0, 10) >= todayStr;
        const limitOk = !coupon.usage_limit || (coupon.used_count || 0) < coupon.usage_limit;

        if (validFromOk && validUntilOk && limitOk && subtotal >= parseFloat(coupon.min_spend || '0')) {
          validatedCouponCode = coupon.code;
          if (coupon.discount_type === 'flat' || coupon.discount_type === 'fixed') {
            discountAmount = Math.min(parseFloat(coupon.discount_value), subtotal);
          } else {
            discountAmount = parseFloat(((subtotal * parseFloat(coupon.discount_value)) / 100).toFixed(2));
          }
          if (coupon.max_discount_amount && parseFloat(coupon.max_discount_amount) > 0) {
            discountAmount = Math.min(discountAmount, parseFloat(coupon.max_discount_amount));
          }

          // Increment usage count
          await client.query('UPDATE coupons SET used_count = COALESCE(used_count, 0) + 1 WHERE id = $1', [coupon.id]);
        }
      }
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = parseFloat((taxableAmount * taxRate).toFixed(2));
    const totalAmount = parseFloat((taxableAmount + taxAmount).toFixed(2));

    // Calculate advance payment vs venue balance
    let advanceAmountPaid = 0;
    let venueBalanceDue = totalAmount;
    let paymentStatus = 'unpaid';

    if (payment_option === 'full_online') {
      advanceAmountPaid = totalAmount;
      venueBalanceDue = 0;
      paymentStatus = 'payment_pending';
    } else if (payment_option === 'advance_online') {
      advanceAmountPaid = parseFloat((totalAmount * advancePct).toFixed(2));
      venueBalanceDue = parseFloat((totalAmount - advanceAmountPaid).toFixed(2));
      paymentStatus = 'payment_pending';
    } else {
      // pay_at_venue
      advanceAmountPaid = 0;
      venueBalanceDue = totalAmount;
      paymentStatus = 'unpaid';
    }

    // 5. Insert Booking Record
    const primaryServiceId = allServiceIds[0];
    let initialStatus = (booking_mode === 'walk_in') ? 'in_service' : 'confirmed';
    if (payment_option !== 'pay_at_venue' && booking_mode !== 'walk_in') {
      initialStatus = 'pending_payment';
    }

    const insertBookingQuery = `
      INSERT INTO bookings (
        business_id, branch_id, user_id, service_id, staff_id,
        booking_mode, home_service_address, travel_fee,
        booking_date, booking_time, start_at, end_at, duration_mins,
        status, payment_status, payment_option,
        service_amount, addons_amount, discount_amount, tax_amount,
        advance_amount_paid, venue_balance_due, total_amount,
        addons_json, coupon_code, notes,
        customer_name, customer_phone, customer_email
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
      ) RETURNING *
    `;

    const bookingRes = await client.query<any>(insertBookingQuery, [
      bId,
      branch_id || 1,
      userId,
      primaryServiceId,
      assignedStaffId,
      booking_mode,
      home_service_address || null,
      travelFee,
      booking_date,
      booking_time,
      startAt.toISOString(),
      endAt.toISOString(),
      totalDurationMins,
      initialStatus,
      paymentStatus,
      payment_option,
      baseServicesAmount,
      addonsAmount,
      discountAmount,
      taxAmount,
      advanceAmountPaid,
      venueBalanceDue,
      totalAmount,
      JSON.stringify(addons),
      validatedCouponCode,
      notes || null,
      customer_name || req.user?.name,
      customer_phone || null,
      customer_email || req.user?.email,
    ]);

    const booking = bookingRes.rows[0];

    // Convert active slot hold for this slot to CONVERTED
    await client.query(
      `UPDATE booking_holds SET status = 'CONVERTED'
       WHERE business_id = $1 AND booking_date = $2 AND start_time = $3 AND status = 'ACTIVE'`,
      [bId, booking_date, booking_time]
    );

    // 6. Insert Multiple Booking Items
    for (const srv of servicesRes.rows) {
      await client.query(
        `INSERT INTO booking_items (booking_id, service_id, service_title, price, duration_mins)
         VALUES ($1, $2, $3, $4, $5)`,
        [booking.id, srv.id, srv.title, srv.price, srv.duration_mins]
      );
    }

    // 7. Ledger & Platform Commission Integration (Only if fully collected now)
    const isCollectedNow = booking_mode === 'walk_in';
    const collectedAmount = (payment_option === 'full_online') ? totalAmount : advanceAmountPaid;
    
    if (isCollectedNow && collectedAmount > 0) {
      const platformFee = parseFloat((collectedAmount * platformCommissionPct).toFixed(2));
      const netMerchant = parseFloat((collectedAmount - platformFee).toFixed(2));

      await client.query(
        `INSERT INTO ledger_entries (
          business_id, booking_id, entry_type, payment_method, amount,
          platform_fee_amount, merchant_net_amount, status, reference_no, notes
        ) VALUES ($1, $2, $3, 'online', $4, $5, $6, 'completed', $7, $8)`,
        [
          bId,
          booking.id,
          (payment_option === 'full_online') ? 'payment' : 'deposit',
          collectedAmount,
          platformFee,
          netMerchant,
          `TXN-${Date.now().toString().slice(-8)}`,
          `${payment_option === 'full_online' ? 'Full' : 'Advance'} online collection for Booking #${booking.id}`
        ]
      );
    }

    // 8. Commit the Atomic Transaction
    await client.query('COMMIT');

    // 9. Fetch branch details for WhatsApp notification
    const branchRes = await pg.query<any>('SELECT name, address, phone, google_maps_url FROM branches WHERE id = $1', [branch_id || 1]);
    const branch = branchRes.rows[0];

    const staffRes = staff_id ? await pg.query<any>('SELECT name FROM staff WHERE id = $1', [staff_id]) : { rows: [] as any[] };
    const staffName = staffRes.rows[0]?.name;

    const serviceTitles = servicesRes.rows.map((s: any) => s.title);

    const whatsappLink = buildWhatsAppLink(customer_phone || req.user?.email, {
      bookingId: booking.id,
      customerName: customer_name || req.user?.name || 'Valued Guest',
      businessName: business?.name || 'Aura Luxe',
      branchName: branch?.name,
      branchAddress: branch?.address,
      branchPhone: branch?.phone,
      services: serviceTitles,
      staffName,
      bookingDate: booking_date,
      bookingTime: booking_time,
      durationMins: totalDurationMins,
      totalAmount,
      paymentStatus,
      paymentOption: payment_option,
      advancePaid: advanceAmountPaid,
      balanceDue: venueBalanceDue,
      currency: business?.primary_currency || '₹',
      googleMapsUrl: branch?.google_maps_url,
      bookingMode: booking_mode,
      homeAddress: home_service_address,
    });

    // 10. Audit Logging
    await logAuditEvent({
      business_id: bId,
      user_id: userId,
      user_name: customer_name || req.user?.name,
      user_role: req.user?.role,
      action: 'BOOKING_CREATED',
      entity_type: 'booking',
      entity_id: booking.id,
      details: {
        services: serviceTitles,
        totalAmount,
        booking_mode,
        payment_option,
        branch_id,
      },
    });

    return res.status(201).json({
      booking: {
        ...booking,
        service_titles: serviceTitles,
        whatsapp_url: whatsappLink,
      },
      message: 'Booking successfully confirmed!',
      whatsapp_url: whatsappLink,
    });
  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Create booking transaction error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process booking transaction' });
  }
});

// Admin / Receptionist: Walk-In Quick Booking
bookingsRouter.post('/walk-in', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      business_id = 1,
      branch_id = 1,
      customer_name,
      customer_phone,
      service_ids = [],
      staff_id,
      payment_method = 'cash',
      paid_amount,
      notes,
    } = req.body;

    if (!customer_name || service_ids.length === 0) {
      return res.status(400).json({ error: 'Customer name and at least one service are required for Walk-Ins.' });
    }

    const servicesRes = await pg.query<any>(
      `SELECT id, title, price, duration_mins FROM services WHERE id = ANY($1::int[])`,
      [service_ids]
    );

    let totalDuration = 0;
    let totalAmount = 0;
    for (const srv of servicesRes.rows) {
      totalDuration += parseInt(srv.duration_mins || 30);
      totalAmount += parseFloat(srv.price || 0);
    }

    const todayDate = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    const insertRes = await pg.query<any>(
      `INSERT INTO bookings (
        business_id, branch_id, user_id, service_id, staff_id,
        booking_mode, booking_date, booking_time, duration_mins,
        status, payment_status, payment_option,
        service_amount, total_amount, advance_amount_paid, venue_balance_due,
        customer_name, customer_phone, notes
      ) VALUES ($1, $2, $3, $4, $5, 'walk_in', $6, $7, $8, 'in_service', 'paid', 'pay_at_venue', $9, $10, $11, 0, $12, $13, $14)
      RETURNING *`,
      [
        business_id,
        branch_id,
        req.user!.id,
        service_ids[0],
        staff_id || null,
        todayDate,
        nowTime,
        totalDuration,
        totalAmount,
        totalAmount,
        paid_amount || totalAmount,
        customer_name,
        customer_phone || null,
        notes || 'Walk-in client registered by desk',
      ]
    );

    const booking = insertRes.rows[0];

    // Insert items
    for (const srv of servicesRes.rows) {
      await pg.query(
        `INSERT INTO booking_items (booking_id, service_id, service_title, price, duration_mins)
         VALUES ($1, $2, $3, $4, $5)`,
        [booking.id, srv.id, srv.title, srv.price, srv.duration_mins]
      );
    }

    // Record ledger entry
    await pg.query(
      `INSERT INTO ledger_entries (
        business_id, booking_id, entry_type, payment_method, amount, merchant_net_amount, status, reference_no, notes
      ) VALUES ($1, $2, 'payment', $3, $4, $4, 'completed', $5, 'Walk-in direct receipt')`,
      [business_id, booking.id, payment_method, totalAmount, `WLK-${Date.now().toString().slice(-6)}`]
    );

    await logAuditEvent({
      business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'WALK_IN_CREATED',
      entity_type: 'booking',
      entity_id: booking.id,
      details: { customer_name, totalAmount, payment_method },
    });

    return res.status(201).json({ booking, message: 'Walk-in booking created and queued in-service' });
  } catch (error: any) {
    console.error('Walk-in booking error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create walk-in booking' });
  }
});

// Admin/Staff: Get all bookings (with search, branch, status & archived filter)
bookingsRouter.get('/all', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const businessId = req.query.businessId ? parseInt(req.query.businessId as string) : 1;
    const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : null;
    const status = req.query.status as string;
    const includeArchived = req.query.archived === 'true';

    let query = `
      SELECT b.*,
             u.name as registered_user_name, u.email as registered_user_email,
             s.title as service_title, st.name as staff_name,
             br.name as branch_name, bus.name as business_name, bus.primary_currency, bus.phone as business_phone
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN staff st ON b.staff_id = st.id
      LEFT JOIN branches br ON b.branch_id = br.id
      LEFT JOIN businesses bus ON b.business_id = bus.id
      WHERE b.business_id = $1
    `;
    const params: any[] = [businessId];

    if (!includeArchived) {
      query += ` AND b.is_archived = FALSE`;
    } else {
      query += ` AND b.is_archived = TRUE`;
    }

    if (branchId) {
      params.push(branchId);
      query += ` AND b.branch_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND b.status = $${params.length}`;
    }

    query += ' ORDER BY b.booking_date DESC, b.booking_time DESC';

    const result = await pg.query(query, params);

    // Attach items & WhatsApp link for each
    const bookings = await Promise.all(
      result.rows.map(async (b: any) => {
        const items = await pg.query('SELECT * FROM booking_items WHERE booking_id = $1', [b.id]);
        const serviceTitles = items.rows.length > 0 ? items.rows.map((i: any) => i.service_title) : [b.service_title || 'Service'];

        const whatsappLink = buildWhatsAppLink(b.customer_phone || b.registered_user_email, {
          bookingId: b.id,
          customerName: b.customer_name || b.registered_user_name || 'Guest',
          businessName: b.business_name || 'Aura Luxe',
          branchName: b.branch_name,
          branchAddress: b.branch_address,
          branchPhone: b.business_phone,
          services: serviceTitles,
          staffName: b.staff_name,
          bookingDate: b.booking_date?.toString().slice(0, 10),
          bookingTime: b.booking_time,
          durationMins: b.duration_mins,
          totalAmount: parseFloat(b.total_amount),
          paymentStatus: b.payment_status,
          paymentOption: b.payment_option || 'full_online',
          advancePaid: parseFloat(b.advance_amount_paid || '0'),
          balanceDue: parseFloat(b.venue_balance_due || '0'),
          currency: b.primary_currency || '₹',
          googleMapsUrl: b.google_maps_url,
          bookingMode: b.booking_mode || 'online',
          homeAddress: b.home_service_address,
        });

        return {
          ...b,
          items: items.rows,
          service_titles: serviceTitles,
          whatsapp_url: whatsappLink,
        };
      })
    );

    return res.json({ bookings });
  } catch (error: any) {
    console.error('Fetch all bookings error:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Admin/Staff: Update booking status workflow (pending -> confirmed -> in_service -> completed -> cancelled -> no_show)
bookingsRouter.put('/:id/status', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in_service', 'completed', 'cancelled', 'no_show'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid booking status' });
    }

    const result = await pg.query<any>(
      `UPDATE bookings
       SET status = COALESCE($1, status),
           payment_status = COALESCE($2, payment_status)
       WHERE id = $3
       RETURNING *`,
      [status || null, payment_status || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const updated = result.rows[0];

    await logAuditEvent({
      business_id: (updated as any).business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'BOOKING_STATUS_UPDATED',
      entity_type: 'booking',
      entity_id: parseInt(id),
      details: { new_status: status, payment_status },
    });

    return res.json({ booking: updated, message: `Booking marked as ${status}` });
  } catch (error: any) {
    console.error('Update booking status error:', error);
    return res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Uncomplete / Revert Completion Endpoint
bookingsRouter.post('/:id/uncomplete', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query<any>(
      `UPDATE bookings SET status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    const updated = result.rows[0];

    await logAuditEvent({
      business_id: updated.business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'BOOKING_UNCOMPLETED',
      entity_type: 'booking',
      entity_id: parseInt(id),
    });

    return res.json({ booking: updated, message: 'Booking reverted from completed to confirmed (Uncompleted).' });
  } catch (error: any) {
    console.error('Uncomplete booking error:', error);
    return res.status(500).json({ error: 'Failed to uncomplete booking' });
  }
});

// Archive / Soft Delete a booking
bookingsRouter.patch('/:id/archive', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await pg.query<any>(
      `UPDATE bookings SET is_archived = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });

    await logAuditEvent({
      business_id: (result.rows[0] as any).business_id,
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role,
      action: 'BOOKING_ARCHIVED',
      entity_type: 'booking',
      entity_id: parseInt(id),
    });

    return res.json({ message: 'Booking archived successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to archive booking' });
  }
});

// Rescheduling Engine (Section 28)
bookingsRouter.post('/:id/reschedule', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { new_date, new_time, staff_id, force_confirm = false } = req.body;

    if (!new_date || !new_time) {
      return res.status(400).json({ error: 'new_date and new_time are required for rescheduling' });
    }

    const bookingRes = await pg.query<any>('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const booking = bookingRes.rows[0];

    // Check cancellation/reschedule policy (e.g. within 2 hours of booking)
    const scheduledDateTime = new Date(`${booking.booking_date.toString().slice(0, 10)}T${booking.booking_time || '10:00'}:00`);
    const hoursNotice = (scheduledDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursNotice < 1 && booking.status === 'CONFIRMED' && !force_confirm && req.user?.role === 'customer') {
      return res.status(400).json({
        error: 'Rescheduling is restricted within 1 hour of appointment time. Please contact venue staff directly.',
        restricted: true,
      });
    }

    const targetStaffId = staff_id || booking.staff_id;

    // Re-check staff scheduling conflict
    if (targetStaffId) {
      const conflictRes = await pg.query<any>(
        `SELECT id FROM bookings
         WHERE staff_id = $1 AND booking_date = $2 AND booking_time = $3 AND id != $4 AND status NOT IN ('CANCELLED', 'CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_OWNER', 'REFUNDED')`,
        [targetStaffId, new_date, new_time, booking.id]
      );
      if (conflictRes.rows.length > 0 && !force_confirm) {
        return res.status(400).json({
          error: `Selected staff specialist is already booked at ${new_time} on ${new_date}. Please choose another time slot.`,
          conflict: true,
        });
      }
    }

    // Price difference calculation (e.g. weekend premium or peak hours)
    let priceDifference = 0;
    const isWeekend = new Date(new_date).getDay() === 0 || new Date(new_date).getDay() === 6;
    const oldTotal = parseFloat(booking.total_amount || 0);
    let newTotal = oldTotal;

    if (isWeekend && booking.booking_mode === 'online') {
      // 5% weekend surcharge preview
      newTotal = parseFloat((oldTotal * 1.05).toFixed(2));
      priceDifference = parseFloat((newTotal - oldTotal).toFixed(2));
    }

    // Update booking
    const updatedRes = await pg.query<any>(
      `UPDATE bookings
       SET booking_date = $1,
           booking_time = $2,
           staff_id = COALESCE($3, staff_id),
           total_amount = $4,
           venue_balance_due = $5,
           status = 'CONFIRMED',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        new_date,
        new_time,
        targetStaffId || null,
        newTotal,
        Math.max(0, newTotal - parseFloat(booking.advance_amount_paid || 0)),
        booking.id,
      ]
    );

    const updatedBooking = updatedRes.rows[0];

    await logAuditEvent({
      business_id: booking.business_id,
      user_id: req.user?.id || 1,
      user_name: req.user?.name || 'Customer/Staff',
      user_role: req.user?.role || 'customer',
      action: 'BOOKING_RESCHEDULED',
      entity_type: 'booking',
      entity_id: booking.id,
      details: { old_date: booking.booking_date, new_date, old_time: booking.booking_time, new_time, priceDifference },
    });

    return res.json({
      success: true,
      message: `Appointment successfully rescheduled to ${new_date} @ ${new_time}!`,
      booking: updatedBooking,
      price_difference: priceDifference,
    });
  } catch (error: any) {
    console.error('Reschedule error:', error);
    return res.status(500).json({ error: 'Failed to reschedule booking' });
  }
});

// QR Code Scan & Check-In Validation Engine (Section 26)
bookingsRouter.post('/qr-checkin', requireBusinessStaff, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { booking_id, qr_data } = req.body;
    const targetId = booking_id || (qr_data ? parseInt(qr_data.replace(/\D/g, '')) : null);

    if (!targetId) {
      return res.status(400).json({ error: 'Valid booking ID or scanned QR payload required' });
    }

    const bookingRes = await pg.query<any>('SELECT * FROM bookings WHERE id = $1', [targetId]);
    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ error: `No active reservation found matching QR Code #${targetId}` });
    }
    const booking = bookingRes.rows[0];

    // Check if already checked in to prevent reusing QR Code
    if (booking.checked_in_at || booking.status === 'CHECKED_IN' || booking.status === 'IN_SERVICE' || booking.status === 'COMPLETED') {
      return res.status(400).json({
        error: `QR Code Already Used! Booking #${booking.id} was checked-in on ${booking.checked_in_at ? new Date(booking.checked_in_at).toLocaleTimeString() : 'earlier'} by ${booking.checked_in_by || 'Staff'}.`,
        already_checked_in: true,
        booking,
      });
    }

    // Verify status valid for check-in
    if (booking.status === 'CANCELLED' || booking.status === 'CANCELLED_BY_CUSTOMER' || booking.status === 'CANCELLED_BY_OWNER' || booking.status === 'REFUNDED') {
      return res.status(400).json({ error: `Cannot check-in. Booking #${booking.id} has been cancelled.` });
    }

    // Perform Check-In
    const staffName = req.user?.name || 'Reception Staff';
    const updatedRes = await pg.query<any>(
      `UPDATE bookings
       SET status = 'CHECKED_IN',
           checked_in_at = CURRENT_TIMESTAMP,
           checked_in_by = $1
       WHERE id = $2
       RETURNING *`,
      [staffName, booking.id]
    );
    const updatedBooking = updatedRes.rows[0];

    await logAuditEvent({
      business_id: booking.business_id,
      user_id: req.user!.id,
      user_name: staffName,
      user_role: req.user!.role,
      action: 'QR_CHECKIN_PERFORMED',
      entity_type: 'booking',
      entity_id: booking.id,
      details: { checked_in_at: new Date().toISOString(), checked_in_by: staffName },
    });

    return res.json({
      success: true,
      message: `✅ Customer ${booking.customer_name || 'Guest'} checked-in successfully for Booking #${booking.id}!`,
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error('QR Checkin error:', error);
    return res.status(500).json({ error: 'Failed to process QR check-in' });
  }
});
