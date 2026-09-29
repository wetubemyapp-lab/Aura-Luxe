import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { BookingItem } from '../../types/index.ts';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  Wallet,
  Sparkles,
  CheckCircle2,
  Receipt,
  FileText,
  User,
  ShieldCheck
} from 'lucide-react';

interface CheckoutModalProps {
  booking: BookingItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  booking,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const { activeBusiness } = useBusiness();
  const { language, t } = useLanguage();

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'online' | 'wallet'>('upi');
  const [tipAmount, setTipAmount] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<{
    referenceNo: string;
    invoiceUrl?: string;
  } | null>(null);

  if (!booking) return null;

  const currency = activeBusiness?.primary_currency || '₹';
  const totalDue = parseFloat(String(booking.total_amount || 0));
  const finalCharge = totalDue + (parseFloat(tipAmount) || 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ledger/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: booking.id,
          payment_method: paymentMethod,
          amount: totalDue,
          tip_amount: parseFloat(tipAmount) || 0,
          notes: notes || `Direct settlement at counter via ${paymentMethod.toUpperCase()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to settle checkout');
      } else {
        setCheckoutResult({
          referenceNo: data.reference_no,
        });
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FAF7F2] border border-[#E2DBD0] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0F172A] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E07A5F] flex items-center justify-center text-white">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base">Point of Sale & Settlement</h3>
              <p className="text-[10px] text-slate-400">Universal Payment Ledger • Booking #{booking.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {checkoutResult ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">
                Settled & Recorded
              </span>
              <h4 className="text-xl font-serif font-bold text-[#0F172A] mt-1">
                Payment Completed Successfully
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Transaction Reference: <span className="font-mono font-bold text-slate-900">{checkoutResult.referenceNo}</span>
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#E2DBD0] text-xs text-left space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Client:</span>
                <span className="font-bold text-slate-900">{booking.customer_name || 'Guest'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Service:</span>
                <span className="font-bold text-slate-900">{booking.service_title}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Method:</span>
                <span className="font-bold uppercase text-slate-900">{paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 font-serif text-sm">
                <span className="font-semibold text-slate-900">Total Settled:</span>
                <span className="font-bold text-[#E07A5F]">{currency}{finalCharge.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Done & Return to Bookings
            </button>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            {/* Bill Summary */}
            <div className="bg-white p-4 rounded-2xl border border-[#E2DBD0] space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Service: {booking.service_title}</span>
                <span className="font-medium text-slate-800">{currency}{Number(booking.service_amount || booking.total_amount).toFixed(2)}</span>
              </div>

              {Number(booking.addons_amount) > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Selected Add-ons</span>
                  <span className="font-medium text-slate-800">+{currency}{Number(booking.addons_amount).toFixed(2)}</span>
                </div>
              )}

              {Number(booking.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Promo Discount Applied</span>
                  <span className="font-medium">-{currency}{Number(booking.discount_amount).toFixed(2)}</span>
                </div>
              )}

              {Number(booking.tax_amount) > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Taxes (GST/Service Tax)</span>
                  <span className="font-medium text-slate-800">+{currency}{Number(booking.tax_amount).toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm font-serif">
                <span className="font-bold text-slate-900">Total Net Payable</span>
                <span className="font-bold text-xl text-[#0F172A]">{currency}{totalDue.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Tender Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'upi', label: 'UPI / QR', icon: QrCode },
                  { id: 'cash', label: 'Cash', icon: Banknote },
                  { id: 'card', label: 'Card / POS', icon: CreditCard },
                  { id: 'wallet', label: 'Wallet / Net', icon: Wallet },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = paymentMethod === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setPaymentMethod(item.id as any)}
                      className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                          : 'bg-white border-[#E2DBD0] text-slate-700 hover:bg-[#FAF0E6]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gratuity / Tip */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Staff Gratuity / Tip ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  placeholder="0"
                  className="w-full p-2.5 bg-white border border-[#E2DBD0] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Staff Assigned
                </label>
                <div className="p-2.5 bg-white border border-[#E2DBD0] rounded-xl text-xs text-slate-700 font-medium truncate flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#E07A5F]" />
                  <span>{booking.staff_name || 'Counter Staff'}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Receipt Note (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Paid at salon desk"
                className="w-full p-2.5 bg-white border border-[#E2DBD0] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#E07A5F] hover:bg-[#D47055] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {loading ? 'Recording to Ledger...' : `Confirm & Settle ${currency}${finalCharge.toFixed(2)}`}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
