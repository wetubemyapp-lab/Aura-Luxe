import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { Service, StaffMember, Branch } from '../../types/index.ts';
import {
  X,
  UserCheck,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Sparkles,
  CreditCard,
  FileText,
  Printer,
  CheckCircle2,
  Tag
} from 'lucide-react';

interface WalkInPosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WalkInPosModal: React.FC<WalkInPosModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const { activeBusiness } = useBusiness();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().slice(0, 10));
  const [bookingTime, setBookingTime] = useState('11:00');
  const [paymentOption, setPaymentOption] = useState<'full_online' | 'advance_online' | 'pay_at_venue'>('full_online');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PARTIALLY_PAID' | 'PENDING'>('PAID');
  const [notes, setNotes] = useState('');

  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);

  const currency = activeBusiness?.primary_currency || '₹';

  useEffect(() => {
    if (!isOpen || !activeBusiness) return;

    async function loadData() {
      setLoading(true);
      try {
        const bId = activeBusiness!.id;
        const [srvRes, stfRes, brRes] = await Promise.all([
          fetch(`/api/services?businessId=${bId}`),
          fetch(`/api/services/staff?businessId=${bId}`),
          fetch(`/api/branches?businessId=${bId}`),
        ]);

        if (srvRes.ok) {
          const d = await srvRes.json();
          setServices(d.services || []);
          if (d.services?.length > 0) setSelectedServiceId(d.services[0].id);
        }
        if (stfRes.ok) {
          const d = await stfRes.json();
          setStaffList(d.staff || []);
        }
        if (brRes.ok) {
          const d = await brRes.json();
          setBranches(d.branches || []);
          if (d.branches?.length > 0) setSelectedBranchId(d.branches[0].id);
        }
      } catch (err) {
        console.error('Failed to load Walk-in POS metadata:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isOpen, activeBusiness]);

  if (!isOpen) return null;

  const activeService = services.find((s) => s.id === selectedServiceId);
  const totalAmount = activeService ? parseFloat(String(activeService.price)) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !selectedServiceId) {
      setError('Customer name and service selection are required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness?.id || 1,
          branch_id: selectedBranchId,
          service_ids: [selectedServiceId],
          staff_id: selectedStaffId,
          booking_date: bookingDate,
          booking_time: bookingTime,
          booking_mode: 'walk_in',
          payment_option: paymentOption,
          payment_status: paymentStatus,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          notes: notes || 'Front desk Walk-in reservation',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create walk-in reservation');
      } else {
        setCreatedBooking(data.booking);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Server connection failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-[#E2DBD0] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0F172A] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E07A5F] flex items-center justify-center text-white shadow-md">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg">Desk POS & Walk-In Creator</h3>
              <p className="text-xs text-slate-400">Instantly block slot on central calendar for arriving guest</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {createdBooking ? (
            /* Success & POS Receipt View */
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-slate-900">Walk-In Reserved & Blocked!</h3>
                <p className="text-xs text-slate-500 mt-1">Booking #{createdBooking.id} added to live schedule calendar.</p>
              </div>

              {/* Receipt Box */}
              <div id="printable-pos-receipt" className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E2DBD0] text-left space-y-3 font-mono text-xs max-w-md mx-auto">
                <div className="text-center border-b border-dashed border-slate-300 pb-3 font-sans">
                  <h4 className="font-bold text-sm text-slate-900">{activeBusiness?.name}</h4>
                  <p className="text-[10px] text-slate-500">{activeBusiness?.address || 'Front Desk POS Receipt'}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between"><span className="text-slate-500">Receipt No:</span><span className="font-bold">#POS-{createdBooking.id}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Customer:</span><span className="font-bold">{customerName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Service:</span><span className="font-bold">{activeService?.title || 'Walk-In Treatment'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Date & Time:</span><span className="font-bold">{bookingDate} @ {bookingTime}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Payment Status:</span><span className="font-bold text-emerald-600">{paymentStatus}</span></div>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-3 flex justify-between font-bold text-sm text-slate-900 font-sans">
                  <span>Total Charges:</span>
                  <span>{currency}{totalAmount}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="px-5 py-2.5 bg-[#FAF0E6] text-[#E07A5F] hover:bg-[#F2E0D0] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Print POS Receipt
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#0F172A] text-white hover:bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-200">
                  {error}
                </div>
              )}

              {/* Customer Info */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E2DBD0] space-y-3">
                <h4 className="text-xs font-bold text-[#E07A5F] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  Arriving Guest Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full p-2 bg-white border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full p-2 bg-white border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="rahul@example.com"
                      className="w-full p-2 bg-white border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Treatment & Specialist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Service / Treatment *</label>
                  <select
                    value={selectedServiceId || ''}
                    onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} — {currency}{s.price} ({s.duration_mins}m)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Specialist</label>
                  <select
                    value={selectedStaffId || ''}
                    onChange={(e) => setSelectedStaffId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                  >
                    <option value="">Auto-Assign First Available Staff</option>
                    {staffList.map((stf) => (
                      <option key={stf.id} value={stf.id}>
                        {stf.name} ({stf.role_title || 'Specialist'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date, Time & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Outlet</label>
                  <select
                    value={selectedBranchId || ''}
                    onChange={(e) => setSelectedBranchId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Settlement Options */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E2DBD0] space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#E07A5F]" />
                  Counter Payment Settlement Status
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentOption('full_online');
                      setPaymentStatus('PAID');
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      paymentStatus === 'PAID'
                        ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                        : 'bg-white text-slate-700 border-[#E2DBD0] hover:bg-slate-100'
                    }`}
                  >
                    Paid in Full
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentOption('advance_online');
                      setPaymentStatus('PARTIALLY_PAID');
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      paymentStatus === 'PARTIALLY_PAID'
                        ? 'bg-[#E07A5F] text-white border-[#E07A5F] shadow-xs'
                        : 'bg-white text-slate-700 border-[#E2DBD0] hover:bg-slate-100'
                    }`}
                  >
                    Partially Paid
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentOption('pay_at_venue');
                      setPaymentStatus('PENDING');
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      paymentStatus === 'PENDING'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-[#E2DBD0] hover:bg-slate-100'
                    }`}
                  >
                    Pay Later
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Front Desk Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special requests or seat assignment..."
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                />
              </div>

              {/* Total Summary Bar & Action */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Service Charges:</span>
                  <div className="text-2xl font-serif font-bold text-slate-900">
                    {currency}{totalAmount}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-[#E07A5F] hover:bg-[#D47055] text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {submitting ? 'Blocking Slot...' : 'BLOCK SLOT / CREATE WALK-IN'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
