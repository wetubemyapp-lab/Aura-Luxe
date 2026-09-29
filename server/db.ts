import { PGlite } from '@electric-sql/pglite';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.resolve(process.cwd(), 'data/pgdata');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export const pg = new PGlite(DB_DIR);

export async function initDatabase() {
  console.log('Initializing Universal Business Platform OS Database...');

  // Load new core schema
  const schemaPath = path.resolve(process.cwd(), 'server/db/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pg.exec(schema);

  // Keep existing migrations/seeders (legacy tables)
  // ... (keep existing init code)
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      tagline TEXT,
      tagline_hi TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      opening_hours TEXT,
      about_text TEXT,
      about_text_hi TEXT,
      banner_url TEXT,
      logo_url TEXT,
      primary_currency TEXT DEFAULT '₹',
      theme_accent TEXT DEFAULT '#E07A5F',
      tax_rate NUMERIC(5,2) DEFAULT 5.00,
      slot_interval_mins INTEGER DEFAULT 30,
      buffer_time_mins INTEGER DEFAULT 15,
      deposit_required BOOLEAN DEFAULT FALSE,
      deposit_percentage NUMERIC(5,2) DEFAULT 20.00,
      advance_payment_percentage NUMERIC(5,2) DEFAULT 20.00,
      home_service_travel_fee NUMERIC(10,2) DEFAULT 150.00,
      allow_home_service BOOLEAN DEFAULT TRUE,
      cancel_policy_hours_threshold INTEGER DEFAULT 24,
      cancel_policy_full_refund_pct NUMERIC(5,2) DEFAULT 100.00,
      cancel_policy_late_refund_pct NUMERIC(5,2) DEFAULT 50.00,
      noshow_refund_pct NUMERIC(5,2) DEFAULT 0.00,
      platform_fee_pct NUMERIC(5,2) DEFAULT 2.50,
      features_config JSONB DEFAULT '{"allowAddons":true,"requireDeposit":false,"showStaffSelection":true,"enableCoupons":true,"enablePackages":true}'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS branches (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      opening_hours TEXT,
      google_maps_url TEXT,
      is_main BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      is_archived BOOLEAN DEFAULT FALSE,
      deleted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE SET NULL,
      branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('customer', 'owner', 'admin', 'branch_manager', 'staff', 'receptionist')),
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      title_hi TEXT,
      category TEXT NOT NULL,
      description TEXT,
      description_hi TEXT,
      price NUMERIC(10,2) NOT NULL,
      discount_price NUMERIC(10,2),
      travel_fee NUMERIC(10,2) DEFAULT 0,
      duration_mins INTEGER NOT NULL DEFAULT 45,
      buffer_mins INTEGER NOT NULL DEFAULT 10,
      image_url TEXT,
      video_url TEXT,
      is_popular BOOLEAN DEFAULT FALSE,
      is_featured BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      is_archived BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS service_addons (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      title_hi TEXT,
      price NUMERIC(10,2) NOT NULL,
      duration_mins INTEGER DEFAULT 15,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS staff (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      role_title TEXT NOT NULL,
      role_title_hi TEXT,
      bio TEXT,
      experience TEXT,
      skills TEXT,
      phone TEXT,
      email TEXT,
      image_url TEXT,
      specialties TEXT,
      working_hours TEXT DEFAULT '09:00 - 18:00',
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'active', 'inactive', 'on_leave')),
      home_service_enabled BOOLEAN DEFAULT TRUE,
      online_booking_enabled BOOLEAN DEFAULT TRUE,
      commission_rate NUMERIC(5,2) DEFAULT 15.00,
      is_active BOOLEAN DEFAULT TRUE,
      is_archived BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS packages (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      services TEXT,
      duration TEXT DEFAULT '60 mins',
      regular_price NUMERIC(10,2) NOT NULL,
      package_price NUMERIC(10,2) NOT NULL,
      discount TEXT DEFAULT '20%',
      validity TEXT DEFAULT '30 Days',
      usage_rules TEXT,
      outlets TEXT DEFAULT 'All Outlets',
      image_url TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      is_archived BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS offers (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      title_hi TEXT,
      subtitle TEXT,
      description TEXT,
      banner_image TEXT,
      festival_tag TEXT DEFAULT 'Diwali',
      start_at TIMESTAMP,
      end_at TIMESTAMP,
      offer_type TEXT DEFAULT 'festival',
      discount_type TEXT DEFAULT 'percentage',
      discount_value NUMERIC(10,2) DEFAULT 0,
      coupon_code TEXT,
      included_services TEXT,
      included_package TEXT,
      outlets TEXT,
      discount_pct INTEGER,
      code TEXT,
      valid_until TEXT,
      is_featured BOOLEAN DEFAULT TRUE,
      is_active BOOLEAN DEFAULT TRUE,
      is_archived BOOLEAN DEFAULT FALSE,
      deleted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      discount_type TEXT DEFAULT 'percentage',
      discount_value NUMERIC(10,2) NOT NULL,
      min_spend NUMERIC(10,2) DEFAULT 0,
      max_discount_amount NUMERIC(10,2),
      usage_limit INTEGER DEFAULT 100,
      used_count INTEGER DEFAULT 0,
      valid_from DATE,
      valid_until DATE,
      is_active BOOLEAN DEFAULT TRUE,
      is_archived BOOLEAN DEFAULT FALSE,
      deleted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'Photo',
      service TEXT,
      image_url TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_featured BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      is_archived BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS videos (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      video_url TEXT NOT NULL,
      thumbnail_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      is_verified BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
      staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
      booking_mode TEXT NOT NULL DEFAULT 'online' CHECK (booking_mode IN ('online', 'home_service', 'walk_in')),
      home_service_address TEXT,
      travel_fee NUMERIC(10,2) DEFAULT 0,
      booking_date DATE NOT NULL,
      booking_time TEXT NOT NULL,
      duration_mins INTEGER NOT NULL DEFAULT 45,
      status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('DRAFT', 'HELD', 'PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'IN_SERVICE', 'COMPLETED', 'RESCHEDULE_REQUESTED', 'CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_OWNER', 'NO_SHOW', 'REFUND_PENDING', 'REFUNDED', 'pending', 'confirmed', 'in_service', 'completed', 'cancelled', 'no_show')),
      payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('INITIATED', 'PENDING', 'AUTHORIZED', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUND_PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CANCELLED', 'unpaid', 'deposit_paid', 'paid', 'refunded')),
      payment_option TEXT NOT NULL DEFAULT 'full_online' CHECK (payment_option IN ('full_online', 'advance_online', 'pay_at_venue')),
      service_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      addons_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      advance_amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
      venue_balance_due NUMERIC(10,2) NOT NULL DEFAULT 0,
      total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      addons_json TEXT,
      coupon_code TEXT,
      notes TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      customer_email TEXT,
      checked_in_at TIMESTAMP,
      checked_in_by TEXT,
      is_archived BOOLEAN DEFAULT FALSE,
      deleted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS booking_items (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
      service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
      service_title TEXT NOT NULL,
      price NUMERIC(10,2) NOT NULL,
      duration_mins INTEGER NOT NULL DEFAULT 30,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payment_transactions (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
      idempotency_key TEXT UNIQUE NOT NULL,
      gateway TEXT DEFAULT 'Razorpay',
      transaction_id TEXT,
      amount NUMERIC(10,2) NOT NULL,
      currency TEXT DEFAULT '₹',
      payment_mode TEXT,
      status TEXT NOT NULL DEFAULT 'INITIATED',
      raw_payload TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS refunds (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      amount_paid NUMERIC(10,2) NOT NULL,
      refund_amount NUMERIC(10,2) NOT NULL,
      fee_deducted NUMERIC(10,2) DEFAULT 0,
      reason TEXT,
      policy_applied TEXT,
      status TEXT NOT NULL DEFAULT 'REFUND_PENDING' CHECK (status IN ('REFUND_PENDING', 'REFUND_PROCESSING', 'REFUNDED', 'REFUND_FAILED', 'PARTIALLY_REFUNDED')),
      gateway_refund_id TEXT,
      gateway_response_json TEXT,
      cancelled_by_role TEXT NOT NULL DEFAULT 'owner',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS booking_holds (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      outlet_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
      staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
      booking_date DATE NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      duration_mins INTEGER DEFAULT 45,
      session_id TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CONVERTED', 'CANCELLED')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ledger_entries (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
      entry_type TEXT NOT NULL CHECK (entry_type IN ('payment', 'deposit', 'refund', 'staff_commission', 'platform_fee', 'tip')),
      payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi', 'online', 'wallet')),
      amount NUMERIC(10,2) NOT NULL,
      platform_fee_amount NUMERIC(10,2) DEFAULT 0,
      merchant_net_amount NUMERIC(10,2) DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
      reference_no TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settlements (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      settlement_period_start DATE NOT NULL,
      settlement_period_end DATE NOT NULL,
      gross_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      platform_commission NUMERIC(10,2) NOT NULL DEFAULT 0,
      net_payout NUMERIC(10,2) NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'settled', 'on_hold')),
      payout_method TEXT DEFAULT 'bank_transfer',
      reference_no TEXT,
      paid_at TIMESTAMP,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
      user_id INTEGER,
      user_name TEXT,
      user_role TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      details JSONB DEFAULT '{}'::jsonb,
      ip_address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      business_id INTEGER,
      booking_id INTEGER,
      event_type TEXT NOT NULL,
      channel TEXT NOT NULL,
      provider TEXT NOT NULL,
      recipient TEXT NOT NULL,
      title TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'SENT',
      template_name TEXT,
      template_params JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe migrations in case tables were created in earlier foundation
  try {
    await pg.exec(`
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS advance_payment_percentage NUMERIC(5,2) DEFAULT 20.00;
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS allow_home_service BOOLEAN DEFAULT TRUE;
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS home_service_travel_fee NUMERIC(10,2) DEFAULT 150.00;
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT '+919876543210';
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS platform_commission_pct NUMERIC(5,2) DEFAULT 5.00;

      ALTER TABLE branches ADD COLUMN IF NOT EXISTS slug TEXT;
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS whatsapp TEXT;
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS holidays TEXT;
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS business_category TEXT;
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS logo_url TEXT;
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS cover_image TEXT;
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS theme_color TEXT;
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS cancellation_policy TEXT;
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS advance_deposit_pct NUMERIC(5,2);
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS payment_settings JSONB DEFAULT '{"acceptCash":true,"acceptCard":true,"acceptUpi":true,"upiId":"aura@upi"}'::jsonb;
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS home_service_settings JSONB DEFAULT '{"allowed":true,"radiusKm":15,"extraFee":150}'::jsonb;
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS booking_settings JSONB DEFAULT '{"slotDurationMins":30,"maxAdvanceDays":30,"bufferTimeMins":10,"parallelChairs":4}'::jsonb;
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS service_ids JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE branches ADD COLUMN IF NOT EXISTS staff_ids JSONB DEFAULT '[]'::jsonb;

      ALTER TABLE users ADD COLUMN IF NOT EXISTS business_id INTEGER;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_id INTEGER;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

      ALTER TABLE services ADD COLUMN IF NOT EXISTS business_id INTEGER;
      ALTER TABLE services ADD COLUMN IF NOT EXISTS buffer_mins INTEGER DEFAULT 10;
      ALTER TABLE services ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
      ALTER TABLE services ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

      ALTER TABLE staff ADD COLUMN IF NOT EXISTS business_id INTEGER;
      ALTER TABLE staff ADD COLUMN IF NOT EXISTS branch_id INTEGER;
      ALTER TABLE staff ADD COLUMN IF NOT EXISTS role_title_hi TEXT;
      ALTER TABLE staff ADD COLUMN IF NOT EXISTS bio TEXT;
      ALTER TABLE staff ADD COLUMN IF NOT EXISTS specialties TEXT;
      ALTER TABLE staff ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 15.00;
      ALTER TABLE staff ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
      ALTER TABLE staff ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

      ALTER TABLE packages ADD COLUMN IF NOT EXISTS business_id INTEGER;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS original_price NUMERIC(10,2);
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS service_ids TEXT;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS services TEXT;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '60 mins';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS regular_price NUMERIC(10,2);
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS package_price NUMERIC(10,2);
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS discount TEXT DEFAULT '20%';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS validity TEXT DEFAULT '30 Days';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS usage_rules TEXT;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS outlets TEXT DEFAULT 'All Outlets';
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

      ALTER TABLE offers ADD COLUMN IF NOT EXISTS business_id INTEGER;
      ALTER TABLE offers ADD COLUMN IF NOT EXISTS discount_pct INTEGER DEFAULT 15;
      ALTER TABLE offers ADD COLUMN IF NOT EXISTS code TEXT;
      ALTER TABLE offers ADD COLUMN IF NOT EXISTS valid_until TEXT;
      ALTER TABLE offers ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
      ALTER TABLE offers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS business_id INTEGER;
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'percentage';
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_value NUMERIC(10,2) DEFAULT 0;
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS min_spend NUMERIC(10,2) DEFAULT 0;
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
      ALTER TABLE coupons ALTER COLUMN discount_amount DROP NOT NULL;

      ALTER TABLE gallery ADD COLUMN IF NOT EXISTS business_id INTEGER;
      ALTER TABLE gallery ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE gallery ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Photo';
      ALTER TABLE gallery ADD COLUMN IF NOT EXISTS service TEXT;
      ALTER TABLE gallery ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
      ALTER TABLE gallery ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
      ALTER TABLE gallery ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
      ALTER TABLE gallery ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
      ALTER TABLE gallery ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

      ALTER TABLE videos ADD COLUMN IF NOT EXISTS business_id INTEGER;
      ALTER TABLE videos ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
      ALTER TABLE videos ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
      ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
      ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
      ALTER TABLE videos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS business_id INTEGER;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS title TEXT;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS images TEXT;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS service_id INTEGER REFERENCES services(id) ON DELETE SET NULL;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS owner_reply TEXT;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_reported BOOLEAN DEFAULT FALSE;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS report_reason TEXT;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_removed BOOLEAN DEFAULT FALSE;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS removal_reason TEXT;

      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS business_id INTEGER;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS branch_id INTEGER;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_mode TEXT DEFAULT 'online';
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS home_service_address TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS travel_fee NUMERIC(10,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration_mins INTEGER DEFAULT 45;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_option TEXT DEFAULT 'full_online';
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_amount NUMERIC(10,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS addons_amount NUMERIC(10,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS advance_amount_paid NUMERIC(10,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS venue_balance_due NUMERIC(10,2) DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS coupon_code TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS addons_json TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

      ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS platform_fee_amount NUMERIC(10,2) DEFAULT 0;
      ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS merchant_net_amount NUMERIC(10,2) DEFAULT 0;

      UPDATE services SET business_id = 1 WHERE business_id IS NULL;
      UPDATE staff SET business_id = 1 WHERE business_id IS NULL;
      UPDATE packages SET business_id = 1 WHERE business_id IS NULL;
      UPDATE offers SET business_id = 1 WHERE business_id IS NULL;
      UPDATE coupons SET business_id = 1 WHERE business_id IS NULL;
      UPDATE gallery SET business_id = 1 WHERE business_id IS NULL;
      UPDATE videos SET business_id = 1 WHERE business_id IS NULL;
      UPDATE reviews SET business_id = 1 WHERE business_id IS NULL;
      UPDATE bookings SET business_id = 1 WHERE business_id IS NULL;
    `);
  } catch (e) {
    // ignore
  }

  // Seed Branches for Multi-outlet support
  const branchCheck = await pg.query<any>('SELECT COUNT(*) as count FROM branches');
  if (parseInt(branchCheck.rows[0].count) === 0) {
    await pg.query(`
      INSERT INTO branches (business_id, name, code, address, phone, email, opening_hours, google_maps_url, is_main, is_active)
      VALUES
      (1, 'Aura Luxe - Flagship Bandra West', 'BR-MUM-01', 'Shop 4 & 5, Hill Road, Bandra West, Mumbai 400050', '+91 98200 11223', 'bandra@auraluxe.com', 'Mon-Sun: 09:30 AM - 09:30 PM', 'https://maps.google.com/?q=Bandra+West+Mumbai', true, true),
      (1, 'Aura Luxe - Indiranagar Studio', 'BR-BLR-02', '100ft Road, Near Sony Signal, Indiranagar, Bengaluru 560038', '+91 98450 33445', 'indiranagar@auraluxe.com', 'Tue-Sun: 10:00 AM - 09:00 PM', 'https://maps.google.com/?q=Indiranagar+Bangalore', false, true),
      (1, 'Aura Luxe - South Extension Sanctuary', 'BR-DEL-03', 'M-Block Market, South Extension Part II, New Delhi 110049', '+91 98110 55667', 'southex@auraluxe.com', 'Mon-Sun: 10:00 AM - 09:00 PM', 'https://maps.google.com/?q=South+Extension+Delhi', false, true)
    `);
  }

  // Ensure Staff exists for all businesses
  const staffCheck = await pg.query<any>('SELECT COUNT(*) as count FROM staff');
  if (parseInt(staffCheck.rows[0].count) < 4) {
    await pg.query(`
      INSERT INTO staff (business_id, name, role_title, role_title_hi, bio, image_url, specialties, commission_rate)
      VALUES
      (1, 'Vikram Oberoi', 'Creative Director & Master Stylist', 'मास्टर हेयर स्टाइलिस्ट', '12+ years in couture hair styling and unisex transformations.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'Couture Styling, Balayage, Precision Cuts', 20.00),
      (1, 'Ananya Deshmukh', 'Senior Aesthetician & Spa Therapist', 'सीनियर एस्थेटिशियन', 'Specialist in holistic skin treatments, head spas, and ayurvedic care.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', '24K Facials, Deep Tissue, Lymphatic Massage', 18.00),
      (2, 'Karan Malhotra', 'Head Barber & Razor Artisan', 'हेड बार्बर', 'Trained in London Academy with 9 years of straight-razor mastery.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'Skin Fades, Hot Towel Shave, Beard Sculpting', 25.00),
      (3, 'Dev Sen', 'Lead Ink Artist & Illustrative Master', 'लीड टैटू आर्टिस्ट', 'Specialized in Japanese Irezumi, blackwork, and fine-line sacred art.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 'Fine Line, Irezumi, Hyper Realism', 35.00)
    `);
  }

  // Ensure Service Add-ons exist for active services safely
  const addonCheck = await pg.query<any>('SELECT COUNT(*) as count FROM service_addons');
  if (parseInt(addonCheck.rows[0].count) === 0) {
    const srvRow = await pg.query<any>('SELECT id FROM services WHERE business_id = 1 ORDER BY id ASC LIMIT 2');
    if (srvRow.rows.length > 0) {
      const s1 = srvRow.rows[0].id;
      const s2 = srvRow.rows[1] ? srvRow.rows[1].id : s1;
      await pg.query(`
        INSERT INTO service_addons (business_id, service_id, title, title_hi, price, duration_mins)
        VALUES
        (1, ${s1}, 'Deep Argan Scalp Mask', 'डीप आर्गन स्कैल्प मास्क', 350, 15),
        (1, ${s1}, 'Beard Hot Towel Conditioning', 'हॉट टॉवल कंडीशनिंग', 250, 10),
        (1, ${s2}, 'Hydrating Eye Collagen Pads', 'हाइड्रेटिंग आई कोलेजन पैड', 200, 10)
      `);
    }
  }

  // Ensure Packages exist
  const pkgCheck = await pg.query<any>('SELECT COUNT(*) as count FROM packages');
  if (parseInt(pkgCheck.rows[0].count) === 0) {
    await pg.query(`
      INSERT INTO packages (business_id, name, description, price, original_price, service_ids)
      VALUES
      (1, 'Royal Glow Bridal & Grooming Ritual', 'Includes Royal Scissor Cut, 24K Gold Facial, and Aromatherapy Body Spa', 5400, 6450, '1,2,3')
    `);
  }

  // Ensure Offers & Coupons exist
  const coupCheck = await pg.query<any>('SELECT COUNT(*) as count FROM coupons');
  if (parseInt(coupCheck.rows[0].count) === 0) {
    await pg.query(`
      INSERT INTO coupons (business_id, code, discount_type, discount_value, discount_amount, min_spend)
      VALUES
      (1, 'AURA100', 'flat', 100, 100, 1000),
      (1, 'LUXE15', 'percentage', 15, 15, 1500)
    `);
  }

  const offCheck = await pg.query<any>('SELECT COUNT(*) as count FROM offers');
  if (parseInt(offCheck.rows[0].count) === 0) {
    await pg.query(`
      INSERT INTO offers (business_id, title, title_hi, description, discount_pct, code, valid_until)
      VALUES
      (1, 'Festive Radiance Special', 'त्योहारी विशेष छूट', 'Enjoy 20% off on all facial and spa treatments this season', 20, 'FESTIVE20', '2026-12-31')
    `);
  }

  // Ensure Gallery & Reviews exist
  const galCheck = await pg.query<any>('SELECT COUNT(*) as count FROM gallery');
  if (parseInt(galCheck.rows[0].count) === 0) {
    await pg.query(`
      INSERT INTO gallery (business_id, title, category, image_url)
      VALUES
      (1, 'Haute Couture Hair Transformation', 'Hair', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'),
      (1, 'Private Luxury Spa Suite', 'Spa', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'),
      (1, 'Handcrafted Luxury Gel Art', 'Nails', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80')
    `);
  }

  const revCheck = await pg.query<any>('SELECT COUNT(*) as count FROM reviews');
  if (parseInt(revCheck.rows[0].count) === 0) {
    await pg.query(`
      INSERT INTO reviews (business_id, user_name, rating, comment, is_verified)
      VALUES
      (1, 'Meera Singhania', 5, 'Exceptional artistry! The facial ritual and hair styling were pure luxury.', true),
      (1, 'Rahul Verma', 5, 'World-class serene ambiance, prompt scheduling and wonderful staff.', true)
    `);
  }

  // Seed Multi-Tenant Business Profiles if empty
  const businessCount = await pg.query<{ count: string }>('SELECT COUNT(*) as count FROM businesses');
  if (parseInt(businessCount.rows[0].count) === 0) {
    console.log('Seeding Multi-Tenant Business Profiles...');

    // 1. Aura Luxe Unisex Salon & Spa
    const b1 = await pg.query<{ id: number }>(`
      INSERT INTO businesses (
        slug, name, category, tagline, tagline_hi, phone, email, address, opening_hours,
        about_text, about_text_hi, banner_url, logo_url, primary_currency, theme_accent,
        tax_rate, slot_interval_mins, buffer_time_mins, deposit_required, deposit_percentage,
        features_config
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      ) RETURNING id
    `, [
      'aura-luxe',
      'Aura Luxe Unisex Salon & Spa',
      'unisex_salon',
      'Artistry in Grooming, Beauty & Rejuvenation',
      'सौंदर्य, संवार और विश्राम की अद्वितीय कला',
      '+91 98765 43210',
      'contact@auraluxe.com',
      '42, Royal Heritage Boulevard, Near Platinum Mall, New Delhi',
      'Mon - Sun: 09:30 AM - 09:00 PM',
      'Founded with a dedication to timeless elegance and contemporary aesthetics, Aura Luxe offers bespoke hair styling, holistic skin rituals, restorative spa therapies, and bridal masteristry. Every appointment is crafted with personalized care in an oasis of serenity.',
      'शाश्वत लालित्य और आधुनिक सौंदर्य के समर्पण के साथ स्थापित, ऑरा लक्स प्रीमियम हेयर स्टाइलिंग, समग्र त्वचा उपचार, आरामदायक स्पा थेरेपी और ब्राइडल मास्टरिस्ट्री प्रदान करता है। हर सेवा शांतिपूर्ण वातावरण में व्यक्तिगत देखभाल के साथ प्रदान की जाती है।',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80',
      '₹',
      '#E07A5F',
      5.00,
      30,
      15,
      false,
      0,
      JSON.stringify({
        allowAddons: true,
        requireDeposit: false,
        showStaffSelection: true,
        enableCoupons: true,
        enablePackages: true,
        genderPreference: true,
      })
    ]);
    const b1Id = b1.rows[0].id;

    // 2. Blade & Crown Barber Co.
    const b2 = await pg.query<{ id: number }>(`
      INSERT INTO businesses (
        slug, name, category, tagline, tagline_hi, phone, email, address, opening_hours,
        about_text, about_text_hi, banner_url, logo_url, primary_currency, theme_accent,
        tax_rate, slot_interval_mins, buffer_time_mins, deposit_required, deposit_percentage,
        features_config
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      ) RETURNING id
    `, [
      'blade-crown',
      'Blade & Crown Barber Co.',
      'barber_shop',
      'Gentlemen\'s Heritage Cuts, Beard Sculpting & Hot Towel Shaves',
      'परंपरागत जेंट्स हेयरकट, दाढ़ी शेपिंग और हॉट टॉवल शेव',
      '+91 98111 55667',
      'info@bladeandcrown.com',
      '18, Connaught Circle, Inner Lane, New Delhi',
      'Tue - Sun: 08:30 AM - 08:30 PM (Mon Closed)',
      'Blade & Crown redefines traditional barbershop heritage with modern precision scissors, straight razor craftsmanship, artisan beard tonics, and an upscale lounge atmosphere.',
      'ब्लेड एंड क्राउन पारंपरिक नाई की विरासत को आधुनिक बाल तराशने और शेविंग शिल्पकला के साथ जीवंत करता है।',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=200&q=80',
      '₹',
      '#C57B57',
      5.00,
      20,
      10,
      false,
      0,
      JSON.stringify({
        allowAddons: true,
        requireDeposit: false,
        showStaffSelection: true,
        enableCoupons: true,
        enablePackages: true,
        walkInQueue: true,
      })
    ]);
    const b2Id = b2.rows[0].id;

    // 3. Sacred Needle Tattoo & Art Studio
    const b3 = await pg.query<{ id: number }>(`
      INSERT INTO businesses (
        slug, name, category, tagline, tagline_hi, phone, email, address, opening_hours,
        about_text, about_text_hi, banner_url, logo_url, primary_currency, theme_accent,
        tax_rate, slot_interval_mins, buffer_time_mins, deposit_required, deposit_percentage,
        features_config
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      ) RETURNING id
    `, [
      'sacred-needle',
      'Sacred Needle Tattoo & Art Studio',
      'tattoo_studio',
      'Custom Bespoke Body Art, Fine Line Inks & Piercings',
      'कस्टम बॉडी टैटू, फाइन लाइन इंक और पियर्सिंग स्टूडियो',
      '+91 99222 33445',
      'studio@sacredneedle.art',
      '7A, Hauz Khas Village Cultural District, New Delhi',
      'Wed - Mon: 11:00 AM - 09:00 PM',
      'An award-winning sanctuary for personalized body art, sterile medical-grade equipment, hyper-realistic portraits, sacred geometry, and fine-line tattooing.',
      'व्यक्तिगत बॉडी आर्ट, मेडिकल-ग्रेड स्वच्छता और हाइपर-यथार्थवादी टैटू का प्रसिद्ध कला केंद्र।',
      'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=200&q=80',
      '₹',
      '#E63946',
      12.00,
      60,
      30,
      true,
      25.00,
      JSON.stringify({
        allowAddons: true,
        requireDeposit: true,
        showStaffSelection: true,
        enableCoupons: true,
        enablePackages: false,
        designUpload: true,
        consentWaiver: true,
      })
    ]);
    const b3Id = b3.rows[0].id;

    // Seed Services for b1 (Aura Luxe)
    await pg.query(`
      INSERT INTO services (business_id, title, title_hi, category, description, description_hi, price, duration_mins, buffer_mins, image_url)
      VALUES 
      (${b1Id}, 'Royal Hair Styling & Texture Cut', 'रॉयल हेयर स्टाइलिंग और कट', 'Hair', 'Precision scissor cut with organic scalp massage and luxury blowout', 'स्कैल्प मसाज और ब्लोआउट के साथ प्रिसीजन कट', 850, 45, 15, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80'),
      (${b1Id}, '24K Gold Radiance Facial', '24K गोल्ड रेडिएंस फेशियल', 'Skin & Facial', 'Deep hydration, gold collagen infusion, and lymphatic drainage massage', 'डीप हाइड्रेशन और गोल्ड कोलेजन फेशियल', 2400, 60, 15, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'),
      (${b1Id}, 'Aromatherapy Deep Tissue Spa', 'अरोमाथेरेपी डीप टिशू स्पा', 'Spa & Massage', 'Full body restorative massage with heated herbal essential oils', 'गर्म हर्बल तेलों के साथ फुल बॉडी मसाज', 3200, 75, 20, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'),
      (${b1Id}, 'Signature Gel Nails & Nail Art', 'सिग्नेचर जेल नेल्स और नेल आर्ट', 'Nails & Studio', 'Manicure with custom hand-painted luxury nail artwork and cuticle care', 'कस्टम हैंड-पेंटेड लग्जरी नेल आर्ट मैनीक्योर', 1400, 50, 10, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80')
    `);

    // Seed Addons for Aura Luxe services
    const srv1 = await pg.query<{ id: number }>('SELECT id FROM services WHERE business_id = $1 LIMIT 1', [b1Id]);
    if (srv1.rows.length > 0) {
      await pg.query(`
        INSERT INTO service_addons (business_id, service_id, title, title_hi, price, duration_mins)
        VALUES
        (${b1Id}, ${srv1.rows[0].id}, 'Deep Argan Scalp Mask', 'डीप आर्गन स्कैल्प मास्क', 350, 15),
        (${b1Id}, ${srv1.rows[0].id}, 'Beard Hot Towel Conditioning', 'हॉट टॉवल कंडीशनिंग', 250, 10),
        (${b1Id}, ${srv1.rows[0].id}, 'Hydrating Eye Collagen Pads', 'हाइड्रेटिंग आई कोलेजन पैड', 200, 10)
      `);
    }

    // Seed Services for b2 (Blade & Crown)
    await pg.query(`
      INSERT INTO services (business_id, title, title_hi, category, description, description_hi, price, duration_mins, buffer_mins, image_url)
      VALUES 
      (${b2Id}, 'Master Executive Fade & Style', 'मास्टर एग्जीक्यूटिव फेड और स्टाइल', 'Cuts & Fades', 'Skin fade, scissor tapers, razor neck line, and matte clay finish', 'क्लासिक फेड और रेजर नेक लाइन', 650, 30, 10, 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'),
      (${b2Id}, 'Royal Hot Towel Straight Razor Shave', 'रॉयल हॉट टॉवल रेजर शेव', 'Shaves & Beard', 'Pre-shave eucalyptus oil, three hot steamed towels, badger brush foam, and cold towel astringent', 'तीन गर्म तौलियों के साथ परंपरागत शेव', 550, 35, 10, 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80'),
      (${b2Id}, 'Beard Sculpture & Keratin Treatment', 'दाढ़ी शेपिंग और केराटिन', 'Shaves & Beard', 'Precision beard contouring, electric taper, hot oil conditioning', 'दाढ़ी का प्रिसीजन कंटूर और तेल उपचार', 450, 25, 10, 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80'),
      (${b2Id}, 'Charcoal Detox Face Treatment', 'चारकोल डिटॉक्स फेशियल', 'Grooming', 'Deep pore extraction, volcanic scrub, and calming aloe recovery', 'गहन रोमछिद्र सफाई और चारकोल स्क्रब', 800, 35, 10, 'https://images.unsplash.com/photo-1512290900672-1f41d9a5b399?auto=format&fit=crop&w=600&q=80')
    `);

    // Seed Services for b3 (Sacred Needle Tattoo)
    await pg.query(`
      INSERT INTO services (business_id, title, title_hi, category, description, description_hi, price, duration_mins, buffer_mins, image_url)
      VALUES 
      (${b3Id}, 'Fine Line & Micro Custom Tattoo', 'फाइन लाइन कस्टम टैटू', 'Custom Tattoos', 'Bespoke single-needle fine lines, floral geometry, or quotes up to 3 inches', 'एकल सुई फाइन लाइन और ज्यामितीय टैटू', 3500, 90, 30, 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=600&q=80'),
      (${b3Id}, 'Half-Day Tattoo Session (Hourly)', 'हाफ-डे टैटू सत्र (4 घंटे)', 'Large Scale', '4-hour dedicated studio sitting for realistic shading, sleeves, or back pieces', 'विस्तृत आस्तीन या पीठ टैटू सत्र', 9500, 240, 45, 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=600&q=80'),
      (${b3Id}, 'Artisan Titanium Piercing & Jewelry', 'टाइटेनियम पियर्सिंग और ज्वेलरी', 'Piercing', 'Aseptic needle piercing with implant-grade ASTM F-136 titanium stud', 'इम्प्लांट ग्रेड टाइटेनियम के साथ सुरक्षित पियर्सिंग', 1200, 30, 15, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80')
    `);

    // Seed Staff
    await pg.query(`
      INSERT INTO staff (business_id, name, role_title, role_title_hi, bio, image_url, specialties, commission_rate)
      VALUES
      (${b1Id}, 'Vikram Oberoi', 'Creative Director & Master Stylist', 'मास्टर हेयर स्टाइलिस्ट', '12+ years in couture hair styling and unisex transformations.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'Couture Styling, Balayage, Precision Cuts', 20.00),
      (${b1Id}, 'Ananya Deshmukh', 'Senior Aesthetician & Spa Therapist', 'सीनियर एस्थेटिशियन', 'Specialist in holistic skin treatments, head spas, and ayurvedic care.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', '24K Facials, Deep Tissue, Lymphatic Massage', 18.00),
      (${b2Id}, 'Karan Malhotra', 'Head Barber & Razor Artisan', 'हेड बार्बर', 'Trained in London Academy with 9 years of straight-razor mastery.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'Skin Fades, Hot Towel Shave, Beard Sculpting', 25.00),
      (${b3Id}, 'Dev Sen', 'Lead Ink Artist & Illustrative Master', 'लीड टैटू आर्टिस्ट', 'Specialized in Japanese Irezumi, blackwork, and fine-line sacred art.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 'Fine Line, Irezumi, Hyper Realism', 35.00)
    `);

    // Seed Packages
    await pg.query(`
      INSERT INTO packages (business_id, name, description, price, original_price, service_ids)
      VALUES
      (${b1Id}, 'Royal Glow Bridal & Grooming Ritual', 'Includes Royal Scissor Cut, 24K Gold Facial, and Aromatherapy Body Spa', 5400, 6450, '1,2,3'),
      (${b2Id}, 'Gentleman\'s Complete Grooming Signature', 'Executive Haircut + Hot Towel Straight Razor Shave + Charcoal Face Mask', 1650, 2000, '1,2,4')
    `);

    // Seed Offers & Coupons
    await pg.query(`
      INSERT INTO offers (business_id, title, title_hi, description, discount_pct, code, valid_until)
      VALUES
      (${b1Id}, 'Festive Radiance Special', 'त्योहारी विशेष छूट', 'Enjoy 20% off on all facial and spa treatments this season', 20, 'FESTIVE20', '2026-12-31'),
      (${b2Id}, 'First-Visit Grooming Welcome', 'प्रथम विज़िट डिस्काउंट', '15% instant reduction on premier haircut and shave combos', 15, 'WELCOME15', '2026-12-31')
    `);

    await pg.query(`
      INSERT INTO coupons (business_id, code, discount_type, discount_value, min_spend)
      VALUES
      (${b1Id}, 'AURA100', 'flat', 100, 1000),
      (${b1Id}, 'LUXE15', 'percentage', 15, 1500),
      (${b2Id}, 'BARBER50', 'flat', 50, 500)
    `);

    // Seed Gallery
    await pg.query(`
      INSERT INTO gallery (business_id, title, category, image_url)
      VALUES
      (${b1Id}, 'Haute Couture Hair Transformation', 'Hair', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'),
      (${b1Id}, 'Private Luxury Spa Suite', 'Spa', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'),
      (${b1Id}, 'Handcrafted Luxury Gel Art', 'Nails', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80'),
      (${b2Id}, 'Precision Razor Beard Trim', 'Beard', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80'),
      (${b3Id}, 'Fine Line Botanical Ink', 'Tattoo', 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80')
    `);

    // Seed Reviews
    await pg.query(`
      INSERT INTO reviews (business_id, user_name, rating, comment, is_verified)
      VALUES
      (${b1Id}, 'Meera Singhania', 5, 'Exceptional artistry! The facial ritual and hair styling were pure luxury.', true),
      (${b1Id}, 'Rahul Verma', 5, 'World-class serene ambiance, prompt scheduling and wonderful staff.', true),
      (${b2Id}, 'Arjun Mehta', 5, 'Best straight razor shave in Delhi. Authentic gentlemen\'s grooming experience.', true)
    `);
  }

  // Ensure users exist for all platform roles
  const usersToSeed = [
    { email: 'owner@auraluxe.com', name: 'Rajesh Sharma (Owner)', role: 'owner', phone: '+91 98765 43210' },
    { email: 'manager@auraluxe.com', name: 'Sunita Mehra (Bandra Branch Manager)', role: 'branch_manager', phone: '+91 98200 44556' },
    { email: 'reception@auraluxe.com', name: 'Aakash Verma (Receptionist)', role: 'receptionist', phone: '+91 98200 77889' },
    { email: 'staff@auraluxe.com', name: 'Vikram Oberoi (Master Stylist)', role: 'staff', phone: '+91 98200 99001' },
    { email: 'admin@auraluxe.com', name: 'Rajesh Sharma (Admin)', role: 'admin', phone: '+91 98765 43210' },
    { email: 'customer@example.com', name: 'Priya Kapoor', role: 'customer', phone: '+91 98111 22334' },
  ];

  for (const u of usersToSeed) {
    const exists = await pg.query<{ count: string }>('SELECT COUNT(*) as count FROM users WHERE email = $1', [u.email]);
    if (parseInt(exists.rows[0].count) === 0) {
      const passHash = await bcrypt.hash('pass123', 10);
      await pg.query(
        `INSERT INTO users (business_id, branch_id, name, email, phone, password_hash, role) VALUES (1, 1, $1, $2, $3, $4, $5)`,
        [u.name, u.email, u.phone, passHash, u.role]
      );
    }
  }

  console.log('PostgreSQL database engine & relational schemas verified.');
}

export async function logAuditEvent(params: {
  business_id?: number;
  user_id?: number | null;
  user_name?: string | null;
  user_role?: string | null;
  action: string;
  entity_type: string;
  entity_id?: number | null;
  details?: any;
  ip_address?: string;
}) {
  try {
    await pg.query(
      `INSERT INTO audit_logs (business_id, user_id, user_name, user_role, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        params.business_id || 1,
        params.user_id || null,
        params.user_name || 'System',
        params.user_role || 'system',
        params.action,
        params.entity_type,
        params.entity_id || null,
        JSON.stringify(params.details || {}),
        params.ip_address || '127.0.0.1'
      ]
    );
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

