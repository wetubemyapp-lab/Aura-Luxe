import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { BookingItem } from '../../types/index.ts';
import {
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Building2,
  Home,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Tag,
} from 'lucide-react';

interface MyBookingsPageProps {
  onOpenAuth: () => void;
  onNavigateToBooking: () => void;
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({
  onOpenAuth,
  onNavigateToBooking,
}) => {
  const { user, token, quickLogin } = useAuth();
  const { activeBusiness } = useBusiness();
  const { t, language } = useLanguage();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyBookings() {
      if (!user || !token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/bookings/my', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      } catch (err) {
        console.error('Failed to load my bookings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMyBookings();
  }, [user, token]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl p-8 border border-[#E2DBD0] shadow-lg space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#FAF0E6] text-[#E07A5F] flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-serif font-bold text-[#0F172A]">
              {language === 'hi' ? 'अपनी बुकिंग्स देखें' : 'View Your Appointments'}
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              {language === 'hi'
                ? 'अपनी सक्रिय और पिछली बुकिंग्स की जांच के लिए साइन इन करें'
                : 'Sign in to review confirmed appointment schedules, stylists, and history.'}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onOpenAuth}
              className="w-full py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md"
            >
              {t('sign_in')} / {t('sign_up')}
            </button>
            <button
              onClick={() => quickLogin('customer')}
              className="w-full py-2.5 bg-[#FAF0E6] hover:bg-[#E07A5F] text-[#0F172A] hover:text-white rounded-xl text-xs font-medium transition-all"
            >
              {language === 'hi' ? 'ग्राहक डेमो से तुरंत प्रवेश करें' : 'Demo Customer Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currency = activeBusiness?.primary_currency || '₹';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE5DF] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#D66A78]">
            {language === 'hi' ? 'ग्राहक खाता' : 'Customer Ledger'}
          </span>
          <h1 className="text-3xl font-serif font-bold text-[#1E2433] mt-1">
            {t('my_bookings')}
          </h1>
          <p className="text-xs text-[#566176] mt-1">
            {language === 'hi' ? `लॉग-इन: ${user.name}` : `Signed in as: ${user.name} (${user.email})`}
          </p>
        </div>

        <button
          onClick={onNavigateToBooking}
          className="btn-primary-accent px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide shadow-xs self-start sm:self-auto"
        >
          + {t('book_appointment')}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-stone-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl border border-[#EAE5DF] space-y-4">
          <Calendar className="w-12 h-12 text-[#8491A5] mx-auto" />
          <h3 className="text-lg font-serif font-semibold text-[#1E2433]">
            {language === 'hi' ? 'कोई सक्रिय बुकिंग नहीं मिली' : 'No Bookings Found'}
          </h3>
          <p className="text-xs text-[#566176] max-w-sm mx-auto">
            {language === 'hi'
              ? 'आपने अभी तक कोई अपॉइंटमेंट बुक नहीं किया है। अपनी पहली सेवा अभी बुक करें!'
              : 'You do not have any past or upcoming appointments yet.'}
          </p>
          <button
            onClick={onNavigateToBooking}
            className="px-6 py-2.5 bg-[#1E2433] hover:bg-[#D66A78] text-white rounded-xl text-xs font-medium transition-all"
          >
            {t('book_appointment')}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map((booking) => {
            const serviceTitles = booking.service_titles && booking.service_titles.length > 0
              ? booking.service_titles
              : [booking.service_title || 'Service Appointment'];

            return (
              <div
                key={booking.id}
                className="glass-card rounded-3xl p-6 border border-[#EAE5DF] hover-lift flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold font-mono text-[#8491A5]">#{booking.id}</span>
                    <span aria-hidden="true" className="text-[#8491A5]">·</span>
                    <span
                      className={`text-xs font-semibold capitalize ${
                        booking.status === 'confirmed'
                          ? 'text-emerald-700'
                          : booking.status === 'in_service'
                          ? 'text-blue-700'
                          : booking.status === 'completed'
                          ? 'text-purple-700'
                          : booking.status === 'cancelled'
                          ? 'text-rose-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {booking.status.replace('_', ' ')}
                    </span>
                    <span aria-hidden="true" className="text-[#8491A5]">·</span>
                    <span className="text-xs text-[#566176] flex items-center gap-1">
                      {booking.booking_mode === 'home_service' ? (
                        <>
                          <Home className="w-3.5 h-3.5 text-[#D66A78]" />
                          Home Service
                        </>
                      ) : (
                        <>
                          <Building2 className="w-3.5 h-3.5 text-[#C89B53]" />
                          {booking.branch_name || 'Studio'}
                        </>
                      )}
                    </span>
                  </div>

                  {/* Multi-Service Titles */}
                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#1E2433] leading-snug">
                      {serviceTitles.join(' + ')}
                    </h3>
                    {booking.home_service_address && (
                      <p className="text-xs text-stone-500 mt-1 flex items-start gap-1">
                        <Home className="w-3.5 h-3.5 text-[#E07A5F] flex-shrink-0 mt-0.5" />
                        <span>Address: {booking.home_service_address}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#E07A5F]" />
                      {booking.booking_date?.toString().slice(0, 10)}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#E07A5F]" />
                      {booking.booking_time} ({booking.duration_mins} mins)
                    </span>
                    {booking.staff_name && (
                      <span className="text-slate-700 font-medium">
                        Specialist: {booking.staff_name}
                      </span>
                    )}
                  </div>

                  {booking.notes && (
                    <p className="text-xs text-slate-500 italic bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      "{booking.notes}"
                    </p>
                  )}
                </div>

                {/* Right Column: Payment & WhatsApp Action */}
                <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-stone-100 gap-3 min-w-[200px]">
                  <div className="space-y-0.5 md:text-right">
                    <span className="text-xs text-stone-400 block font-mono">Total Order</span>
                    <span className="text-xl font-serif font-bold text-[#0F172A] block font-mono">
                      {currency}{parseFloat(String(booking.total_amount)).toFixed(2)}
                    </span>

                    {parseFloat(String(booking.venue_balance_due || '0')) > 0 ? (
                      <div className="text-[11px] font-mono text-amber-700 font-medium">
                        Balance Due at Venue: {currency}{parseFloat(String(booking.venue_balance_due)).toFixed(2)}
                      </div>
                    ) : (
                      <div className="text-[11px] font-mono text-emerald-700 font-medium">
                        Fully Paid Online
                      </div>
                    )}
                  </div>

                  {booking.whatsapp_url && (
                    <a
                      href={booking.whatsapp_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Receipt</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
