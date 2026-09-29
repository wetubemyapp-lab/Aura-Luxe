import React from 'react';
import { Home, Sparkles, Calendar, Clock, User, Shield } from 'lucide-react';
import { CustomerPageTab } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

export interface MobileBottomNavProps {
  currentTab: CustomerPageTab;
  onSelectTab: (tab: CustomerPageTab) => void;
  onOpenAuth: () => void;
  onSwitchToAdmin: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  onSwitchToAdmin,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-xl border-t border-[#EAE5DF] px-2 py-1.5 shadow-[0_-4px_20px_rgba(30,36,51,0.06)] pb-[calc(env(safe-area-inset-bottom)+6px)]"
    >
      <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => onSelectTab('website')}
          className={`flex flex-col items-center justify-center w-full py-1 gap-1 transition-colors ${
            currentTab === 'website' ? 'text-[#D66A78]' : 'text-[#566176] hover:text-[#1E2433]'
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === 'website' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-semibold tracking-tight">{t('website')}</span>
        </button>

        {/* 2. Services */}
        <button
          type="button"
          onClick={() => onSelectTab('services')}
          className={`flex flex-col items-center justify-center w-full py-1 gap-1 transition-colors ${
            currentTab === 'services' ? 'text-[#D66A78]' : 'text-[#566176] hover:text-[#1E2433]'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${currentTab === 'services' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-semibold tracking-tight">{t('services')}</span>
        </button>

        {/* 3. Book - Center Elevated CTA */}
        <button
          type="button"
          onClick={() => onSelectTab('booking')}
          className="flex flex-col items-center justify-center -mt-5 group"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              currentTab === 'booking'
                ? 'bg-[#D66A78] text-white ring-4 ring-[#D66A78]/30'
                : 'bg-[#1E2433] text-white hover:bg-[#D66A78]'
            }`}
          >
            <Calendar className="w-5 h-5" />
          </div>
          <span
            className={`text-[10px] font-bold mt-1 tracking-tight ${
              currentTab === 'booking' ? 'text-[#D66A78]' : 'text-[#1E2433]'
            }`}
          >
            {t('booking')}
          </span>
        </button>

        {/* 4. My Bookings */}
        <button
          type="button"
          onClick={() => onSelectTab('my-bookings')}
          className={`flex flex-col items-center justify-center w-full py-1 gap-1 transition-colors ${
            currentTab === 'my-bookings' ? 'text-[#D66A78]' : 'text-[#566176] hover:text-[#1E2433]'
          }`}
        >
          <Clock className={`w-5 h-5 ${currentTab === 'my-bookings' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-semibold tracking-tight">{t('my_bookings')}</span>
        </button>

        {/* 5. Profile / Sign In */}
        <button
          type="button"
          onClick={user ? (user.role === 'admin' ? onSwitchToAdmin : () => onSelectTab('my-bookings')) : onOpenAuth}
          className="flex flex-col items-center justify-center w-full py-1 gap-1 text-[#566176] hover:text-[#1E2433] transition-colors"
        >
          {user ? (
            user.role === 'admin' ? (
              <>
                <Shield className="w-5 h-5 text-[#C89B53]" />
                <span className="text-[10px] font-semibold tracking-tight text-[#C89B53]">Admin</span>
              </>
            ) : (
              <>
                <div className="w-5 h-5 rounded-full bg-[#D66A78] text-white flex items-center justify-center text-[10px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] font-semibold tracking-tight truncate max-w-[50px]">
                  {user.name.split(' ')[0]}
                </span>
              </>
            )
          ) : (
            <>
              <User className="w-5 h-5" />
              <span className="text-[10px] font-semibold tracking-tight">{t('sign_in')}</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
};
