import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { User, Phone, Mail, Shield, Clock, Calendar, LogOut, CheckCircle } from 'lucide-react';
import { Button, Badge } from '../../components/ui/index.ts';

export interface UserProfilePageProps {
  onNavigateToBookings: () => void;
  onNavigateToBooking: () => void;
  onOpenAuth: () => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  onNavigateToBookings,
  onNavigateToBooking,
  onOpenAuth,
}) => {
  const { user, logout } = useAuth();
  const { language } = useLanguage();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-[#1E2433]">Account Sign-In</h2>
        <p className="text-xs text-[#566176]">
          Sign in to view your verified booking history, download invoice receipts, and enjoy 1-tap appointments.
        </p>
        <Button variant="primary" onClick={onOpenAuth}>
          Sign In / Create Account
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fade-in">
      <div className="glass-card rounded-3xl p-8 border border-[#EAE5DF] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE5DF] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#D66A78] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-2xl text-[#1E2433]">{user.name}</h1>
                <Badge variant={user.role === 'admin' ? 'gold' : 'accent'} size="xs">
                  {user.role.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-[#8491A5]">Verified Client Account</p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={logout} leftIcon={<LogOut className="w-4 h-4" />}>
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-[#EAE5DF] space-y-1">
            <span className="text-[10px] text-[#8491A5] uppercase font-bold flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-[#D66A78]" /> Email Address
            </span>
            <span className="font-semibold text-[#1E2433] block">{user.email}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#EAE5DF] space-y-1">
            <span className="text-[10px] text-[#8491A5] uppercase font-bold flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Phone
            </span>
            <span className="font-semibold text-[#1E2433] block">{user.phone || 'Not configured'}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-[#EAE5DF] flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button variant="primary" onClick={onNavigateToBooking} leftIcon={<Calendar className="w-4 h-4" />}>
            Book New Ritual
          </Button>
          <Button variant="outline" onClick={onNavigateToBookings} leftIcon={<Clock className="w-4 h-4" />}>
            View My Appointment History
          </Button>
        </div>
      </div>
    </div>
  );
};
