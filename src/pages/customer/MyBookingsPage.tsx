import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { BookingItem, ServiceItem, PackageItem } from '../../types/index.ts';
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
  User,
  Heart,
  Bookmark,
  RotateCcw,
  XCircle,
  ChevronRight,
  Phone,
  Mail,
  Award,
} from 'lucide-react';
import rosegoldGlassImg from '../../assets/images/rosegold_glassmorphism_1790693115303.jpg';

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
  const [savedServices, setSavedServices] = useState<ServiceItem[]>([]);
  const [favoritePackages, setFavoritePackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'saved' | 'profile'>('upcoming');

  // Modals state
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<BookingItem | null>(null);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState<BookingItem | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState<string>('');
  const [newRescheduleTime, setNewRescheduleTime] = useState<string>('11:00 AM');
  const [rescheduleMessage, setRescheduleMessage] = useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);

  const fetchMyBookings = async () => {
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

      // Fetch catalog for saved services/packages
      const [sRes, pRes] = await Promise.all([
        fetch('/api/services?businessId=1'),
        fetch('/api/services/packages?businessId=1'),
      ]);
      if (sRes.ok) {
        const sd = await sRes.json();
        setSavedServices((sd.services || []).slice(0, 3));
      }
      if (pRes.ok) {
        const pd = await pRes.json();
        setFavoritePackages((pd.packages || []).slice(0, 2));
      }
    } catch (err) {
      console.error('Failed to load user dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, [user, token]);

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (res.ok) {
        await fetchMyBookings();
      }
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReschedule || !newRescheduleDate || !newRescheduleTime) return;

    setIsRescheduling(true);
    setRescheduleMessage(null);

    try {
      const res = await fetch(`/api/bookings/${selectedBookingForReschedule.id}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          new_date: newRescheduleDate,
          new_time: newRescheduleTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRescheduleMessage(data.error || 'Rescheduling failed');
      } else {
        setRescheduleMessage(data.message || 'Successfully rescheduled!');
        setTimeout(() => {
          setSelectedBookingForReschedule(null);
          setRescheduleMessage(null);
          fetchMyBookings();
        }, 1500);
      }
    } catch (err) {
      setRescheduleMessage('Network error while rescheduling');
    } finally {
      setIsRescheduling(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="glass-card rounded-3xl p-8 border border-[#E2DBD0] shadow-2xl space-y-6 bg-white/80 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-full bg-[#FAF0E6] text-[#E07A5F] flex items-center justify-center mx-auto shadow-inner">
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

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending' || b.status === 'in_service'
  );
  const historyBookings = bookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled' || b.status === 'no_show'
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Section 6: Abstract Rose-Gold Glassmorphism Hero Banner */}
      <div className="relative h-56 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border border-[#EAE5DF]">
        <img
          src={rosegoldGlassImg}
          alt="Rose-Gold Glassmorphism Dashboard"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-rose-200 text-xs font-bold uppercase tracking-wider border border-white/30">
                <Sparkles className="w-3.5 h-3.5 text-rose-300" />
                <span>VIP Member Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold">
                Welcome back, {user.name}
              </h1>
              <p className="text-xs sm:text-sm text-stone-200">
                Manage your salon bookings, upcoming schedules, and personalized membership benefits.
              </p>
            </div>

            <button
              onClick={onNavigateToBooking}
              className="px-6 py-3 bg-white text-stone-900 hover:bg-stone-100 font-semibold rounded-2xl text-xs shadow-xl transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span>Book Service</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#EAE5DF] overflow-x-auto gap-2">
        {[
          { id: 'upcoming', label: `Upcoming (${upcomingBookings.length})`, icon: Calendar },
          { id: 'history', label: `Booking History (${historyBookings.length})`, icon: Clock },
          { id: 'saved', label: 'Saved Services & Packages', icon: Heart },
          { id: 'profile', label: 'Profile Information', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-serif text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'border-rose-600 text-rose-900 bg-rose-50/50 rounded-t-xl'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 bg-stone-200/50 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'upcoming' ? (
        /* UPCOMING APPOINTMENTS */
        upcomingBookings.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border border-[#EAE5DF] space-y-4 bg-white/70 backdrop-blur-md">
            <Calendar className="w-12 h-12 text-[#8491A5] mx-auto" />
            <h3 className="text-lg font-serif font-semibold text-[#1E2433]">
              No Upcoming Appointments
            </h3>
            <p className="text-xs text-[#566176] max-w-sm mx-auto">
              You do not have any active appointments scheduled at the moment.
            </p>
            <button
              onClick={onNavigateToBooking}
              className="px-6 py-2.5 bg-[#1E2433] hover:bg-rose-700 text-white rounded-xl text-xs font-medium transition-all shadow-md"
            >
              Book an Appointment Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {upcomingBookings.map((booking) => {
              const serviceTitles = booking.service_titles && booking.service_titles.length > 0
                ? booking.service_titles
                : [booking.service_title || 'Service Appointment'];

              return (
                <div
                  key={booking.id}
                  className="glass-card rounded-3xl p-6 sm:p-8 border border-[#EAE5DF] shadow-xl hover:shadow-2xl transition-all bg-white/80 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold font-mono text-[#8491A5]">#{booking.id}</span>
                      <span aria-hidden="true" className="text-[#8491A5]">·</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          booking.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : booking.status === 'in_service'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {booking.status.replace('_', ' ')}
                      </span>
                      <span aria-hidden="true" className="text-[#8491A5]">·</span>
                      <span className="text-xs text-[#566176] flex items-center gap-1">
                        {booking.booking_mode === 'home_service' ? (
                          <>
                            <Home className="w-3.5 h-3.5 text-rose-600" />
                            Home Service
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3.5 h-3.5 text-amber-600" />
                            {booking.branch_name || 'Studio Sanctuary'}
                          </>
                        )}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#1E2433] leading-snug">
                        {serviceTitles.join(' + ')}
                      </h3>
                      {booking.home_service_address && (
                        <p className="text-xs text-stone-500 mt-1 flex items-start gap-1">
                          <Home className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span>Address: {booking.home_service_address}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 pt-1">
                      <span className="flex items-center gap-1 font-medium bg-stone-100 px-3 py-1 rounded-xl">
                        <Calendar className="w-3.5 h-3.5 text-rose-600" />
                        {booking.booking_date?.toString().slice(0, 10)}
                      </span>
                      <span className="flex items-center gap-1 font-medium bg-stone-100 px-3 py-1 rounded-xl">
                        <Clock className="w-3.5 h-3.5 text-rose-600" />
                        {booking.booking_time} ({booking.duration_mins} mins)
                      </span>
                      {booking.staff_name && (
                        <span className="text-stone-800 font-medium bg-stone-100 px-3 py-1 rounded-xl">
                          Specialist: {booking.staff_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions: Reschedule, Cancel, View Details */}
                  <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-stone-200 gap-3 min-w-[220px]">
                    <div className="space-y-0.5 md:text-right">
                      <span className="text-xs text-stone-400 block font-mono">Total Order</span>
                      <span className="text-xl font-serif font-bold text-[#1E2433] block font-mono">
                        {currency}{parseFloat(String(booking.total_amount)).toFixed(2)}
                      </span>
                      {parseFloat(String(booking.venue_balance_due || '0')) > 0 ? (
                        <span className="text-[11px] font-mono text-amber-700 block font-medium">
                          Due at Venue: {currency}{parseFloat(String(booking.venue_balance_due)).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-emerald-700 block font-medium">
                          Fully Paid
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setSelectedBookingForDetails(booking)}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => {
                          setSelectedBookingForReschedule(booking);
                          setNewRescheduleDate(booking.booking_date?.toString().slice(0, 10) || '');
                          setNewRescheduleTime(booking.booking_time || '11:00 AM');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-all flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    </div>

                    {booking.whatsapp_url && (
                      <a
                        href={booking.whatsapp_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline font-medium"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Receipt</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : activeTab === 'history' ? (
        /* BOOKING HISTORY */
        historyBookings.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border border-[#EAE5DF] space-y-4 bg-white/70 backdrop-blur-md">
            <Clock className="w-12 h-12 text-[#8491A5] mx-auto" />
            <h3 className="text-lg font-serif font-semibold text-[#1E2433]">No Booking History</h3>
            <p className="text-xs text-[#566176]">Past completed or cancelled bookings will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyBookings.map((booking) => (
              <div
                key={booking.id}
                className="glass-card rounded-2xl p-5 border border-[#EAE5DF] bg-white/70 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-400">#{booking.id}</span>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        booking.status === 'completed' ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-xs text-stone-500">· {booking.booking_date?.toString().slice(0, 10)} @ {booking.booking_time}</span>
                  </div>
                  <h4 className="font-serif font-bold text-stone-900 text-sm">
                    {booking.service_titles?.join(' + ') || booking.service_title || 'Booking'}
                  </h4>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-stone-900">
                    {currency}{parseFloat(String(booking.total_amount)).toFixed(2)}
                  </span>
                  <button
                    onClick={() => setSelectedBookingForDetails(booking)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium"
                  >
                    View Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'saved' ? (
        /* SAVED SERVICES & PACKAGES */
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-xl text-stone-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-rose-600" />
              <span>Saved Favorite Services</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {savedServices.map((service) => (
                <div key={service.id} className="glass-card rounded-3xl p-5 border border-[#EAE5DF] bg-white/80 backdrop-blur-xl space-y-3">
                  <div className="h-36 rounded-2xl overflow-hidden bg-stone-100">
                    <img src={service.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'} alt={service.title} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-serif font-bold text-stone-900">{service.title}</h4>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-mono font-bold text-rose-900">{currency}{parseFloat(String(service.price)).toFixed(2)}</span>
                    <button onClick={onNavigateToBooking} className="px-3 py-1 bg-stone-900 text-white rounded-xl hover:bg-rose-700 transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-serif font-bold text-xl text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Favorite Signature Packages</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {favoritePackages.map((pkg) => (
                <div key={pkg.id} className="glass-card rounded-3xl p-6 border border-[#EAE5DF] bg-white/80 backdrop-blur-xl space-y-3">
                  <h4 className="font-serif font-bold text-lg text-stone-900">{pkg.name}</h4>
                  <p className="text-xs text-stone-600 line-clamp-2">{pkg.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-mono font-bold text-rose-900 text-base">{currency}{parseFloat(String(pkg.price)).toFixed(2)}</span>
                    <button onClick={onNavigateToBooking} className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors">
                      Book Package
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* PROFILE INFORMATION */
        <div className="max-w-2xl mx-auto glass-card rounded-3xl p-8 border border-[#EAE5DF] bg-white/90 backdrop-blur-2xl space-y-6 animate-fade-in">
          <div className="flex items-center gap-4 border-b border-stone-200 pb-6">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-serif text-2xl font-bold shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-1 border border-amber-200">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Gold VIP Sanctuary Member</span>
              </div>
              <h3 className="font-serif font-bold text-xl text-stone-900">{user.name}</h3>
              <p className="text-xs text-stone-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-400 block">Phone Number</span>
                <span className="font-semibold text-stone-900">{user.phone || '+91 98765 43210'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-400 block">Loyalty Reward Points</span>
                <span className="font-semibold text-rose-900 font-mono text-sm">450 Points (₹450 Value)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-stone-400 block">Default Sanctuary Location</span>
              <span className="font-semibold text-stone-900">Connaught Place Flagship & Home Service Enabled</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {selectedBookingForDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-white shadow-2xl space-y-6 border border-[#EAE5DF]">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <span className="text-xs font-mono text-stone-400">Reservation Receipt</span>
                <h3 className="font-serif font-bold text-xl text-stone-900">Appointment #{selectedBookingForDetails.id}</h3>
              </div>
              <button onClick={() => setSelectedBookingForDetails(null)} className="p-2 rounded-full hover:bg-stone-100 text-stone-500">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Status</span>
                <span className="font-semibold capitalize text-emerald-700">{selectedBookingForDetails.status}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Date & Time</span>
                <span className="font-semibold text-stone-900">{selectedBookingForDetails.booking_date?.toString().slice(0, 10)} @ {selectedBookingForDetails.booking_time}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Assigned Specialist</span>
                <span className="font-semibold text-stone-900">{selectedBookingForDetails.staff_name || 'Master Stylist'}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Visit Mode</span>
                <span className="font-semibold text-stone-900 capitalize">{selectedBookingForDetails.booking_mode?.replace('_', ' ')}</span>
              </div>

              <div className="pt-2 space-y-1 font-mono">
                <div className="flex justify-between text-stone-600">
                  <span>Total Amount:</span>
                  <span>{currency}{parseFloat(String(selectedBookingForDetails.total_amount)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-900 font-semibold">
                  <span>Balance Due:</span>
                  <span>{currency}{parseFloat(String(selectedBookingForDetails.venue_balance_due || '0')).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedBookingForDetails(null)}
                className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {selectedBookingForReschedule && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 sm:p-8 bg-white shadow-2xl space-y-6 border border-[#EAE5DF]">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <span className="text-xs font-mono text-stone-400">Rescheduling Engine</span>
                <h3 className="font-serif font-bold text-xl text-stone-900">Reschedule Appointment #{selectedBookingForReschedule.id}</h3>
              </div>
              <button onClick={() => setSelectedBookingForReschedule(null)} className="p-2 rounded-full hover:bg-stone-100 text-stone-500">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {rescheduleMessage && (
              <div className={`p-3 rounded-xl text-xs font-medium ${rescheduleMessage.includes('Successfully') ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                {rescheduleMessage}
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Select New Date</label>
                <input
                  type="date"
                  value={newRescheduleDate}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Select New Time Slot</label>
                <select
                  value={newRescheduleTime}
                  onChange={(e) => setNewRescheduleTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                >
                  {['09:00 AM', '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM', '07:00 PM'].map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForReschedule(null)}
                  className="px-4 py-2.5 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRescheduling}
                  className="px-5 py-2.5 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors shadow-md disabled:opacity-50"
                >
                  {isRescheduling ? 'Validating Slot...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
