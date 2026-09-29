import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useBusiness } from '../context/BusinessContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { AdminPageTab, UserRole } from '../types/index.ts';
import {
  LayoutDashboard,
  Globe,
  Scissors,
  Users,
  Package,
  Sparkles,
  Ticket,
  Image,
  Video,
  Star,
  CalendarCheck,
  Receipt,
  Settings,
  ShieldAlert,
  ArrowLeft,
  LogOut,
  Database,
  ExternalLink,
  Menu,
  X,
  Building2,
  ChevronDown,
  Check,
  ShieldCheck,
  Bot,
  Activity,
  MessageSquare,
  Bell,
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: AdminPageTab;
  onSelectTab: (tab: AdminPageTab) => void;
  onSwitchToCustomer: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onSwitchToCustomer,
  children,
}) => {
  const { user, logout, quickLogin, isLoading } = useAuth();
  const { businesses, activeBusiness, selectBusiness } = useBusiness();
  const { language, setLanguage, t } = useLanguage();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);

  const isStaffOrAdmin =
    user && ['owner', 'admin', 'branch_manager', 'receptionist', 'staff'].includes(user.role);

  // Protected Role Enforcement
  if (!isLoading && !isStaffOrAdmin) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1E293B] border border-slate-700 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase font-bold text-[#E07A5F] tracking-widest">
              Access Restricted
            </span>
            <h2 className="text-2xl font-serif font-bold text-white mt-1">
              Admin & Business OS Only
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This operating system is restricted to authenticated business owners, managers, receptionists, and staff.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Select Demo Role to Enter
            </p>

            <button
              onClick={() => quickLogin('owner')}
              className="w-full py-2.5 bg-[#E07A5F] hover:bg-[#D47055] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Login as Business Owner</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickLogin('branch_manager')}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-all"
              >
                Branch Manager
              </button>
              <button
                onClick={() => quickLogin('receptionist')}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-all"
              >
                Receptionist Desk
              </button>
            </div>

            <button
              onClick={onSwitchToCustomer}
              className="w-full py-2 bg-transparent hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 mt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Customer Website</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems: { id: AdminPageTab; labelEn: string; labelHi: string; icon: any }[] = [
    { id: 'dashboard', labelEn: 'Dashboard', labelHi: 'डैशबोर्ड', icon: LayoutDashboard },
    { id: 'calendar', labelEn: 'Calendar', labelHi: 'कैलेंडर', icon: CalendarCheck },
    { id: 'bookings', labelEn: 'Bookings', labelHi: 'बुकिंग्स', icon: CalendarCheck },
    { id: 'customers', labelEn: 'Customers', labelHi: 'ग्राहक', icon: Users },
    { id: 'services', labelEn: 'Services', labelHi: 'सेवाएं', icon: Scissors },
    { id: 'packages', labelEn: 'Packages', labelHi: 'पैकेजेस', icon: Package },
    { id: 'staff', labelEn: 'Staff', labelHi: 'स्टाफ', icon: Users },
    { id: 'offers', labelEn: 'Offers', labelHi: 'ऑफर्स', icon: Sparkles },
    { id: 'coupons', labelEn: 'Coupons', labelHi: 'कूपन', icon: Ticket },
    { id: 'gallery', labelEn: 'Gallery', labelHi: 'गैलरी', icon: Image },
    { id: 'videos', labelEn: 'Videos', labelHi: 'वीडियो', icon: Video },
    { id: 'reviews', labelEn: 'Reviews', labelHi: 'समीक्षाएं', icon: Star },
    { id: 'payments', labelEn: 'Payments', labelHi: 'भुगतान', icon: Receipt },
    { id: 'reports', labelEn: 'Reports', labelHi: 'रिपोर्ट्स', icon: Activity },
    { id: 'website', labelEn: 'Website', labelHi: 'वेबसाइट', icon: Globe },
    { id: 'ai-copilot', labelEn: 'AI Business Co-Pilot', labelHi: 'एआई को-पायलट', icon: Bot },
    { id: 'notifications', labelEn: 'Notifications & WhatsApp', labelHi: 'सूचनाएं और व्हाट्सएप', icon: Bell },
    { id: 'audit-logs', labelEn: 'Audit & Governance', labelHi: 'ऑडिट लॉग', icon: ShieldCheck },
    { id: 'settings', labelEn: 'Platform Settings', labelHi: 'सेटिंग्स', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E2433] flex flex-col">
      {/* Admin Topbar */}
      <header className="sticky top-0 z-40 bg-[#1E2433] text-white border-b border-slate-800/80 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-[#FAF8F5]">
              Aura Luxe OS
            </span>
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#D66A78]/20 text-[#D66A78] border border-[#D66A78]/40 font-mono">
              Enterprise Multi-Outlet
            </span>
          </div>

          {/* Tenant Switcher */}
          <div className="relative ml-2 sm:ml-4">
            <button
              onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-xs text-slate-200 border border-slate-700 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-[#C89B53]" />
              <span className="font-semibold max-w-[140px] truncate">
                {activeBusiness?.name || 'Active Business'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {tenantDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-[#1E2433] border border-slate-700/90 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] uppercase font-bold text-[#C89B53] tracking-wider">
                  Switch Business Tenant
                </div>
                {businesses.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      selectBusiness(b.id);
                      setTenantDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors text-slate-200"
                  >
                    <div className="truncate">
                      <p className="font-medium text-white truncate">{b.name}</p>
                      <p className="text-[10px] text-[#D66A78] capitalize">{b.category.replace('_', ' ')}</p>
                    </div>
                    {activeBusiness?.id === b.id && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Top Actions */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-mono text-xs border border-slate-700"
          >
            {language === 'en' ? 'हिन्दी' : 'English'}
          </button>

          {/* Customer Portal Link */}
          <button
            onClick={onSwitchToCustomer}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <span>Customer View</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D66A78]" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <span className="font-semibold block text-white text-xs">{user?.name}</span>
              <span className="text-[10px] text-[#8491A5] uppercase font-mono">{user?.role?.replace('_', ' ')}</span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-[#1E2433] border-r border-slate-800/80 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#C89B53] px-3 py-2">
            Operations & Platform
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#D66A78] text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{language === 'hi' ? item.labelHi : item.labelEn}</span>
              </button>
            );
          })}
        </aside>

        {/* Mobile Slide-out Menu */}
        {mobileSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div
              className="w-64 h-full bg-[#1E2433] text-white p-4 space-y-1 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
                <span className="font-serif font-bold text-sm">Navigation</span>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#D66A78] text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{language === 'hi' ? item.labelHi : item.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Content Panel */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
