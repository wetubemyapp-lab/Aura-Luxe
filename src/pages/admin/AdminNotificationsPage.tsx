import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import {
  Bell,
  MessageSquare,
  Mail,
  Smartphone,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
  Loader2,
  Database,
  Check,
  Flame,
} from 'lucide-react';
import { Button, Badge } from '../../components/ui/index.ts';

export const AdminNotificationsPage: React.FC = () => {
  const { language } = useLanguage();

  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);

  // Form State for Event Simulation
  const [eventType, setEventType] = useState('booking.confirmed');
  const [bookingId, setBookingId] = useState('1');
  const [customerName, setCustomerName] = useState('Amit Sharma');
  const [recipientPhone, setRecipientPhone] = useState('+91 98765 43210');
  const [recipientEmail, setRecipientEmail] = useState('customer@auraluxe.com');

  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/notifications/history?business_id=1');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
        setStats(data.stats || []);
        setProviders(data.providers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSimulationResult(null);

    try {
      const res = await fetch('/api/notifications/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          bookingId,
          customerName,
          recipientPhone,
          recipientEmail,
          businessId: 1,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSimulationResult(data.dispatchResult);
        await loadData();
      } else {
        alert(data.error || 'Failed to simulate event');
      }
    } catch (err) {
      alert('Network error simulating event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E293B] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E07A5F]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Bell className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-serif font-bold text-[#FAF7F2]">
                {language === 'hi' ? 'सूचनाएं और व्हाट्सएप इंजन' : 'Notification Engine & WhatsApp OS'}
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono">
                Active
              </span>
            </div>
            <p className="text-slate-300 text-sm">
              {language === 'hi'
                ? 'सभी प्लगेबल प्रदाताओं (Email, SMS, WhatsApp, In-App) पर ग्राहकों के लिए रीयल-टाइम अलर्ट को प्रबंधित करें।'
                : 'Monitor, configure, and simulate multi-channel dynamic notifications for your bookings and payments.'}
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh Logs
          </button>
        </div>
      </div>

      {/* Grid Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total SMS Sent */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">SMS Gateway</span>
            <Smartphone className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900">
            {stats.filter((s) => s.channel === 'sms').reduce((sum, s) => sum + parseInt(s.count), 0)}
          </div>
          <p className="text-[10px] text-stone-400 mt-1">Provider: Gupshup Gateway</p>
        </div>

        {/* WhatsApp Cloud API */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">WhatsApp Cloud API</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900">
            {stats.filter((s) => s.channel === 'whatsapp').reduce((sum, s) => sum + parseInt(s.count), 0)}
          </div>
          <p className="text-[10px] text-stone-400 mt-1">Official Meta Template Policy</p>
        </div>

        {/* Mail SES */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Email Delivery</span>
            <Mail className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900">
            {stats.filter((s) => s.channel === 'email').reduce((sum, s) => sum + parseInt(s.count), 0)}
          </div>
          <p className="text-[10px] text-stone-400 mt-1">Provider: SendGrid SMTP</p>
        </div>

        {/* In-App Notifications */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In-App Push</span>
            <Bell className="w-4 h-4 text-[#E07A5F]" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900">
            {stats.filter((s) => s.channel === 'in_app').reduce((sum, s) => sum + parseInt(s.count), 0)}
          </div>
          <p className="text-[10px] text-stone-400 mt-1">Platform In-App Alert Bell</p>
        </div>
      </div>

      {/* Main Simulation & Log Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Simulation Panel */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="font-semibold text-stone-900 text-sm flex items-center gap-2 pb-2 border-b border-stone-100">
            <Flame className="w-4 h-4 text-orange-500" />
            Notification Tester & Simulator
          </h3>

          <form onSubmit={handleSimulate} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Trigger Event</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              >
                <option value="booking.created">booking.created</option>
                <option value="booking.confirmed">booking.confirmed (WhatsApp Template)</option>
                <option value="booking.cancelled">booking.cancelled</option>
                <option value="booking.rescheduled">booking.rescheduled</option>
                <option value="payment.success">payment.success</option>
                <option value="payment.failed">payment.failed</option>
                <option value="refund.initiated">refund.initiated</option>
                <option value="refund.completed">refund.completed</option>
                <option value="appointment.reminder">appointment.reminder (Tomorrow)</option>
                <option value="review.request">review.request (Feedback)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Booking ID</label>
                <input
                  type="number"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Recipient Phone</label>
              <input
                type="text"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Recipient Email</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                required
              />
            </div>

            <Button type="submit" variant="primary" className="w-full py-2.5 flex items-center justify-center gap-1.5" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Dispatch Simulated Alerts
            </Button>
          </form>

          {/* Pluggable Providers list */}
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <h4 className="font-semibold text-stone-700 text-[11px] uppercase tracking-wider">Pluggable Channels</h4>
            <div className="space-y-1.5">
              {providers.map((p) => (
                <div key={p.channel} className="flex items-center justify-between text-xs bg-stone-50 p-2 rounded-xl border border-stone-100">
                  <span className="capitalize font-medium text-stone-800">{p.channel} channel</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Logs Stream Panel */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between max-h-[750px]">
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            <h3 className="font-semibold text-stone-900 text-sm flex items-center gap-2 pb-2 border-b border-stone-100">
              <Database className="w-4 h-4 text-indigo-500" />
              Live Notification Dispatch Stream
            </h3>

            {history.length === 0 ? (
              <div className="py-24 text-center space-y-2">
                <Bell className="w-12 h-12 text-stone-300 mx-auto" />
                <p className="text-sm font-semibold text-stone-600">No logs generated yet</p>
                <p className="text-xs text-stone-400">Trigger simulated events above to populate notifications live logs!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((log) => (
                  <div key={log.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={log.status === 'SENT' ? 'success' : 'error'} size="xs">
                          {log.status}
                        </Badge>
                        <span className="text-[10px] font-mono text-stone-400">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                        <span className="text-xs font-bold text-stone-800 bg-white px-2 py-0.5 rounded-lg border border-stone-200">
                          {log.event_type}
                        </span>
                        <span className="text-xs text-stone-500 font-semibold">
                          Recipient: {log.recipient}
                        </span>
                      </div>

                      <div className="p-3 bg-white border border-stone-100 rounded-xl text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap relative group">
                        {log.message}

                        <button
                          onClick={() => handleCopyText(log.message, log.id)}
                          className="absolute right-2 top-2 p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-md transition-colors"
                          title="Copy message payload"
                        >
                          {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Send className="w-3.5 h-3.5 rotate-45" />}
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4 text-[10px] text-stone-400">
                        <span>Channel: <strong className="uppercase">{log.channel}</strong></span>
                        <span>Provider: <strong className="text-stone-600">{log.provider}</strong></span>
                        {log.template_name && <span>Template: <strong>{log.template_name}</strong></span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
