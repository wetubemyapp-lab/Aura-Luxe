export type UserRole = 'customer' | 'owner' | 'admin' | 'branch_manager' | 'staff' | 'receptionist';
export type PlatformRole = UserRole;

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  business_id?: number;
  branch_id?: number;
}

export interface BranchPaymentSettings {
  acceptCash?: boolean;
  acceptCard?: boolean;
  acceptUpi?: boolean;
  upiId?: string;
  qrCodeUrl?: string;
}

export interface BranchHomeServiceSettings {
  allowed?: boolean;
  radiusKm?: number;
  extraFee?: number;
}

export interface BranchBookingSettings {
  slotDurationMins?: number;
  maxAdvanceDays?: number;
  bufferTimeMins?: number;
  parallelChairs?: number;
}

export interface Branch {
  id: number;
  business_id: number;
  name: string;
  slug?: string;
  code: string;
  address: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  opening_hours?: string;
  holidays?: string;
  business_category?: string;
  logo_url?: string;
  cover_image?: string;
  theme_color?: string;
  google_maps_url?: string;
  cancellation_policy?: string;
  advance_deposit_pct?: number;
  payment_settings?: BranchPaymentSettings;
  home_service_settings?: BranchHomeServiceSettings;
  booking_settings?: BranchBookingSettings;
  service_ids?: number[];
  staff_ids?: number[];
  is_main: boolean;
  is_active: boolean;
  is_archived?: boolean;
  created_at?: string;
}

export interface BusinessFeaturesConfig {
  allowAddons?: boolean;
  requireDeposit?: boolean;
  showStaffSelection?: boolean;
  enableCoupons?: boolean;
  enablePackages?: boolean;
  genderPreference?: boolean;
  walkInQueue?: boolean;
  designUpload?: boolean;
  consentWaiver?: boolean;
  ageVerification?: boolean;
  medicalContraindications?: boolean;
  skinHairAnalysis?: boolean;
  consultationFirst?: boolean;
}

export interface BusinessCategoryConfig {
  id: string;
  displayName: string;
  displayNameHi: string;
  taglineDefault: string;
  taglineDefaultHi: string;
  specialistTerm: string;
  specialistTermPlural: string;
  specialistTermHi: string;
  bookingTerm: string;
  bookingTermHi: string;
  venueTerm: string;
  defaultCategories: string[];
  visitTypes: {
    inStore: boolean;
    homeService: boolean;
    virtualConsult: boolean;
    vipSuite: boolean;
  };
  formFields: {
    hairLength?: boolean;
    skinType?: boolean;
    designUpload?: boolean;
    bodyPlacement?: boolean;
    medicalContraindications?: boolean;
    genderPreference?: boolean;
    ageVerificationRequired?: boolean;
    consentWaiverRequired?: boolean;
    consultationRequired?: boolean;
  };
  resourceRequirement: {
    type: 'chair' | 'room' | 'table' | 'bed' | 'station';
    label: string;
    hasWaterSupply?: boolean;
    sterilizationMandatory?: boolean;
  };
  defaultDepositPct: number;
  defaultSlotMins: number;
  defaultBufferMins: number;
}

export interface Business {
  id: number;
  slug: string;
  name: string;
  category: string;
  tagline?: string;
  tagline_hi?: string;
  phone?: string;
  email?: string;
  address?: string;
  opening_hours?: string;
  about_text?: string;
  about_text_hi?: string;
  banner_url?: string;
  logo_url?: string;
  primary_currency: string;
  theme_accent: string;
  tax_rate: number | string;
  slot_interval_mins: number;
  buffer_time_mins: number;
  deposit_required: boolean;
  deposit_percentage: number | string;
  advance_payment_percentage?: number | string;
  allow_home_service?: boolean;
  home_service_travel_fee?: number | string;
  platform_commission_pct?: number | string;
  whatsapp_number?: string;
  features_config?: BusinessFeaturesConfig;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceItem {
  id: number;
  business_id?: number;
  title: string;
  title_hi?: string;
  category: string;
  description?: string;
  description_hi?: string;
  price: string | number;
  duration_mins: number;
  buffer_mins?: number;
  image_url?: string;
  is_active: boolean;
  is_archived?: boolean;
}

export type Service = ServiceItem;
export type StaffMember = StaffItem;

export interface ServiceAddon {
  id: number;
  business_id: number;
  service_id: number;
  title: string;
  title_hi?: string;
  price: string | number;
  duration_mins: number;
}

export interface StaffItem {
  id: number;
  business_id?: number;
  branch_id?: number;
  name: string;
  role_title: string;
  role_title_hi?: string;
  bio?: string;
  image_url?: string;
  specialties?: string;
  commission_rate: string | number;
  is_active: boolean;
  is_archived?: boolean;
}

export interface PackageItem {
  id: number;
  business_id?: number;
  name: string;
  description?: string;
  price: string | number;
  original_price?: string | number;
  service_ids?: string;
  is_active: boolean;
  is_archived?: boolean;
}

export interface OfferItem {
  id: number;
  business_id?: number;
  title: string;
  title_hi?: string;
  subtitle?: string;
  description?: string;
  banner_image?: string;
  festival_tag?: string;
  start_at?: string;
  end_at?: string;
  offer_type?: string;
  discount_type?: string;
  discount_value?: number | string;
  coupon_code?: string;
  included_services?: string;
  included_package?: string;
  outlets?: string;
  discount_pct?: number;
  code?: string;
  valid_until?: string;
  is_featured?: boolean;
  is_active: boolean;
  is_archived?: boolean;
}

export interface CouponItem {
  id: number;
  business_id?: number;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: string | number;
  min_spend: string | number;
  is_active: boolean;
  is_archived?: boolean;
}

export interface GalleryItem {
  id: number;
  business_id?: number;
  title: string;
  category: string;
  image_url: string;
  description?: string;
  sort_order?: number;
  is_featured?: boolean;
  is_active?: boolean;
  is_archived?: boolean;
}

export interface VideoItem {
  id: number;
  business_id?: number;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  is_featured?: boolean;
  sort_order?: number;
  is_active?: boolean;
  is_archived?: boolean;
  created_at?: string;
}

export interface ReviewItem {
  id: number;
  business_id?: number;
  user_name: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string;
  service_id?: number;
  staff_id?: number;
  booking_id?: number;
  owner_reply?: string;
  is_hidden?: boolean;
  is_reported?: boolean;
  report_reason?: string;
  is_removed?: boolean;
  removal_reason?: string;
  is_verified: boolean;
  created_at?: string;
  service_title?: string;
  staff_name?: string;
}

export interface BookingSubItem {
  id: number;
  booking_id: number;
  service_id: number;
  service_title: string;
  price: string | number;
  duration_mins: number;
}

export interface BookingItem {
  id: number;
  business_id?: number;
  branch_id?: number;
  branch_name?: string;
  branch_address?: string;
  user_id: number;
  service_id: number;
  staff_id?: number;
  booking_mode?: 'online' | 'home_service' | 'walk_in';
  home_service_address?: string;
  travel_fee?: string | number;
  booking_date: string;
  booking_time: string;
  duration_mins: number;
  status: string;
  payment_status: string;
  payment_option: 'full_online' | 'advance_online' | 'pay_at_venue';
  service_amount: string | number;
  addons_amount: string | number;
  discount_amount: string | number;
  tax_amount: string | number;
  advance_amount_paid?: string | number;
  venue_balance_due?: string | number;
  total_amount: string | number;
  addons_json?: string;
  coupon_code?: string;
  notes?: string;
  service_title?: string;
  service_price?: string | number;
  service_image?: string;
  staff_name?: string;
  business_name?: string;
  primary_currency?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  checked_in_at?: string;
  checked_in_by?: string;
  googleMapsUrl?: string;
  items?: BookingSubItem[];
  service_titles?: string[];
  whatsapp_url?: string;
  is_archived?: boolean;
  created_at?: string;
}

export interface LedgerEntry {
  id: number;
  business_id: number;
  booking_id?: number;
  entry_type: 'payment' | 'deposit' | 'refund' | 'staff_commission' | 'platform_fee' | 'tip';
  payment_method: 'cash' | 'card' | 'upi' | 'online' | 'wallet';
  amount: string | number;
  platform_fee_amount?: string | number;
  merchant_net_amount?: string | number;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  reference_no?: string;
  notes?: string;
  created_at: string;
  customer_name?: string;
  service_title?: string;
  booking_date?: string;
  booking_time?: string;
}

export interface SettlementItem {
  id: number;
  business_id: number;
  settlement_period_start: string;
  settlement_period_end: string;
  gross_amount: string | number;
  platform_commission: string | number;
  net_payout: string | number;
  status: 'pending' | 'processing' | 'settled' | 'on_hold';
  payout_method: string;
  reference_no?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
}

export interface AuditLogItem {
  id: number;
  business_id: number;
  user_id?: number;
  user_name?: string;
  user_role?: string;
  action: string;
  entity_type: string;
  entity_id?: number;
  details?: any;
  ip_address?: string;
  created_at: string;
}

export type CustomerPageTab =
  | 'home'
  | 'about'
  | 'services'
  | 'service-detail'
  | 'packages'
  | 'offers'
  | 'coupons'
  | 'team'
  | 'team-detail'
  | 'gallery'
  | 'videos'
  | 'reviews'
  | 'contact'
  | 'location'
  | 'faq'
  | 'book'
  | 'my-bookings'
  | 'profile'
  | 'privacy'
  | 'terms'
  | 'cancellation-policy'
  | 'blog'
  | 'membership'
  | 'gift-cards'
  | 'bridal'
  | 'home-service'
  | 'corporate'
  // Legacy aliases
  | 'website'
  | 'booking';

export type Permission =
  | 'booking.read' | 'booking.create' | 'booking.update' | 'booking.cancel'
  | 'payment.read' | 'refund.create'
  | 'staff.read' | 'staff.manage'
  | 'service.manage'
  | 'offer.manage' | 'coupon.manage'
  | 'review.manage'
  | 'analytics.read'
  | 'website.manage';

export type AdminPageTab =
  | 'dashboard'
  | 'calendar'
  | 'bookings'
  | 'customers'
  | 'services'
  | 'packages'
  | 'staff'
  | 'offers'
  | 'coupons'
  | 'gallery'
  | 'videos'
  | 'reviews'
  | 'payments'
  | 'reports'
  | 'website'
  | 'ai-copilot'
  | 'notifications'
  | 'audit-logs'
  | 'settings'
  | 'website-mgmt';
