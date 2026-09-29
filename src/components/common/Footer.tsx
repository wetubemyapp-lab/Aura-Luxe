import React from 'react';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { CustomerPageTab } from '../../types/index.ts';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Sparkles, Heart } from 'lucide-react';

export interface FooterProps {
  onSelectTab?: (tab: CustomerPageTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  const { activeBusiness, categoryConfig } = useBusiness();
  const { t, language } = useLanguage();

  const businessName = activeBusiness?.name || 'Aura Luxe Salon';
  const tagline = language === 'hi'
    ? (activeBusiness?.tagline_hi || activeBusiness?.tagline)
    : activeBusiness?.tagline;
  const address = activeBusiness?.address || '42, Royal Heritage Boulevard, Indiranagar';
  const phone = activeBusiness?.phone || '+91 98765 43210';
  const email = activeBusiness?.email || 'support@auraluxe.com';
  const openingHours = activeBusiness?.opening_hours || 'Mon - Sun: 09:30 AM - 09:30 PM';

  const handleNav = (tab: CustomerPageTab) => {
    if (onSelectTab) {
      onSelectTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#1E2433] text-slate-300 pt-16 pb-12 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="logo-hover">
                {activeBusiness?.logo_url ? (
                  <img
                    src={activeBusiness.logo_url}
                    alt={businessName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#D66A78]/70"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#D66A78] text-white flex items-center justify-center font-serif text-lg font-bold">
                    OS
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-white tracking-wide">
                  {businessName}
                </h3>
                <span className="text-xs text-[#C89B53] font-medium tracking-wider uppercase capitalize">
                  {categoryConfig.displayName}
                </span>
              </div>
            </div>

            {tagline && (
              <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-md leading-relaxed">
                {tagline}
              </p>
            )}

            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D66A78] shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C89B53] shrink-0" />
                <span>{email}</span>
              </div>
            </div>
          </div>

          {/* Column 1: Services & Offers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-serif border-b border-slate-800 pb-2">
              Explore Our Salon
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-white transition-colors">
                  Home Service
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-white transition-colors">
                  About Our Shop
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-white transition-colors">
                  Our Services
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('packages')} className="hover:text-white transition-colors">
                  Best Packages
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('offers')} className="hover:text-white transition-colors">
                  Special Offers
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('coupons')} className="hover:text-white transition-colors">
                  Vouchers & Coupons
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Team, Showcase & Modules */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-serif border-b border-slate-800 pb-2">
              Team & Photos
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => handleNav('team')} className="hover:text-white transition-colors">
                  Expert Stylists
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('gallery')} className="hover:text-white transition-colors">
                  Photo Gallery
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('videos')} className="hover:text-white transition-colors">
                  Transformation Videos
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('reviews')} className="hover:text-white transition-colors">
                  Customer Reviews
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('membership')} className="hover:text-white transition-colors text-[#C89B53]">
                  VIP Club
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('gift-cards')} className="hover:text-white transition-colors">
                  Gift Cards
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Support & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-serif border-b border-slate-800 pb-2">
              Support & Policies
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-white transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('location')} className="hover:text-white transition-colors">
                  Our Branches & Map
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faq')} className="hover:text-white transition-colors">
                  Questions & Answers (FAQ)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('terms')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('cancellation-policy')} className="hover:text-white transition-colors">
                  Cancellation & Refund Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {businessName}. All Rights Reserved.</p>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-mono text-[11px]">Universal Business OS v2.4</span>
            <span>·</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Operational Real-Time Locking
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
