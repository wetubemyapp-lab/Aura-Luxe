import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

const translations: Translations = {
  // Navigation
  website: { en: 'Website', hi: 'वेबसाइट' },
  services: { en: 'Services', hi: 'सेवाएं' },
  booking: { en: 'Book Now', hi: 'बुकिंग करें' },
  my_bookings: { en: 'My Bookings', hi: 'मेरी बुकिंग्स' },
  admin_portal: { en: 'Admin OS', hi: 'एडमिन ओएस' },
  customer_portal: { en: 'Customer Portal', hi: 'ग्राहक पोर्टल' },

  // Admin modules
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  business_website_mgmt: { en: 'Business Website Management', hi: 'वेबसाइट प्रबंधन' },
  staff: { en: 'Staff', hi: 'स्टाफ' },
  packages: { en: 'Packages', hi: 'पैकेजेस' },
  offers: { en: 'Offers', hi: 'ऑफर्स' },
  coupons: { en: 'Coupons', hi: 'कूपन' },
  gallery: { en: 'Gallery', hi: 'गैलरी' },
  videos: { en: 'Videos', hi: 'वीडियो' },
  reviews: { en: 'Reviews', hi: 'समीक्षाएं' },
  bookings: { en: 'Bookings', hi: 'बुकिंग्स' },
  settings: { en: 'Settings', hi: 'सेटिंग्स' },

  // Auth & Account
  sign_in: { en: 'Sign In', hi: 'साइन इन' },
  sign_up: { en: 'Sign Up', hi: 'साइन अप' },
  sign_out: { en: 'Sign Out', hi: 'साइन आउट' },
  role_customer: { en: 'Customer', hi: 'ग्राहक' },
  role_admin: { en: 'Admin / Owner', hi: 'मालिक / एडमिन' },
  quick_demo_login: { en: 'Demo Quick Access', hi: 'त्वरित डेमो एक्सेस' },

  // Buttons & Forms
  book_now: { en: 'Book Now', hi: 'अभी बुक करें' },
  submit: { en: 'Submit Details', hi: 'विवरण जमा करें' },
  save: { en: 'Save Details', hi: 'विवरण सुरक्षित करें' },
  select_outlet: { en: 'Select Outlet', hi: 'आउटलेट चुनें' },
  select_service: { en: 'Select Service', hi: 'सेवा चुनें' },
  select_staff: { en: 'Select Stylist', hi: 'स्टाइलिस्ट चुनें' },
  select_date_time: { en: 'Select Date & Time', hi: 'तारीख और समय चुनें' },
  full_name: { en: 'Full Name', hi: 'पूरा नाम' },
  phone_number: { en: 'Phone Number', hi: 'फ़ोन नंबर' },
  email_address: { en: 'Email Address', hi: 'ईमेल पता' },
  special_notes: { en: 'Special Instructions', hi: 'विशेष निर्देश' },

  // Form Validation & Errors
  name_required: { en: 'Full Name is required', hi: 'पूरा नाम देना अनिवार्य है' },
  phone_invalid: { en: 'Please enter a valid 10-digit phone number', hi: 'कृपया सही 10-अंकों का फ़ोन नंबर दर्ज करें' },
  email_required: { en: 'Email address is required', hi: 'ईमेल पता देना अनिवार्य है' },
  slot_required: { en: 'Please select an appointment time slot', hi: 'कृपया अपॉइंटमेंट के लिए समय चुनें' },
  validation_error: { en: 'Please fix the errors before proceeding', hi: 'कृपया आगे बढ़ने से पहले त्रुटियों को ठीक करें' },

  // System & Dynamic Fallbacks
  loading: { en: 'Loading...', hi: 'लोड हो रहा है...' },
  no_slots: { en: 'No available slots on this day. Please choose another date.', hi: 'इस दिन कोई समय उपलब्ध नहीं है। कृपया दूसरी तारीख चुनें।' },
  booking_success: { en: 'Your appointment has been successfully booked!', hi: 'आपका अपॉइंटमेंट सफलतापूर्वक बुक हो गया है!' },
  booking_failed: { en: 'Failed to book appointment. Please try again.', hi: 'अपॉइंटमेंट बुक करने में विफल। कृपया पुन: प्रयास करें।' },

  // Dashboard & Profile
  welcome_back: { en: 'Welcome back', hi: 'आपका स्वागत है' },
  upcoming_appointments: { en: 'Upcoming Appointments', hi: 'आगामी अपॉइंटमेंट्स' },
  past_history: { en: 'Booking History', hi: 'पिछला इतिहास' },
  no_bookings: { en: 'No active reservations found.', hi: 'कोई सक्रिय बुकिंग नहीं मिली।' },
  member_since: { en: 'Member since', hi: 'सदस्यता तिथि' },

  // Policies
  cancellation_policy: { en: 'Cancellation Policy', hi: 'रद्द करने की नीति' },
  terms_conditions: { en: 'Terms & Conditions', hi: 'नियम और शर्तें' },
  privacy_policy: { en: 'Privacy Policy', hi: 'गोपनीयता नीति' },

  // Offers Labels
  festive_special: { en: 'Festive Special Offer', hi: 'त्योहार विशेष ऑफर' },
  limited_time: { en: 'Limited Period Offer', hi: 'सीमित समय का ऑफर' },
  coupon_applied: { en: 'Coupon Applied Successfully', hi: 'कूपन सफलतापूर्वक लागू किया गया' },

  // Common UI
  about_us: { en: 'About Our Business', hi: 'हमारे बारे में' },
  opening_hours: { en: 'Opening Hours', hi: 'खुलने का समय' },
  contact_info: { en: 'Contact & Location', hi: 'संपर्क और पता' },
  book_appointment: { en: 'Schedule Appointment', hi: 'अपॉइंटमेंट बुक करें' },
  view_all_services: { en: 'Explore Services', hi: 'सभी सेवाएं देखें' },
  save_changes: { en: 'Save Changes', hi: 'बदलाव सहेजें' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  status: { en: 'Status', hi: 'स्थिति' },
  price: { en: 'Price', hi: 'मूल्य' },
  duration: { en: 'Duration', hi: 'अवधि' },
  mins: { en: 'mins', hi: 'मिनट' },
  confirmed: { en: 'Confirmed', hi: 'पुष्ट' },
  pending: { en: 'Pending', hi: 'लंबित' },
  completed: { en: 'Completed', hi: 'पूर्ण' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('preferred_language') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferred_language', lang);
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key].en;
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
