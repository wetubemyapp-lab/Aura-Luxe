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
  booking: { en: 'Book Now', hi: 'बुकिंग' },
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
