-- Universal Business Platform OS Schema
-- PostgreSQL Implementation (PGlite Compatible)

-- Drop existing tables with CASCADE to ensure a clean state
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS booking_items CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS business_settings CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS ledger_entries CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS tax_rules CASCADE;
DROP TABLE IF EXISTS gallery CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS service_addons CASCADE;
DROP TABLE IF EXISTS settlements CASCADE;

-- Users (Centralized Identity)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'customer', -- 'admin', 'staff', 'customer'
    avatar_url TEXT,
    language TEXT DEFAULT 'en',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Businesses (Multi-tenant support)
CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT,
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
    primary_currency TEXT DEFAULT 'INR',
    theme_accent TEXT DEFAULT '#7c3aed',
    tax_rate NUMERIC(5,2) DEFAULT 0,
    platform_fee_pct NUMERIC(5,2) DEFAULT 0,
    platform_commission_pct NUMERIC(5,2) DEFAULT 0,
    slot_interval_mins INTEGER DEFAULT 30,
    buffer_time_mins INTEGER DEFAULT 0,
    deposit_required BOOLEAN DEFAULT FALSE,
    deposit_percentage INTEGER DEFAULT 0,
    advance_payment_percentage INTEGER DEFAULT 0,
    allow_home_service BOOLEAN DEFAULT TRUE,
    home_service_travel_fee NUMERIC(10,2) DEFAULT 0,
    cancel_policy_hours_threshold INTEGER DEFAULT 24,
    cancel_policy_full_refund_pct INTEGER DEFAULT 100,
    cancel_policy_late_refund_pct INTEGER DEFAULT 50,
    noshow_refund_pct INTEGER DEFAULT 0,
    features_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Legacy/Duplicate table used by some routes
CREATE TABLE IF NOT EXISTS business_settings (
    id SERIAL PRIMARY KEY,
    business_name TEXT NOT NULL,
    business_type TEXT,
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
    primary_currency TEXT DEFAULT 'INR',
    theme_accent TEXT DEFAULT '#7c3aed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Branches (Outlets)
CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE,
    address TEXT NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    opening_hours TEXT,
    holidays TEXT,
    business_category TEXT,
    logo_url TEXT,
    cover_image TEXT,
    theme_color TEXT,
    google_maps_url TEXT,
    cancellation_policy TEXT,
    advance_deposit_pct INTEGER DEFAULT 0,
    payment_settings JSONB DEFAULT '{}'::jsonb,
    home_service_settings JSONB DEFAULT '{}'::jsonb,
    booking_settings JSONB DEFAULT '{}'::jsonb,
    service_ids JSONB DEFAULT '[]'::jsonb,
    staff_ids JSONB DEFAULT '[]'::jsonb,
    is_main BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Staff
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    role_title TEXT,
    role_title_hi TEXT,
    bio TEXT,
    experience_years INTEGER,
    image_url TEXT,
    photo_url TEXT,
    specialties TEXT,
    commission_rate NUMERIC(5,2) DEFAULT 15,
    status TEXT DEFAULT 'active',
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Services
CREATE TABLE IF NOT EXISTS service_categories (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES service_categories(id),
    category TEXT, -- Alias for some routes
    title TEXT NOT NULL, -- Match services.ts route
    title_hi TEXT,
    slug TEXT NOT NULL,
    description TEXT,
    description_hi TEXT,
    duration_mins INTEGER NOT NULL DEFAULT 45,
    duration_minutes INTEGER, -- Alias
    price NUMERIC(10, 2) NOT NULL,
    discount_price NUMERIC(10, 2),
    travel_fee NUMERIC(10, 2) DEFAULT 0,
    tax_rule_id INTEGER,
    home_service_enabled BOOLEAN DEFAULT FALSE,
    buffer_mins INTEGER DEFAULT 10,
    buffer_minutes INTEGER, -- Alias
    image_url TEXT,
    video_url TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE, -- Alias
    popular BOOLEAN DEFAULT FALSE, -- Alias
    active BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE, -- Alias
    is_archived BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_addons (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    duration_mins INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_holds (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    outlet_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
    staff_id INTEGER REFERENCES staff(id),
    booking_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    duration_mins INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXPIRED', 'CONVERTED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    customer_id INTEGER REFERENCES users(id), -- Alias
    service_id INTEGER REFERENCES services(id),
    staff_id INTEGER REFERENCES staff(id),
    booking_number TEXT UNIQUE,
    booking_date DATE NOT NULL,
    booking_time TEXT,
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    visit_type TEXT,
    booking_mode TEXT DEFAULT 'in_store',
    home_service_address TEXT,
    travel_fee NUMERIC(10, 2) DEFAULT 0,
    duration_mins INTEGER DEFAULT 30,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'unpaid',
    payment_option TEXT DEFAULT 'pay_at_venue',
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    service_amount NUMERIC(10, 2) DEFAULT 0,
    addons_amount NUMERIC(10, 2) DEFAULT 0,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    tax_amount NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0, -- Alias
    discount NUMERIC(10, 2) DEFAULT 0,
    tax NUMERIC(10, 2) DEFAULT 0,
    fees NUMERIC(10, 2) DEFAULT 0,
    advance_amount_paid NUMERIC(10, 2) DEFAULT 0,
    amount_paid NUMERIC(10, 2) DEFAULT 0, -- Alias
    venue_balance_due NUMERIC(10, 2) DEFAULT 0,
    amount_due NUMERIC(10, 2) DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    addons_json JSONB DEFAULT '[]'::jsonb,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    customer_notes TEXT,
    internal_notes TEXT,
    coupon_code TEXT,
    notes TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by INTEGER REFERENCES users(id),
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_items (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    service_id INTEGER,
    service_name_snapshot TEXT,
    service_title TEXT, -- Alias
    duration_snapshot INTEGER,
    duration_mins INTEGER, -- Alias
    unit_price_snapshot NUMERIC(10, 2),
    price NUMERIC(10, 2), -- Alias
    quantity INTEGER DEFAULT 1,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(10, 2) DEFAULT 0,
    tax NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    business_id INTEGER,
    user_id INTEGER,
    user_name TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Packages
CREATE TABLE IF NOT EXISTS packages (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    services TEXT, -- JSON or comma-separated
    service_ids JSONB, -- Alias
    duration TEXT,
    price NUMERIC(10, 2),
    regular_price NUMERIC(10, 2),
    original_price NUMERIC(10, 2),
    package_price NUMERIC(10, 2),
    discount TEXT,
    validity TEXT,
    usage_rules TEXT,
    outlets TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Offers
CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_hi TEXT,
    subtitle TEXT,
    description TEXT,
    banner_image TEXT,
    festival_tag TEXT,
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    offer_type TEXT,
    discount_type TEXT,
    discount_value NUMERIC(10, 2),
    discount_pct NUMERIC(5, 2),
    coupon_code TEXT,
    code TEXT,
    included_services JSONB,
    included_package JSONB,
    outlets TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    discount_type TEXT,
    discount_value NUMERIC(10, 2),
    min_spend NUMERIC(10, 2) DEFAULT 0,
    max_discount_amount NUMERIC(10, 2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, code)
);

-- Gallery
CREATE TABLE IF NOT EXISTS gallery (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Photo',
    service TEXT,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Videos
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    title TEXT,
    comment TEXT,
    images JSONB,
    service_id INTEGER,
    staff_id INTEGER,
    booking_id INTEGER,
    owner_reply TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    is_reported BOOLEAN DEFAULT FALSE,
    report_reason TEXT,
    is_removed BOOLEAN DEFAULT FALSE,
    removal_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    booking_id INTEGER,
    event_type TEXT,
    channel TEXT,
    provider TEXT,
    recipient TEXT,
    title TEXT,
    message TEXT,
    status TEXT,
    template_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ledger
CREATE TABLE IF NOT EXISTS ledger_entries (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    entry_type TEXT, -- 'payment', 'tip', 'staff_commission', 'deposit'
    payment_method TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    platform_fee_amount NUMERIC(10, 2) DEFAULT 0,
    merchant_net_amount NUMERIC(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'completed',
    reference_no TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settlements (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    settlement_period_start DATE,
    settlement_period_end DATE,
    gross_amount NUMERIC(10, 2),
    platform_commission NUMERIC(10, 2),
    net_payout NUMERIC(10, 2),
    status TEXT DEFAULT 'pending',
    payout_method TEXT,
    reference_no TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE IF NOT EXISTS payment_transactions (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    idempotency_key TEXT UNIQUE,
    gateway TEXT,
    transaction_id TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT,
    raw_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refunds (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    user_id INTEGER,
    amount_paid NUMERIC(10, 2),
    refund_amount NUMERIC(10, 2),
    fee_deducted NUMERIC(10, 2),
    reason TEXT,
    policy_applied TEXT,
    status TEXT DEFAULT 'REFUND_PENDING',
    gateway_refund_id TEXT,
    gateway_response_json JSONB,
    cancelled_by_role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tax Rules
CREATE TABLE IF NOT EXISTS tax_rules (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    rate NUMERIC(5, 2) NOT NULL,
    tax_type TEXT,
    jurisdiction TEXT,
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
    effective_to TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data Seed
INSERT INTO users (name, email, phone, password_hash, role) 
VALUES ('System Admin', 'admin@example.com', '9999999999', '$2a$10$T8Vq7lO.mX8mXlJ8z0i1O.eLzV0p/y0z1v0z1v0z1v0z1v0z1v0z1', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO businesses (name, slug, category, tagline) 
VALUES ('Aura Luxe Salon', 'auraluxe', 'Salon & Spa', 'Elegance Redefined')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO business_settings (business_name, business_type, tagline)
SELECT 'Aura Luxe Salon', 'Salon & Spa', 'Elegance Redefined'
WHERE NOT EXISTS (SELECT 1 FROM business_settings WHERE business_name = 'Aura Luxe Salon');

INSERT INTO branches (business_id, name, slug, code, address, is_main)
VALUES (1, 'Main Branch', 'main-branch', 'MAIN01', '123 Luxury Ave, Mumbai', TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (business_id, name, slug)
VALUES (1, 'Hair Care', 'hair-care'), (1, 'Skin Care', 'skin-care');

INSERT INTO services (business_id, category, category_id, title, slug, price, duration_mins)
VALUES 
(1, 'Hair Care', 1, 'Luxury Haircut', 'haircut', 1500, 45),
(1, 'Hair Care', 1, 'Hair Coloring', 'hair-coloring', 3500, 120),
(1, 'Skin Care', 2, 'Gold Facial', 'gold-facial', 2500, 60);

INSERT INTO staff (business_id, branch_id, name, role_title)
VALUES 
(1, 1, 'John Doe', 'Senior Stylist'),
(1, 1, 'Jane Smith', 'Skin Specialist');
