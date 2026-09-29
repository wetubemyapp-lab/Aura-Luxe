import React, { useState } from 'react';
import { BookingItem } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  X,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  ScanLine
} from 'lucide-react';

interface QrCodeModalProps {
  booking: BookingItem | null;
  mode?: 'view' | 'scan';
  onClose: () => void;
  onCheckinSuccess?: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  booking,
  mode = 'view',
  onClose,
  onCheckinSuccess,
}) => {
  const { token, user } = useAuth();
  const [scanInput, setScanInput] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ success: boolean; text: string } | null>(null);

  if (!booking && mode === 'view') return null;

  const handlePerformCheckin = async (targetBookingId?: number) => {
    const idToUse = targetBookingId || booking?.id || parseInt(scanInput.replace(/\D/g, ''));
    if (!idToUse) return;

    setCheckingIn(true);
    setResultMsg(null);

    try {
      const res = await fetch('/api/bookings/qr-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ booking_id: idToUse }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResultMsg({ success: false, text: data.error || 'Check-in validation failed' });
      } else {
        setResultMsg({ success: true, text: data.message });
        if (onCheckinSuccess) onCheckinSuccess();
      }
    } catch (err: any) {
      setResultMsg({ success: false, text: err.message || 'Network error during QR validation' });
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white border border-[#E2DBD0] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0F172A] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E07A5F] flex items-center justify-center text-white">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm">
                {mode === 'scan' ? 'Staff QR Scanner & Check-In' : 'Appointment Access Pass'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {mode === 'scan' ? 'Scan customer QR code at salon desk' : `Booking Reference #${booking?.id}`}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-center">
          {mode === 'view' && booking && (
            <>
              {/* QR Code Visual Box */}
              <div className="p-6 bg-stone-50 border-2 border-dashed border-[#E2DBD0] rounded-3xl inline-block relative group">
                <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-md border border-slate-200 mx-auto flex flex-col items-center justify-center relative">
                  {/* Simulated SVG QR Code */}
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="5" y="5" width="25" height="25" rx="3" fill="#0F172A" />
                    <rect x="9" y="9" width="17" height="17" fill="#FFF" />
                    <rect x="13" y="13" width="9" height="9" fill="#0F172A" />

                    <rect x="70" y="5" width="25" height="25" rx="3" fill="#0F172A" />
                    <rect x="74" y="9" width="17" height="17" fill="#FFF" />
                    <rect x="78" y="13" width="9" height="9" fill="#0F172A" />

                    <rect x="5" y="70" width="25" height="25" rx="3" fill="#0F172A" />
                    <rect x="9" y="74" width="17" height="17" fill="#FFF" />
                    <rect x="13" y="78" width="9" height="9" fill="#0F172A" />

                    <path d="M 35 10 H 65 V 20 H 35 Z M 40 30 H 60 V 70 H 40 Z M 70 35 H 95 V 65 H 70 Z M 10 35 H 30 V 65 H 10 Z" fill="#E07A5F" />
                  </svg>
                  <div className="mt-1 font-mono text-[10px] font-bold text-slate-600">
                    RES-{booking.id}-PASS
                  </div>
                </div>

                {booking.checked_in_at && (
                  <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Checked-In at {new Date(booking.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>

              {/* Booking Pass Meta */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E2DBD0] text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900">{booking.customer_name || user?.name || 'Guest'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Date:</span>
                  <span className="font-bold text-slate-900">{booking.booking_date} @ {booking.booking_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold uppercase text-[#E07A5F]">{booking.status}</span>
                </div>
              </div>

              {/* Quick Staff Verification Action */}
              {(user?.role === 'owner' || user?.role === 'admin' || user?.role === 'branch_manager' || user?.role === 'receptionist' || user?.role === 'staff') && !booking.checked_in_at && (
                <button
                  type="button"
                  onClick={() => handlePerformCheckin(booking.id)}
                  disabled={checkingIn}
                  className="w-full py-3 bg-[#E07A5F] hover:bg-[#D47055] text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {checkingIn ? 'Validating Pass...' : 'Perform Reception Check-In'}
                </button>
              )}
            </>
          )}

          {/* Scanner Mode for Receptionists / Staff */}
          {mode === 'scan' && (
            <div className="space-y-4 text-left">
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 text-center space-y-3">
                <ScanLine className="w-10 h-10 text-[#E07A5F] mx-auto animate-pulse" />
                <p className="text-xs text-slate-300">
                  Point camera or enter Booking ID / QR Pass code below:
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Booking ID or Scanned Pass Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="e.g. 1 or RES-1-PASS"
                    className="flex-1 p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handlePerformCheckin()}
                    disabled={checkingIn || !scanInput}
                    className="px-5 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase transition-all disabled:opacity-50"
                  >
                    {checkingIn ? 'Checking...' : 'Validate'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Result Alert Box */}
          {resultMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold text-left flex items-start gap-2.5 ${
                resultMsg.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {resultMsg.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <p>{resultMsg.text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
