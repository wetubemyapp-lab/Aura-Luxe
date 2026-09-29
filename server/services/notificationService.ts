import { pg } from '../db.ts';

// Abstract Notification Provider Interface
export interface NotificationProvider {
  name: string;
  channel: 'email' | 'whatsapp' | 'sms' | 'in_app';
  send(params: {
    recipient: string;
    title?: string;
    message: string;
    templateName?: string;
    templateParams?: any;
  }): Promise<{ success: boolean; providerId?: string; error?: string }>;
}

// Pluggable Providers list
const activeProviders: Record<string, NotificationProvider> = {};

// 1. WhatsApp Provider (supporting Official WhatsApp Business API / Meta Cloud architecture)
export class OfficialWhatsAppBusinessProvider implements NotificationProvider {
  name = 'Meta WhatsApp Cloud API';
  channel = 'whatsapp' as const;

  async send(params: {
    recipient: string;
    message: string;
    templateName?: string;
    templateParams?: any;
  }) {
    // Official WhatsApp Business API requires template validation by Meta policies.
    // Here we simulate the HTTPS call to graph.facebook.com/v20.0/phone_number_id/messages
    console.log(`[WhatsApp Business API] Sending template ${params.templateName || 'generic'} to ${params.recipient}`);
    
    // Simulating API latency and success
    const isMockSuccess = true;
    if (isMockSuccess) {
      return {
        success: true,
        providerId: `wamid.HBgLOTE5ODc2NTQzMjEwFQIAERg2OUE3OUJFNkRFMUE3QTQ0M0EAC`,
      };
    }
    return { success: false, error: 'Meta Business API connection timeout' };
  }
}

// 2. Email Provider (SMTP / SendGrid / Amazon SES plugin)
export class SendGridEmailProvider implements NotificationProvider {
  name = 'SendGrid Mail Service';
  channel = 'email' as const;

  async send(params: {
    recipient: string;
    title?: string;
    message: string;
  }) {
    console.log(`[SendGrid Email] Sending to ${params.recipient} - Subject: ${params.title}`);
    return {
      success: true,
      providerId: `sg-msg-${Math.floor(Math.random() * 10000000)}`,
    };
  }
}

// 3. SMS Provider (Twilio / Plivo / Gupshup plugin)
export class GupshupSMSProvider implements NotificationProvider {
  name = 'Gupshup SMS Gateway';
  channel = 'sms' as const;

  async send(params: {
    recipient: string;
    message: string;
  }) {
    console.log(`[Gupshup SMS] Sending to ${params.recipient}: ${params.message}`);
    return {
      success: true,
      providerId: `sms-gup-${Math.floor(Math.random() * 10000000)}`,
    };
  }
}

// 4. In-App Notification Provider
export class InAppNotificationProvider implements NotificationProvider {
  name = 'Universal In-App Provider';
  channel = 'in_app' as const;

  async send(params: {
    recipient: string; // user ID
    title?: string;
    message: string;
  }) {
    console.log(`[In-App Notification] Push sent to User ${params.recipient}`);
    return {
      success: true,
      providerId: `inapp-${Math.floor(Math.random() * 10000000)}`,
    };
  }
}

// Register default providers
activeProviders['whatsapp'] = new OfficialWhatsAppBusinessProvider();
activeProviders['email'] = new SendGridEmailProvider();
activeProviders['sms'] = new GupshupSMSProvider();
activeProviders['in_app'] = new InAppNotificationProvider();

export const notificationService = {
  // Allow owners to dynamically plug in other custom providers
  registerProvider(channel: 'email' | 'whatsapp' | 'sms' | 'in_app', provider: NotificationProvider) {
    activeProviders[channel] = provider;
    console.log(`[NotificationEngine] Registered new provider for ${channel}: ${provider.name}`);
  },

  getRegisteredProviders() {
    return Object.keys(activeProviders).map(channel => ({
      channel,
      name: activeProviders[channel].name
    }));
  },

  // Abstract Dispatch Engine
  async dispatch(event: {
    eventType: string; // e.g. 'booking.created', 'booking.confirmed', 'booking.cancelled', 'booking.rescheduled', 'payment.success', 'payment.failed', 'refund.initiated', 'refund.completed', 'appointment.reminder', 'review.request'
    bookingId: number;
    businessId: number;
    recipientPhone?: string;
    recipientEmail?: string;
    recipientUserId?: number;
    customerName: string;
    customTemplateName?: string;
    customParams?: any;
  }) {
    console.log(`[NotificationEngine] Triggering dispatch for event: ${event.eventType}`);

    // Retrieve active business details
    const busRes = await pg.query<any>('SELECT name, tagline, phone, primary_currency FROM businesses WHERE id = $1', [event.businessId]);
    const business = busRes.rows[0];
    const bizName = business?.name || 'Aura Luxe';
    const currency = business?.primary_currency || '₹';

    // Retrieve booking details
    const bookingRes = await pg.query<any>(`
      SELECT b.id, b.booking_date, b.booking_time, b.total_amount, b.advance_amount_paid, b.venue_balance_due, b.booking_mode, b.home_service_address,
             s.title as service_title, st.name as staff_name, br.name as branch_name, br.address as branch_address
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN staff st ON b.staff_id = st.id
      LEFT JOIN branches br ON b.branch_id = br.id
      WHERE b.id = $1
    `, [event.bookingId]);

    const booking = bookingRes.rows[0] || {};
    const serviceTitle = booking.service_title || 'Expert Treatment';
    const bookingDate = booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A';
    const bookingTime = booking.booking_time || 'N/A';
    const staffName = booking.staff_name || 'Expert Stylist';
    const branchName = booking.branch_name || 'Main Studio';
    const totalAmount = Number(booking.total_amount || 0);
    const advancePaid = Number(booking.advance_amount_paid || 0);
    const balanceDue = Number(booking.venue_balance_due || 0);

    // Build template message text dynamically
    let title = '';
    let message = '';
    let templateName = event.customTemplateName || '';

    switch (event.eventType) {
      case 'booking.created':
        title = 'Booking Received';
        templateName = templateName || 'booking_created_template';
        message = `Hello ${event.customerName}, we have received your booking request #${event.bookingId} for ${serviceTitle} at ${bizName}. We are verifying practitioner slots now.`;
        break;

      case 'booking.confirmed':
        title = 'Your Appointment is Confirmed!';
        templateName = templateName || 'booking_confirmed_template';
        message = `Your appointment is confirmed.\n\n` +
                  `Service: ${serviceTitle}\n` +
                  `Stylist: ${staffName}\n` +
                  `Date: ${bookingDate}\n` +
                  `Time: ${bookingTime}\n` +
                  `Outlet: ${branchName}\n` +
                  `Total: ${currency}${totalAmount}\n` +
                  `Paid: ${currency}${advancePaid}\n` +
                  `Remaining: ${currency}${balanceDue}\n\n` +
                  `View Booking & Directions: wa.me/919876543210`;
        break;

      case 'booking.cancelled':
        title = 'Appointment Cancelled';
        templateName = templateName || 'booking_cancelled_template';
        message = `Hello ${event.customerName}, your appointment #${event.bookingId} for ${serviceTitle} has been successfully cancelled as requested. Any applicable refund has been initiated.`;
        break;

      case 'booking.rescheduled':
        title = 'Appointment Time Changed';
        templateName = templateName || 'booking_rescheduled_template';
        message = `Hello ${event.customerName}, your appointment #${event.bookingId} has been rescheduled to ${bookingDate} at ${bookingTime} with ${staffName}. We look forward to seeing you.`;
        break;

      case 'payment.success':
        title = 'Payment Confirmed!';
        templateName = templateName || 'payment_success_template';
        message = `Hello ${event.customerName}, your payment of ${currency}${advancePaid} for booking #${event.bookingId} has been successfully verified! Receipt ID: TXN-${Math.floor(Math.random() * 100000)}.`;
        break;

      case 'payment.failed':
        title = 'Payment Failed';
        templateName = templateName || 'payment_failed_template';
        message = `Hello ${event.customerName}, your online payment transaction for appointment #${event.bookingId} has failed. Please try again within 15 minutes to secure your stylist.`;
        break;

      case 'refund.initiated':
        title = 'Refund Process Initiated';
        templateName = templateName || 'refund_initiated_template';
        message = `Hello ${event.customerName}, a refund of ${currency}${advancePaid} for booking #${event.bookingId} has been initiated. Funds will credit back to your account in 3-5 bank working days.`;
        break;

      case 'refund.completed':
        title = 'Refund Successfully Completed';
        templateName = templateName || 'refund_completed_template';
        message = `Hello ${event.customerName}, your refund of ${currency}${advancePaid} for booking #${event.bookingId} has been fully settled back to your source account. ARN: ${Math.floor(Math.random() * 10000000)}.`;
        break;

      case 'appointment.reminder':
        title = 'Reminder: Your Appointment is Tomorrow!';
        templateName = templateName || 'appointment_reminder_template';
        message = `Reminder: You have an appointment tomorrow, ${bookingDate} at ${bookingTime} at ${branchName}. See you soon!`;
        break;

      case 'review.request':
        title = 'How was your experience?';
        templateName = templateName || 'review_request_template';
        message = `Hello ${event.customerName}, thank you for choosing ${bizName}! How was your service with ${staffName}? Please tap here to share your photos and review: wa.me/919876543210`;
        break;

      default:
        title = 'Platform Alert';
        message = `Update regarding your salon booking #${event.bookingId} for ${serviceTitle}.`;
    }

    const templateParams = {
      customerName: event.customerName,
      bookingId: event.bookingId,
      serviceTitle,
      bookingDate,
      bookingTime,
      staffName,
      branchName,
      totalAmount,
      advancePaid,
      balanceDue,
      currency,
      ...(event.customParams || {})
    };

    const dispatchLog: any[] = [];

    // Trigger WhatsApp Dispatch
    if (event.recipientPhone) {
      const waProvider = activeProviders['whatsapp'];
      if (waProvider) {
        try {
          const res = await waProvider.send({
            recipient: event.recipientPhone,
            message,
            templateName,
            templateParams
          });
          dispatchLog.push({ channel: 'whatsapp', success: res.success, providerId: res.providerId, provider: waProvider.name });
        } catch (e: any) {
          dispatchLog.push({ channel: 'whatsapp', success: false, error: e.message || 'Error' });
        }
      }

      // Trigger SMS Dispatch as backup
      const smsProvider = activeProviders['sms'];
      if (smsProvider) {
        try {
          const res = await smsProvider.send({
            recipient: event.recipientPhone,
            message
          });
          dispatchLog.push({ channel: 'sms', success: res.success, providerId: res.providerId, provider: smsProvider.name });
        } catch (e: any) {
          dispatchLog.push({ channel: 'sms', success: false, error: e.message || 'Error' });
        }
      }
    }

    // Trigger Email Dispatch
    if (event.recipientEmail) {
      const mailProvider = activeProviders['email'];
      if (mailProvider) {
        try {
          const res = await mailProvider.send({
            recipient: event.recipientEmail,
            title,
            message
          });
          dispatchLog.push({ channel: 'email', success: res.success, providerId: res.providerId, provider: mailProvider.name });
        } catch (e: any) {
          dispatchLog.push({ channel: 'email', success: false, error: e.message || 'Error' });
        }
      }
    }

    // Trigger In-App Notification
    if (event.recipientUserId) {
      const inAppProvider = activeProviders['in_app'];
      if (inAppProvider) {
        try {
          const res = await inAppProvider.send({
            recipient: String(event.recipientUserId),
            title,
            message
          });
          dispatchLog.push({ channel: 'in_app', success: res.success, providerId: res.providerId, provider: inAppProvider.name });
        } catch (e: any) {
          dispatchLog.push({ channel: 'in_app', success: false, error: e.message || 'Error' });
        }
      }
    }

    // Persist dispatch history logs in database
    for (const log of dispatchLog) {
      await pg.query(`
        INSERT INTO notifications (
          business_id, booking_id, event_type, channel, provider, recipient, title, message, status, template_name, template_params
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        event.businessId,
        event.bookingId,
        event.eventType,
        log.channel,
        log.provider || 'None',
        log.channel === 'email' ? (event.recipientEmail || 'N/A') : (event.recipientPhone || 'N/A'),
        title,
        message,
        log.success ? 'SENT' : 'FAILED',
        templateName,
        JSON.stringify(templateParams)
      ]);
    }

    return {
      success: true,
      logs: dispatchLog,
      message,
    };
  }
};
