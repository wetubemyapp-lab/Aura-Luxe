import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { BookingItem, ServiceItem, StaffItem } from '../../types/index.ts';
import { CheckoutModal } from '../../components/admin/CheckoutModal.tsx';
import {
  CalendarCheck,
  Phone,
  Mail,
  Clock,
  Calendar,
  Check,
  X,
  CreditCard,
  Building2,
  Home,
  MessageCircle,
  ExternalLink,
  Plus,
  Archive,
  RotateCcw,
  Sparkles,
  Filter,
  UserPlus,
  Loader2,
} from 'lucide-react';

export const AdminBookingsPage: React.FC = () => {
  const { token, user } = useAuth();
  const { activeBusiness, branches } = useBusiness();
  const { language, t } = useLanguage();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBranchId, setFilterBranchId] = useState<string>('all');
  const [viewArchived, setViewArchived] = useState(false);
  const [selectedBookingForCheckout, setSelectedBookingForCheckout] = useState<BookingItem | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Walk-in modal state
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInServiceIds, setWalkInServiceIds] = useState<number[]>([]);
  const [walkInStaffId, setWalkInStaffId] = useState<number | undefined>(undefined);
  const [walkInBranchId, setWalkInBranchId] = useState<number | undefined>(undefined);
  const [walkInPaymentMethod, setWalkInPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [isSubmittingWalkIn, setIsSubmittingWalkIn] = useState(false);

  const currency = activeBusiness?.primary_currency || '₹';

  const fetchBookings = async () => {
    try {
      const bId = activeBusiness?.id || 1;
      let url = `/api/bookings/all?businessId=${bId}&archived=${viewArchived}`;
      if (filterBranchId !== 'all') {
        url += `&branchId=${filterBranchId}`;
      }
      if (filterStatus !== 'all') {
        url += `&status=${filterStatus}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load all bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeBusiness, token, viewArchived, filterBranchId, filterStatus]);

  // Load services and staff for walk-in form
  useEffect(() => {
    async function loadCatalog() {
      if (!activeBusiness) return;
      try {
        const [sRes, stfRes] = await Promise.all([
          fetch(`/api/services?businessId=${activeBusiness.id}`),
          fetch(`/api/staff?businessId=${activeBusiness.id}`),
        ]);
        if (sRes.ok) {
          const sd = await sRes.json();
          setServicesList(sd.services || []);
        }
        if (stfRes.ok) {
          const stfd = await stfRes.json();
          setStaffList(stfd.staff || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadCatalog();
  }, [activeBusiness]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await fetchBookings();
      }
    } catch (err) {
      console.error('Failed to update booking status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      const res = await fetch(`/api/bookings/${id}/archive`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) await fetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const res = await fetch(`/api/bookings/${id}/restore`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) await fetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName || walkInServiceIds.length === 0) return;
    setIsSubmittingWalkIn(true);

    try {
      const res = await fetch('/api/bookings/walk-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness?.id || 1,
          branch_id: walkInBranchId || branches[0]?.id || 1,
          customer_name: walkInName,
          customer_phone: walkInPhone,
          service_ids: walkInServiceIds,
          staff_id: walkInStaffId || null,
          payment_method: walkInPaymentMethod,
        }),
      });

      if (res.ok) {
        setIsWalkInOpen(false);
        setWalkInName('');
        setWalkInPhone('');
        setWalkInServiceIds([]);
        await fetchBookings();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingWalkIn(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DBD0] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E6] text-[#E07A5F] text-xs font-bold uppercase tracking-wider mb-2">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Universal Booking OS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A]">
            {language === 'hi' ? 'बुकिंग एवं अपॉइंटमेंट प्रबंधन' : 'Bookings & Front-Desk'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {language === 'hi'
              ? 'ऑनलाइन, होम-सर्विस एवं वॉक-इन ग्राहकों का समग्र प्रबंधन और व्हाट्सएप अधिसूचनाएं।'
              : 'Lifecycle management for online, doorstep home services, and walk-in salon desk appointments.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWalkInOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#D47055] text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            {language === 'hi' ? '+ वॉक-इन ग्राहक' : '+ New Walk-In'}
          </button>
        </div>
      </div>

      {/* Filter and Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-stone-200/80 shadow-sm text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-stone-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_service">In Service</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {branches.length > 0 && (
            <select
              value={filterBranchId}
              onChange={(e) => setFilterBranchId(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewArchived(false)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              !viewArchived ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Active Bookings
          </button>
          <button
            onClick={() => setViewArchived(true)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewArchived ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Archived ({bookings.filter((b) => b.is_archived).length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#E07A5F] animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-stone-200 text-stone-400">
          <CalendarCheck className="w-12 h-12 mx-auto text-stone-300 mb-3" />
          <p className="text-sm font-medium text-stone-600">No appointments found</p>
          <p className="text-xs text-stone-400 mt-1">Appointments created online or registered at desk will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const serviceTitles = booking.service_titles || [booking.service_title || 'Service'];
            return (
              <div
                key={booking.id}
                className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-400">#{booking.id}</span>

                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : booking.status === 'in_service'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : booking.status === 'completed'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : booking.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {booking.status.replace('_', ' ')}
                    </span>

                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 flex items-center gap-1">
                      {booking.booking_mode === 'home_service' ? (
                        <>
                          <Home className="w-3 h-3 text-[#E07A5F]" /> Home Service
                        </>
                      ) : booking.booking_mode === 'walk_in' ? (
                        <>
                          <UserPlus className="w-3 h-3 text-blue-600" /> Walk-In Desk
                        </>
                      ) : (
                        <>
                          <Building2 className="w-3 h-3 text-stone-500" /> {booking.branch_name || 'Studio'}
                        </>
                      )}
                    </span>

                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      Payment: {booking.payment_status} ({booking.payment_option?.replace('_', ' ') || 'online'})
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-serif font-bold text-stone-900 leading-snug">
                      {serviceTitles.join(' + ')}
                    </h3>
                    <p className="text-xs text-stone-600 font-medium mt-0.5">
                      Customer: {booking.customer_name || 'Guest'} {booking.customer_phone ? `• ${booking.customer_phone}` : ''}
                    </p>
                    {booking.home_service_address && (
                      <p className="text-xs text-stone-500 mt-0.5">
                        Address: {booking.home_service_address}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#E07A5F]" />
                      {booking.booking_date?.toString().slice(0, 10)}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#E07A5F]" />
                      {booking.booking_time} ({booking.duration_mins} mins)
                    </span>
                    {booking.staff_name && (
                      <span className="text-stone-700 font-medium">
                        Stylist: {booking.staff_name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Switcher & WhatsApp Action */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-stone-100">
                  <div className="text-right">
                    <span className="text-xs text-stone-400 block font-mono">Gross Total</span>
                    <span className="text-lg font-serif font-bold text-stone-900 block font-mono">
                      {currency}{parseFloat(String(booking.total_amount)).toFixed(2)}
                    </span>
                    {parseFloat(String(booking.venue_balance_due || '0')) > 0 && (
                      <span className="text-[11px] font-mono text-amber-700 block font-medium">
                        Due: {currency}{parseFloat(String(booking.venue_balance_due)).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Status actions */}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'in_service')}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors"
                      >
                        Start Service
                      </button>
                    )}

                    {booking.status === 'in_service' && (
                      <button
                        onClick={() => setSelectedBookingForCheckout(booking)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs transition-colors"
                      >
                        POS Checkout
                      </button>
                    )}

                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                        className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    )}

                    {/* WhatsApp confirmation */}
                    {booking.whatsapp_url && (
                      <a
                        href={booking.whatsapp_url}
                        target="_blank"
                        rel="noreferrer"
                        title="Send WhatsApp confirmation"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}

                    {/* Archive / Restore */}
                    {!viewArchived ? (
                      <button
                        onClick={() => handleArchive(booking.id)}
                        title="Archive booking"
                        className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors rounded-lg"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestore(booking.id)}
                        title="Restore booking"
                        className="p-1.5 text-stone-400 hover:text-emerald-600 transition-colors rounded-lg"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* POS Checkout Settlement Modal */}
      {selectedBookingForCheckout && (
        <CheckoutModal
          booking={selectedBookingForCheckout}
          onClose={() => {
            setSelectedBookingForCheckout(null);
            fetchBookings();
          }}
          onSuccess={() => {
            setSelectedBookingForCheckout(null);
            fetchBookings();
          }}
        />
      )}

      {/* Walk-In Quick Booking Modal */}
      {isWalkInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#E07A5F]" />
              Register Walk-In Client
            </h3>

            <form onSubmit={handleCreateWalkIn} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  placeholder="+91 98200 11223"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Select Services *</label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 border border-stone-200 rounded-xl p-2 bg-stone-50">
                  {servicesList.map((s) => {
                    const isChecked = walkInServiceIds.includes(s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-2 text-xs text-stone-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setWalkInServiceIds((prev) =>
                              isChecked ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                            );
                          }}
                          className="rounded border-stone-300 text-[#E07A5F] focus:ring-[#E07A5F]"
                        />
                        <span className="flex-1 truncate">{s.title}</span>
                        <span className="font-mono font-bold text-stone-600">{currency}{s.price}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Assign Specialist</label>
                  <select
                    value={walkInStaffId || ''}
                    onChange={(e) => setWalkInStaffId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  >
                    <option value="">Any Stylist</option>
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Payment Method</label>
                  <select
                    value={walkInPaymentMethod}
                    onChange={(e) => setWalkInPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  >
                    <option value="cash">Cash Counter</option>
                    <option value="card">Card POS</option>
                    <option value="upi">UPI QR Scan</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsWalkInOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWalkIn || walkInServiceIds.length === 0}
                  className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#E07A5F] text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {isSubmittingWalkIn ? 'Saving...' : 'Create & Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
