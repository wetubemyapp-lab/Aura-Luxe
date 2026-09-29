import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { CustomerPageTab } from '../../types/index.ts';
import {
  Menu,
  X,
  Globe,
  Calendar,
  Sparkles,
  LayoutDashboard,
  LogOut,
  User,
  Shield,
  Clock,
  ChevronDown,
  Building2,
  Check
} from 'lucide-react';

interface HeaderProps {
  currentTab: CustomerPageTab;
  onSelectTab: (tab: CustomerPageTab) => void;
  onOpenAuth: () => void;
  onSwitchToAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  onSwitchToAdmin,
}) => {
  const { user, logout } = useAuth();
  const { businesses, activeBusiness, selectBusiness } = useBusiness();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const businessName = activeBusiness?.name || 'Aura Luxe Salon';
  const tagline = language === 'hi' ? (activeBusiness?.tagline_hi || activeBusiness?.tagline) : activeBusiness?.tagline;

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'glass-nav shadow-lg' : 'glass-nav-transparent'}`}>
      {/* Top Universal Engine Announcement & Tenant Switcher Bar */}
      <div className="bg-[#1E2433] text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Multi-Tenant Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
                className="flex items-center gap-1.5 text-[11px] text-[#D66A78] hover:text-white font-semibold tracking-wider uppercase py-0.5 px-2 rounded bg-white/5 hover:bg-white/10 transition-colors"
                title="Switch Business Category"
              >
                <Building2 className="w-3 h-3 text-[#C89B53]" />
                <span className="truncate max-w-[170px] sm:max-w-none">
                  {activeBusiness?.category?.replace('_', ' ') || 'Universal OS'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {tenantDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-[#1E2433] border border-slate-700/80 rounded-xl shadow-2xl py-1 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-700/80">
                    <p className="text-[10px] uppercase font-bold text-[#C89B53] tracking-wider">
                      Switch Universal Business Engine
                    </p>
                    <p className="text-[11px] text-slate-300">Choose business archetype</p>
                  </div>
                  {businesses.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        selectBusiness(b.id);
                        setTenantDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-200 hover:bg-white/10 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-white">{b.name}</p>
                        <p className="text-[10px] text-[#D66A78] capitalize">
                          {b.category.replace('_', ' ')}
                        </p>
                      </div>
                      {activeBusiness?.id === b.id && (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {activeBusiness?.opening_hours && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3 text-slate-400" />
                {activeBusiness.opening_hours}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-[11px] hover:text-[#FAF8F5] transition-all py-1 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-slate-700/50"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#D66A78] shrink-0" />
              <span className="font-semibold text-[10px] tracking-wider flex items-center">
                <span className={language === 'en' ? 'text-[#D66A78] font-bold' : 'text-slate-400 font-medium'}>EN</span>
                <span className="mx-1 text-slate-500">|</span>
                <span className={language === 'hi' ? 'text-[#D66A78] font-bold' : 'text-slate-400 font-medium'}>हिन्दी</span>
              </span>
            </button>

            {/* Quick Switch to Admin OS */}
            <button
              onClick={onSwitchToAdmin}
              className="flex items-center gap-1.5 text-[11px] text-[#D66A78] hover:text-white font-medium transition-colors"
            >
              <Shield className="w-3 h-3 text-[#C89B53]" />
              <span>{t('admin_portal')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand identity with logo-hover */}
        <div
          onClick={() => onSelectTab('website')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="logo-hover">
            {activeBusiness?.logo_url ? (
              <img
                src={activeBusiness.logo_url}
                alt={businessName}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#D66A78]/70 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#1E2433] text-white flex items-center justify-center font-serif text-lg font-bold border border-[#C89B53]/60 shadow-xs">
                OS
              </div>
            )}
          </div>
          <div>
            <span className="text-xl font-serif font-bold text-[#1E2433] tracking-tight group-hover:text-[#D66A78] transition-colors">
              {businessName}
            </span>
            {tagline && (
              <p className="text-[11px] text-[#566176] font-sans tracking-wide line-clamp-1">
                {tagline}
              </p>
            )}
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => onSelectTab('home')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'home' || currentTab === 'website'
                ? 'text-[#1E2433] bg-[#F7EFF1] border border-[#D66A78]/30 font-bold shadow-xs'
                : 'text-[#566176] hover:text-[#1E2433] hover:bg-black/5'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onSelectTab('about')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'about'
                ? 'text-[#1E2433] bg-[#F7EFF1] border border-[#D66A78]/30 font-bold shadow-xs'
                : 'text-[#566176] hover:text-[#1E2433] hover:bg-black/5'
            }`}
          >
            About
          </button>
          <button
            onClick={() => onSelectTab('services')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'services' || currentTab === 'service-detail'
                ? 'text-[#1E2433] bg-[#F7EFF1] border border-[#D66A78]/30 font-bold shadow-xs'
                : 'text-[#566176] hover:text-[#1E2433] hover:bg-black/5'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => onSelectTab('packages')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'packages' || currentTab === 'offers' || currentTab === 'coupons'
                ? 'text-[#1E2433] bg-[#F7EFF1] border border-[#D66A78]/30 font-bold shadow-xs'
                : 'text-[#566176] hover:text-[#1E2433] hover:bg-black/5'
            }`}
          >
            Packages & Offers
          </button>
          <button
            onClick={() => onSelectTab('team')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'team' || currentTab === 'team-detail'
                ? 'text-[#1E2433] bg-[#F7EFF1] border border-[#D66A78]/30 font-bold shadow-xs'
                : 'text-[#566176] hover:text-[#1E2433] hover:bg-black/5'
            }`}
          >
            Team
          </button>
          <button
            onClick={() => onSelectTab('gallery')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'gallery' || currentTab === 'videos' || currentTab === 'reviews'
                ? 'text-[#1E2433] bg-[#F7EFF1] border border-[#D66A78]/30 font-bold shadow-xs'
                : 'text-[#566176] hover:text-[#1E2433] hover:bg-black/5'
            }`}
          >
            Photos & Videos
          </button>
          <button
            onClick={() => onSelectTab('contact')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'contact' || currentTab === 'location' || currentTab === 'faq'
                ? 'text-[#1E2433] bg-[#F7EFF1] border border-[#D66A78]/30 font-bold shadow-xs'
                : 'text-[#566176] hover:text-[#1E2433] hover:bg-black/5'
            }`}
          >
            Contact & Help
          </button>

          {/* Optional Modules */}
          {activeBusiness?.allow_home_service && (
            <button
              onClick={() => onSelectTab('home-service')}
              className={`px-2.5 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all font-semibold ${
                currentTab === 'home-service' ? 'ring-1 ring-emerald-400' : ''
              }`}
            >
              Home Service
            </button>
          )}
        </nav>

        {/* User actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-white/80 border border-[#E2DBD0] hover:border-[#D66A78] text-[#1E2433] text-sm shadow-xs transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-[#D66A78] text-white flex items-center justify-center text-xs font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium max-w-[120px] truncate">{user.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-[#8491A5] font-semibold">
                  · {user.role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8491A5]" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl shadow-xl py-1 z-50">
                  <div className="px-4 py-2 border-b border-[#EAE5DF]">
                    <p className="text-xs text-[#8491A5] font-medium">Signed in as</p>
                    <p className="text-xs font-bold text-[#1E2433] truncate">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onSwitchToAdmin();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-[#1E2433] hover:bg-[#FAF8F5] flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#D66A78]" />
                      {t('admin_portal')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onSelectTab('my-bookings');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-[#1E2433] hover:bg-[#FAF8F5] flex items-center gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#D66A78]" />
                    {t('my_bookings')}
                  </button>
                  <div className="border-t border-[#EAE5DF] mt-1"></div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t('sign_out')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 py-2 px-4 rounded-lg bg-[#1E2433] hover:bg-[#2A3347] text-white text-xs font-medium tracking-wide shadow-xs transition-all hover:-translate-y-0.5"
            >
              <User className="w-3.5 h-3.5 text-[#D66A78]" />
              <span>{t('sign_in')}</span>
            </button>
          )}

          <button
            onClick={() => onSelectTab('booking')}
            className="btn-primary-accent py-2 px-4 rounded-lg text-xs font-semibold tracking-wide shadow-xs"
          >
            {t('book_appointment')}
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 rounded-lg border border-[#E2DBD0] text-[#1E2433] text-[10px] font-bold tracking-wider"
          >
            <span className={language === 'en' ? 'text-[#D66A78]' : 'text-slate-400'}>EN</span> | <span className={language === 'hi' ? 'text-[#D66A78]' : 'text-slate-400'}>हिन्दी</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#1E2433] hover:bg-black/5"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-nav border-b border-[#E2DBD0] px-4 pt-2 pb-6 space-y-2">
          {/* Mobile tenant switcher */}
          <div className="p-2 bg-white rounded-xl border border-[#E2DBD0]">
            <p className="text-[10px] uppercase font-bold text-[#8491A5] mb-1">Select Business Profile</p>
            <select
              value={activeBusiness?.id}
              onChange={(e) => selectBusiness(Number(e.target.value))}
              className="w-full p-2 bg-[#FAF8F5] border border-[#E2DBD0] rounded-lg text-xs font-semibold text-[#1E2433]"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.category})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              onSelectTab('website');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'website' ? 'bg-[#F7EFF1] text-[#1E2433] font-bold' : 'text-[#566176]'
            }`}
          >
            {t('website')}
          </button>
          <button
            onClick={() => {
              onSelectTab('services');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'services' ? 'bg-[#F7EFF1] text-[#1E2433] font-bold' : 'text-[#566176]'
            }`}
          >
            {t('services')}
          </button>
          <button
            onClick={() => {
              onSelectTab('booking');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'booking' ? 'bg-[#F7EFF1] text-[#1E2433] font-bold' : 'text-[#566176]'
            }`}
          >
            {t('booking')}
          </button>
          <button
            onClick={() => {
              onSelectTab('my-bookings');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'my-bookings' ? 'bg-[#F7EFF1] text-[#1E2433] font-bold' : 'text-[#566176]'
            }`}
          >
            {t('my_bookings')}
          </button>

          <div className="pt-2 border-t border-[#E2DBD0] space-y-2">
            <button
              onClick={() => {
                onSwitchToAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-lg bg-[#1E2433] text-white text-xs font-medium flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4 text-[#D66A78]" />
              {t('admin_portal')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
