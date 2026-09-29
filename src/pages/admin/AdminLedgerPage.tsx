import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { LedgerEntry, SettlementItem } from '../../types/index.ts';
import {
  Receipt,
  TrendingUp,
  CreditCard,
  Banknote,
  QrCode,
  DollarSign,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Building2,
  Percent,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
} from 'lucide-react';

export const AdminLedgerPage: React.FC = () => {
  const { token } = useAuth();
  const { activeBusiness, updateSettings } = useBusiness();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'transactions' | 'settlements'>('transactions');
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [settlements, setSettlements] = useState<SettlementItem[]>([]);
  const [summary, setSummary] = useState<{
    totalRevenue: number;
    commissionsOwed: number;
    unpaidCount: number;
    unpaidAmount: number;
    paymentBreakdown: { method: string; amount: number }[];
  }>({
    totalRevenue: 0,
    commissionsOwed: 0,
    unpaidCount: 0,
    unpaidAmount: 0,
    paymentBreakdown: [],
  });

  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Platform commission configuration
  const [platformCommissionPct, setPlatformCommissionPct] = useState<string>(
    String(activeBusiness?.platform_commission_pct || '5.00')
  );
  const [advancePaymentPct, setAdvancePaymentPct] = useState<string>(
    String(activeBusiness?.advance_payment_percentage || '20.00')
  );
  const [isSavingCommission, setIsSavingCommission] = useState(false);
  const [commissionSuccessMsg, setCommissionSuccessMsg] = useState<string | null>(null);

  // Settlement creation modal
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [settleStartDate, setSettleStartDate] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  );
  const [settleEndDate, setSettleEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [isGeneratingSettlement, setIsGeneratingSettlement] = useState(false);

  const currency = activeBusiness?.primary_currency || '₹';

  const fetchLedgerData = async () => {
    try {
      const bId = activeBusiness?.id || 1;
      const [entriesRes, sumRes, settleRes] = await Promise.all([
        fetch(`/api/ledger/entries?businessId=${bId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/ledger/summary?businessId=${bId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/ledger/settlements?businessId=${bId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (entriesRes.ok) {
        const data = await entriesRes.json();
        setEntries(data.entries || []);
      }
      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }
      if (settleRes.ok) {
        const sData = await settleRes.json();
        setSettlements(sData.settlements || []);
      }
    } catch (err) {
      console.error('Failed to load ledger data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, [activeBusiness, token]);

  const handleSaveCommissionSettings = async () => {
    setIsSavingCommission(true);
    setCommissionSuccessMsg(null);
    try {
      const res = await fetch('/api/ledger/platform-commission', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness?.id || 1,
          platform_commission_pct: parseFloat(platformCommissionPct),
          advance_payment_percentage: parseFloat(advancePaymentPct),
        }),
      });

      if (res.ok) {
        setCommissionSuccessMsg('Commission & Advance Payment rules updated in ledger.');
        setTimeout(() => setCommissionSuccessMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingCommission(false);
    }
  };

  const handleCreateSettlement = async () => {
    setIsGeneratingSettlement(true);
    try {
      const res = await fetch('/api/ledger/settlements/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness?.id || 1,
          settlement_period_start: settleStartDate,
          settlement_period_end: settleEndDate,
          payout_method: payoutMethod,
        }),
      });

      if (res.ok) {
        setIsSettlementModalOpen(false);
        await fetchLedgerData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSettlement(false);
    }
  };

  const filteredEntries = entries.filter((e) => {
    const matchesType = filterType === 'all' || e.entry_type === filterType;
    const matchesSearch =
      !searchQuery ||
      (e.reference_no && e.reference_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.customer_name && e.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DBD0] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E6] text-[#E07A5F] text-xs font-bold uppercase tracking-wider mb-2">
            <Receipt className="w-3.5 h-3.5" />
            <span>Universal Financial Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A]">
            {language === 'hi' ? 'वित्तीय लेजर और भुगतान' : 'Ledger, Commissions & Settlements'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {language === 'hi'
              ? 'ऑडिटेबल वित्तीय रिकॉर्ड, प्लेटफ़ॉर्म कमीशन, भुगतान और निपटान चक्र।'
              : 'Auditable transactional records, automated platform fee calculations, and scheduled payout batches.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-stone-100 p-1 rounded-xl flex text-xs font-medium">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'transactions' ? 'bg-white shadow-sm text-stone-900 font-bold' : 'text-stone-600'
              }`}
            >
              Transactions Log
            </button>
            <button
              onClick={() => setActiveTab('settlements')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'settlements' ? 'bg-white shadow-sm text-stone-900 font-bold' : 'text-stone-600'
              }`}
            >
              Settlements & Payouts ({settlements.length})
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2DBD0] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-bold tracking-wider">Gross Collection</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#0F172A]">
            {currency}{summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Settled into ledger</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2DBD0] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-bold tracking-wider">Platform Commission</span>
            <Percent className="w-4 h-4 text-[#E07A5F]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#0F172A]">
            {platformCommissionPct}%
          </p>
          <span className="text-[11px] text-stone-500 font-medium">Configurable per business</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2DBD0] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-bold tracking-wider">Staff Commissions</span>
            <ArrowUpRight className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#0F172A]">
            {currency}{summary.commissionsOwed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-blue-600 font-medium">Accrued to stylists</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2DBD0] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-bold tracking-wider">Advance Booking Deposit</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#0F172A]">
            {advancePaymentPct}%
          </p>
          <span className="text-[11px] text-purple-600 font-medium">Online booking rule</span>
        </div>
      </div>

      {/* Platform Commission & Advance Policy Controls */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#E07A5F]" />
          Configurable Platform Commission & Advance Payment Policy
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Platform Commission (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={platformCommissionPct}
              onChange={(e) => setPlatformCommissionPct(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Customer Advance Online Deposit (%)
            </label>
            <input
              type="number"
              step="1"
              value={advancePaymentPct}
              onChange={(e) => setAdvancePaymentPct(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveCommissionSettings}
              disabled={isSavingCommission}
              className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#E07A5F] text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isSavingCommission ? 'Saving...' : 'Update Policy'}
            </button>
            {commissionSuccessMsg && (
              <span className="text-xs text-emerald-700 font-semibold">{commissionSuccessMsg}</span>
            )}
          </div>
        </div>
      </div>

      {/* View Switch: Transactions vs Settlements */}
      {activeTab === 'transactions' ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-stone-200/80 shadow-sm text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search reference, notes, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
              >
                <option value="all">All Types</option>
                <option value="payment">Full Payment</option>
                <option value="deposit">Deposit</option>
                <option value="staff_commission">Staff Commission</option>
                <option value="platform_fee">Platform Fee</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 text-[#E07A5F] animate-spin" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-400">
              <Receipt className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <p className="text-sm">No transaction records found matching filters</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E2DBD0] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#E2DBD0] text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-4 px-6">Ref & Date</th>
                      <th className="py-4 px-4">Booking</th>
                      <th className="py-4 px-4">Type</th>
                      <th className="py-4 px-4">Method</th>
                      <th className="py-4 px-4">Gross</th>
                      <th className="py-4 px-4">Platform Fee</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-6 text-right">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEntries.map((e) => (
                      <tr key={e.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-mono font-bold text-slate-900">{e.reference_no || `#TXN-${e.id}`}</p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(e.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </td>

                        <td className="py-4 px-4">
                          {e.booking_id ? (
                            <div>
                              <p className="font-medium text-slate-800">Booking #{e.booking_id}</p>
                              <p className="text-[10px] text-slate-500">{e.customer_name || 'Client'}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400">Direct Entry</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              e.entry_type === 'payment'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : e.entry_type === 'deposit'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}
                          >
                            {e.entry_type.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                            {e.payment_method}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-serif font-bold text-slate-900 text-sm font-mono">
                          {currency}{Number(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-4 px-4 font-mono text-stone-500">
                          {currency}{Number(e.platform_fee_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-4 px-4">
                          <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {e.status}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right text-slate-500 text-[11px] max-w-xs truncate">
                          {e.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Settlements Payout View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Merchant Settlement Batches & Payout Records
            </h3>
            <button
              onClick={() => setIsSettlementModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#E07A5F] text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Generate Payout Batch
            </button>
          </div>

          {settlements.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-400">
              <Clock className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <p className="text-sm">No settlement batches generated yet.</p>
              <p className="text-xs text-stone-400 mt-1">Generate payout batches to disburse net balances to bank account.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-stone-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-4 px-6">Batch ID & Ref</th>
                    <th className="py-4 px-4">Period</th>
                    <th className="py-4 px-4">Gross Collected</th>
                    <th className="py-4 px-4">Platform Fee</th>
                    <th className="py-4 px-4">Net Merchant Payout</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-6 text-right">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {settlements.map((s) => (
                    <tr key={s.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-stone-900">
                        {s.reference_no || `#SETTLE-${s.id}`}
                      </td>
                      <td className="py-4 px-4 text-stone-600 font-mono text-[11px]">
                        {s.settlement_period_start?.toString().slice(0, 10)} to {s.settlement_period_end?.toString().slice(0, 10)}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-stone-800">
                        {currency}{parseFloat(String(s.gross_amount)).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 font-mono text-stone-500">
                        -{currency}{parseFloat(String(s.platform_commission)).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-emerald-700 text-sm">
                        {currency}{parseFloat(String(s.net_payout)).toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase text-[10px]">
                          {s.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-stone-600 capitalize">
                        {s.payout_method?.replace('_', ' ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Generate Settlement Modal */}
      {isSettlementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900">Generate Payout Batch</h3>
            <p className="text-xs text-stone-500">
              Calculate net payments from completed bookings minus platform commission fees.
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={settleStartDate}
                    onChange={(e) => setSettleStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={settleEndDate}
                    onChange={(e) => setSettleEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Payout Method</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                >
                  <option value="bank_transfer">Direct NEFT/RTGS Bank Transfer</option>
                  <option value="upi">Instant UPI Payout</option>
                  <option value="cheque">Manual Cheque</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsSettlementModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateSettlement}
                disabled={isGeneratingSettlement}
                className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#E07A5F] text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isGeneratingSettlement ? 'Calculating...' : 'Execute Settlement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
