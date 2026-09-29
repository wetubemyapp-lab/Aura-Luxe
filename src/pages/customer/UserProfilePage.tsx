import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { BookingItem } from '../../types/index.ts';
import {
  User,
  Phone,
  Mail,
  Clock,
  Calendar,
  LogOut,
  MapPin,
  CreditCard,
  Star,
  Heart,
  QrCode,
  FileText,
  MessageCircle,
  Navigation,
  Sparkles,
  AlertCircle,
  Plus,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Button, Badge } from '../../components/ui/index.ts';
import { QrCodeModal } from '../../components/common/QrCodeModal.tsx';

export interface UserProfilePageProps {
  onNavigateToBookings: () => void;
  onNavigateToBooking: () => void;
  onOpenAuth: () => void;
  initialTab?: 'my-bookings' | 'profile' | 'saved-addresses' | 'payments' | 'reviews' | 'favorites';
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  onNavigateToBookings,
  onNavigateToBooking,
  onOpenAuth,
  initialTab = 'profile',
}) => {
  const { user, token, logout } = useAuth();
  const { activeBusiness } = useBusiness();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'my-bookings' | 'profile' | 'saved-addresses' | 'payments' | 'reviews' | 'favorites'>(initialTab);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQrBooking, setSelectedQrBooking] = useState<BookingItem | null>(null);

  // Saved addresses state
  const [addresses, setAddresses] = useState<Array<{ id: number; label: string; address: string }>>([
    { id: 1, label: 'Home', address: 'B-402, Green Valley Apartments, Sector 14, City' },
    { id: 2, label: 'Office', address: 'Tech Park Tower B, 5th Floor, City' },
  ]);
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrText, setNewAddrText] = useState('');

  const currency = activeBusiness?.primary_currency || '₹';

  useEffect(() => {
    async function loadUserBookings() {
      if (!user || !token) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/bookings?userId=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      } catch (err) {
        console.error('Failed to load customer dashboard bookings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserBookings();
  }, [user, token]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-[#1E2433]">Account Sign-In Required</h2>
        <p className="text-xs text-[#566176]">
          Sign in to access your Customer Dashboard, view upcoming appointments, access QR passes, and download invoices.
        </p>
        <Button variant="primary" onClick={onOpenAuth}>
          Sign In / Create Account
        </Button>
      </div>
    );
  }

  // Dashboard calculation cards
  const upcomingBooking = bookings.find((b) => b.status === 'CONFIRMED' || b.status === 'HELD' || b.status === 'pending');
  const lastBooking = bookings.find((b) => b.status === 'COMPLETED');
  const pendingPaymentBooking = bookings.find((b) => parseFloat(String(b.venue_balance_due || 0)) > 0);

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrText) return;
    setAddresses([...addresses, { id: Date.now(), label: newAddrLabel || 'Other', address: newAddrText }]);
    setNewAddrLabel('');
    setNewAddrText('');
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking according to the cancellation policy?')) return;
    try {
      const res = await fetch('/api/payments/cancel-and-refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ booking_id: bookingId, cancelled_by: 'customer', reason: 'Cancelled by customer' }),
      });
      if (res.ok) {
        alert('Booking cancelled successfully.');
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">
      {/* Top Banner & User Profile Bar */}
      <div className="bg-[#0F172A] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E07A5F] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-2xl sm:text-3xl">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/30">
                VIP Client
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <span>{user.email}</span>
              {user.phone && <span>• {user.phone}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={onNavigateToBooking}
            className="px-5 py-2.5 bg-[#E07A5F] hover:bg-[#D47055] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Book New Service</span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Overview Summary Cards (Section 27) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Upcoming Appointment */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2DBD0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
              <span>Upcoming Appointment</span>
              <Calendar className="w-4 h-4 text-[#E07A5F]" />
            </div>
            {upcomingBooking ? (
              <div>
                <h4 className="font-bold text-sm text-slate-900">{upcomingBooking.service_titles?.join(', ') || 'Scheduled Service'}</h4>
                <p className="text-xs text-[#E07A5F] font-semibold mt-1">
                  {upcomingBooking.booking_date} @ {upcomingBooking.booking_time}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No upcoming reservation</p>
            )}
          </div>
          {upcomingBooking && (
            <button
              onClick={() => setSelectedQrBooking(upcomingBooking)}
              className="mt-3 text-[11px] font-bold text-[#E07A5F] flex items-center gap-1 hover:underline"
            >
              <QrCode className="w-3.5 h-3.5" /> Show Access QR Pass
            </button>
          )}
        </div>

        {/* Card 2: Last Appointment */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2DBD0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
              <span>Last Appointment</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            {lastBooking ? (
              <div>
                <h4 className="font-bold text-sm text-slate-900">{lastBooking.service_titles?.join(', ') || 'Completed Service'}</h4>
                <p className="text-xs text-slate-500 mt-1">{lastBooking.booking_date}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No completed history</p>
            )}
          </div>
          {lastBooking && (
            <button
              onClick={onNavigateToBooking}
              className="mt-3 text-[11px] font-bold text-slate-800 flex items-center gap-1 hover:underline"
            >
              Rebook Service →
            </button>
          )}
        </div>

        {/* Card 3: Saved Services */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2DBD0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
              <span>Saved Services</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <h4 className="font-bold text-xl text-slate-900">3 Saved</h4>
            <p className="text-xs text-slate-400 mt-1">Quick 1-tap rebooking</p>
          </div>
          <button
            onClick={() => setActiveTab('favorites')}
            className="mt-3 text-[11px] font-bold text-rose-600 flex items-center gap-1 hover:underline"
          >
            View Saved List
          </button>
        </div>

        {/* Card 4: Pending Payment */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2DBD0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
              <span>Pending Payment</span>
              <CreditCard className="w-4 h-4 text-amber-600" />
            </div>
            {pendingPaymentBooking ? (
              <div>
                <h4 className="font-bold text-lg text-amber-600">
                  {currency}{pendingPaymentBooking.venue_balance_due}
                </h4>
                <p className="text-xs text-slate-500 mt-1">Due at salon counter</p>
              </div>
            ) : (
              <p className="text-xs text-emerald-600 font-bold">All settled (₹0 Due)</p>
            )}
          </div>
          {pendingPaymentBooking && (
            <button
              onClick={() => setActiveTab('my-bookings')}
              className="mt-3 text-[11px] font-bold text-amber-600 flex items-center gap-1 hover:underline"
            >
              Pay / View Details
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs (Section 27: /my-bookings, /profile, /saved-addresses, /payments, /reviews, /favorites) */}
      <div className="border-b border-[#E2DBD0] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'my-bookings', label: 'My Bookings', icon: Calendar },
          { id: 'profile', label: 'Profile Details', icon: User },
          { id: 'saved-addresses', label: 'Saved Addresses', icon: MapPin },
          { id: 'payments', label: 'Payments & Ledger', icon: CreditCard },
          { id: 'reviews', label: 'My Reviews', icon: Star },
          { id: 'favorites', label: 'Saved Favorites', icon: Heart },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#0F172A] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-[#FAF0E6] hover:text-[#E07A5F]'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREAS */}

      {/* 1. MY BOOKINGS TAB */}
      {activeTab === 'my-bookings' && (
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-xl text-slate-900">My Reservation History</h3>

          {bookings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E2DBD0] space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No active reservations found.</p>
              <Button variant="primary" size="sm" onClick={onNavigateToBooking}>
                Book First Service
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white p-6 rounded-3xl border border-[#E2DBD0] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#E07A5F] uppercase tracking-wider">
                        Booking ID #{b.id}
                      </span>
                      <h4 className="font-serif font-bold text-lg text-slate-900 mt-0.5">
                        {b.service_titles?.join(', ') || 'Salon Service'}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'CONFIRMED' || b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'COMPLETED' || b.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        b.status === 'CHECKED_IN' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>

                  {/* Financial & Schedule Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#FAF7F2] p-3 rounded-2xl border border-[#E2DBD0]">
                    <div><span className="text-slate-400 block text-[10px]">Date & Time</span><span className="font-bold">{b.booking_date} @ {b.booking_time}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Total Amount</span><span className="font-bold">{currency}{b.total_amount}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Paid Advance</span><span className="font-bold text-emerald-600">{currency}{b.advance_amount_paid || 0}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Counter Due</span><span className="font-bold text-amber-600">{currency}{b.venue_balance_due || 0}</span></div>
                  </div>

                  {/* Actions Bar (Reschedule, Cancel, WhatsApp, Show QR, Receipt) */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedQrBooking(b)}
                      className="px-3 py-1.5 bg-[#FAF0E6] text-[#E07A5F] hover:bg-[#F2E0D0] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Show Access QR Pass
                    </button>

                    {b.whatsapp_url && (
                      <a
                        href={b.whatsapp_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp Support
                      </a>
                    )}

                    {b.googleMapsUrl && (
                      <a
                        href={b.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Get Directions
                      </a>
                    )}

                    {b.status === 'CONFIRMED' && (
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(b.id)}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all ml-auto"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. PROFILE DETAILS TAB */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2DBD0] shadow-xs space-y-6">
          <h3 className="font-serif font-bold text-xl text-slate-900">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E2DBD0] space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Full Name</span>
              <p className="font-bold text-sm text-slate-900">{user.name}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E2DBD0] space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Email Address</span>
              <p className="font-bold text-sm text-slate-900">{user.email}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E2DBD0] space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Phone Number</span>
              <p className="font-bold text-sm text-slate-900">{user.phone || '+91 9876543210'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E2DBD0] space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Account Role</span>
              <p className="font-bold text-sm text-[#E07A5F]">{user.role.toUpperCase()}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. SAVED ADDRESSES TAB */}
      {activeTab === 'saved-addresses' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2DBD0] shadow-xs space-y-6">
          <h3 className="font-serif font-bold text-xl text-slate-900">Home Service Delivery Addresses</h3>

          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E2DBD0] flex items-center justify-between text-xs">
                <div>
                  <span className="px-2 py-0.5 rounded bg-[#E07A5F] text-white font-bold text-[10px] uppercase">
                    {addr.label}
                  </span>
                  <p className="font-medium text-slate-800 mt-1">{addr.address}</p>
                </div>
                <button
                  onClick={() => setAddresses(addresses.filter((a) => a.id !== addr.id))}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddAddress} className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Add New Service Address</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newAddrLabel}
                onChange={(e) => setNewAddrLabel(e.target.value)}
                placeholder="Label (e.g. Home, Office)"
                className="p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs"
              />
              <input
                type="text"
                required
                value={newAddrText}
                onChange={(e) => setNewAddrText(e.target.value)}
                placeholder="Complete address details..."
                className="sm:col-span-2 p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0F172A] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Address
            </button>
          </form>
        </div>
      )}

      {/* 4. PAYMENTS & LEDGER TAB */}
      {activeTab === 'payments' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2DBD0] shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-xl text-slate-900">Payment Transactions & Invoices</h3>
          <p className="text-xs text-slate-500">Universal Ledger verified settlement history</p>

          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E2DBD0] flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-900">Tx #{b.id}</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">{b.booking_date} via {b.payment_option || 'Online'}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-sm">{currency}{b.total_amount}</span>
                  <span className="block text-[10px] font-bold uppercase text-emerald-600">{b.payment_status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2DBD0] shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-xl text-slate-900">My Verified Service Reviews</h3>
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E2DBD0] space-y-2 text-xs">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <p className="text-slate-700 italic">"Exceptional facial treatment and warm hospitality!"</p>
            <span className="text-[10px] text-slate-400 block">Submitted on 2026-09-15 • Verified Visit</span>
          </div>
        </div>
      )}

      {/* 6. FAVORITES TAB */}
      {activeTab === 'favorites' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2DBD0] shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-xl text-slate-900">Saved Favorite Services</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E2DBD0] flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-slate-900">Radiance Gold Facial Treatment</h4>
                <span className="text-[#E07A5F] font-bold">{currency}1,800</span>
              </div>
              <Button variant="primary" size="xs" onClick={onNavigateToBooking}>
                Book Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal Popup */}
      <QrCodeModal
        booking={selectedQrBooking}
        mode="view"
        onClose={() => setSelectedQrBooking(null)}
      />
    </div>
  );
};

