import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { AdminPageTab, BookingItem } from '../../types/index.ts';
import {
  Scissors,
  Users,
  CalendarCheck,
  UserCheck,
  TrendingUp,
  Database,
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
  Globe
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigateTab: (tab: AdminPageTab) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateTab }) => {
  const { token } = useAuth();
  const { settings } = useBusiness();
  const { language, t } = useLanguage();

  const [summary, setSummary] = useState<{
    servicesCount: number;
    staffCount: number;
    bookingsCount: number;
    customersCount: number;
  }>({ servicesCount: 0, staffCount: 0, bookingsCount: 0, customersCount: 0 });

  const [recentBookings, setRecentBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [sumRes, bookRes] = await Promise.all([
          fetch('/api/business/summary', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/bookings/all', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (sumRes.ok) {
          const sumData = await sumRes.json();
          setSummary(sumData);
        }

        if (bookRes.ok) {
          const bookData = await bookRes.json();
          setRecentBookings(bookData.bookings.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [token]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DBD0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E6] text-[#E07A5F] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Foundation OS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A]">
            {language === 'hi' ? 'व्यवसाय नियंत्रण केंद्र' : 'Business Control Center'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {language === 'hi'
              ? `${settings?.name || 'Aura Luxe'} - प्रबंधित अपॉइंटमेंट्स और व्यवसाय सामग्री`
              : `Operating system for ${settings?.name || 'Aura Luxe'} • Dynamic Admin & Relational Database`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('website-mgmt')}
            className="px-4 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-medium transition-all flex items-center gap-2 shadow-sm"
          >
            <Globe className="w-4 h-4 text-[#E07A5F]" />
            <span>{language === 'hi' ? 'वेबसाइट प्रबंधित करें' : 'Manage Website'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('bookings')}
            className="px-4 py-2.5 bg-[#E07A5F] hover:bg-[#D47055] text-white rounded-xl text-xs font-medium transition-all flex items-center gap-2 shadow-sm"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>{language === 'hi' ? 'सभी बुकिंग्स' : 'All Bookings'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-[#E2DBD0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'hi' ? 'सक्रिय सेवाएं' : 'Active Services'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF0E6] text-[#E07A5F] flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A] mt-3">
            {summary.servicesCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Dynamic PostgreSQL catalog</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2DBD0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'hi' ? 'स्टाफ सदस्य' : 'Staff Experts'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A] mt-3">
            {summary.staffCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            <span>Certified professionals</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2DBD0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'hi' ? 'कुल बुकिंग्स' : 'Total Bookings'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A] mt-3">
            {summary.bookingsCount}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Real-time tracking</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2DBD0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'hi' ? 'पंजीकृत ग्राहक' : 'Registered Clients'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A] mt-3">
            {summary.customersCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            <span>Authenticated customers</span>
          </p>
        </div>
      </div>

      {/* Database & Architecture Foundation Card */}
      <div className="bg-[#0F172A] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-white">
                PostgreSQL Relational Engine & Schema Status
              </h3>
              <p className="text-xs text-slate-400">
                Pure PostgreSQL storage initialized with 11 relational tables and foreign keys
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium flex items-center gap-1.5 self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Connected & Verified
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-xs">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-slate-400">Database Engine</p>
            <p className="text-white font-medium mt-1">PostgreSQL v16 (PGlite)</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-slate-400">Persistence</p>
            <p className="text-white font-medium mt-1">File-backed Storage</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-slate-400">Authentication</p>
            <p className="text-white font-medium mt-1">JWT + Bcrypt (Customer / Admin)</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-slate-400">Admin Modules</p>
            <p className="text-white font-medium mt-1">12 Core System Views</p>
          </div>
        </div>
      </div>

      {/* Recent Bookings Overview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DBD0] shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#0F172A]">
              {language === 'hi' ? 'हाल की बुकिंग्स' : 'Recent Bookings'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'hi' ? 'नवीनतम ग्राहक अपॉइंटमेंट्स' : 'Latest customer appointment requests'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('bookings')}
            className="text-xs font-semibold text-[#E07A5F] hover:text-[#D47055] flex items-center gap-1"
          >
            <span>{language === 'hi' ? 'सभी देखें' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No bookings recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Schedule</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-400">#{b.id}</td>
                    <td className="py-3 font-medium text-slate-900">{b.customer_name || 'Guest User'}</td>
                    <td className="py-3 text-slate-700">{b.service_title}</td>
                    <td className="py-3 text-slate-500">{b.booking_date} • {b.booking_time}</td>
                    <td className="py-3 font-serif font-bold text-slate-900">
                      {settings?.primary_currency || '₹'}{Number(b.total_amount).toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
