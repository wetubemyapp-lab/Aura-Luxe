import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Business } from '../../types/index.ts';
import {
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  Image,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  Sliders,
  DollarSign,
  ShieldCheck,
  Check
} from 'lucide-react';

const CATEGORY_PRESETS = [
  { id: 'unisex_salon', label: 'Unisex Salon & Luxury Spa' },
  { id: 'barber_shop', label: 'Barber Shop & Men\'s Grooming' },
  { id: 'hair_salon', label: 'Luxury Hair Salon & Studio' },
  { id: 'beauty_parlour', label: 'Beauty Parlour & Esthetics' },
  { id: 'spa_wellness', label: 'Ayurvedic Spa & Wellness Retreat' },
  { id: 'massage_center', label: 'Therapeutic Massage Center' },
  { id: 'tattoo_studio', label: 'Tattoo & Custom Body Art Studio' },
  { id: 'nail_studio', label: 'Couture Nail Art & Spa Studio' },
  { id: 'makeup_bridal', label: 'Bridal & Professional Makeup Studio' },
];

export const AdminWebsitePage: React.FC = () => {
  const { activeBusiness, updateSettings } = useBusiness();
  const { language, t } = useLanguage();

  const [formData, setFormData] = useState<Partial<Business>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeBusiness) {
      setFormData({
        name: activeBusiness.name,
        category: activeBusiness.category,
        tagline: activeBusiness.tagline || '',
        tagline_hi: activeBusiness.tagline_hi || '',
        phone: activeBusiness.phone || '',
        email: activeBusiness.email || '',
        address: activeBusiness.address || '',
        opening_hours: activeBusiness.opening_hours || '',
        about_text: activeBusiness.about_text || '',
        about_text_hi: activeBusiness.about_text_hi || '',
        banner_url: activeBusiness.banner_url || '',
        logo_url: activeBusiness.logo_url || '',
        primary_currency: activeBusiness.primary_currency || '₹',
        theme_accent: activeBusiness.theme_accent || '#E07A5F',
        tax_rate: activeBusiness.tax_rate || 5.0,
        slot_interval_mins: activeBusiness.slot_interval_mins || 30,
        buffer_time_mins: activeBusiness.buffer_time_mins || 15,
        deposit_required: activeBusiness.deposit_required || false,
        deposit_percentage: activeBusiness.deposit_percentage || 20.0,
        features_config: activeBusiness.features_config || {
          allowAddons: true,
          requireDeposit: false,
          showStaffSelection: true,
          enableCoupons: true,
        },
      });
    }
  }, [activeBusiness]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    const res = await updateSettings(formData);
    setIsSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setError(res.error || 'Failed to update settings');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DBD0] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E6] text-[#E07A5F] text-xs font-bold uppercase tracking-wider mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Universal Business Engine Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A]">
            {language === 'hi' ? 'व्यवसाय नियम एवं ब्रांडिंग' : 'Business Rules & Website Configuration'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {language === 'hi'
              ? 'श्रेणी, शेड्यूलिंग नियम, अग्रिम जमा नीति और सामग्री को एक ही इंजन से नियंत्रित करें'
              : 'Control business archetype, scheduling buffers, deposit enforcement, tax policies, and bilingual narrative.'}
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-6 py-3 bg-[#E07A5F] hover:bg-[#D47055] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : t('save_changes')}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Universal configuration successfully updated in PostgreSQL! The booking engine and customer experience adapt immediately.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Business Archetype & Category Preset */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2DBD0] shadow-xs space-y-4">
            <h3 className="text-base font-serif font-bold text-[#0F172A] border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#E07A5F]" />
              <span>Universal Category Archetype</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Category Preset
                </label>
                <select
                  value={formData.category || 'unisex_salon'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                >
                  {CATEGORY_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Trading / Display Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tagline (English)
                </label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tagline (Hindi / हिन्दी)
                </label>
                <input
                  type="text"
                  value={formData.tagline_hi || ''}
                  onChange={(e) => setFormData({ ...formData, tagline_hi: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                />
              </div>
            </div>
          </div>

          {/* Operational Engine & Scheduling Rules */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2DBD0] shadow-xs space-y-4">
            <h3 className="text-base font-serif font-bold text-[#0F172A] border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#E07A5F]" />
              <span>Scheduling Engine & Capacity Rules</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Slot Interval (Minutes)
                </label>
                <select
                  value={formData.slot_interval_mins || 30}
                  onChange={(e) => setFormData({ ...formData, slot_interval_mins: Number(e.target.value) })}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                >
                  <option value={15}>15 mins (Quick Turnaround / Barbers)</option>
                  <option value={20}>20 mins</option>
                  <option value={30}>30 mins (Standard Salon)</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins (Spa / Tattoos / Long)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Buffer Time Between (Mins)
                </label>
                <select
                  value={formData.buffer_time_mins || 15}
                  onChange={(e) => setFormData({ ...formData, buffer_time_mins: Number(e.target.value) })}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                >
                  <option value={5}>5 mins (Sanitize & Reset)</option>
                  <option value={10}>10 mins</option>
                  <option value={15}>15 mins (Standard)</option>
                  <option value={20}>20 mins</option>
                  <option value={30}>30 mins (Deep Sterilization)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tax Rate % (GST / Service)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.tax_rate ?? 5.0}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                />
              </div>
            </div>

            {/* Deposit Enforcement Policy */}
            <div className="pt-2 p-4 bg-[#FAF7F2] border border-[#E2DBD0] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Enforce Mandatory Booking Deposit</p>
                  <p className="text-[10px] text-slate-500">Essential for Tattoo studios, High-end Bridal packages, or Spas</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.deposit_required || false}
                  onChange={(e) => setFormData({ ...formData, deposit_required: e.target.checked })}
                  className="w-4 h-4 accent-[#E07A5F] cursor-pointer"
                />
              </div>

              {formData.deposit_required && (
                <div className="pt-2 border-t border-slate-200 flex items-center gap-3">
                  <label className="text-xs text-slate-700 font-semibold whitespace-nowrap">
                    Deposit Percentage (%):
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={formData.deposit_percentage ?? 20}
                    onChange={(e) => setFormData({ ...formData, deposit_percentage: parseFloat(e.target.value) || 20 })}
                    className="w-24 p-1.5 bg-white border border-[#E2DBD0] rounded-lg text-xs font-bold text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500">Calculated on gross appointment total</span>
                </div>
              )}
            </div>
          </div>

          {/* Bilingual Narrative & Image Presentation */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2DBD0] shadow-xs space-y-4">
            <h3 className="text-base font-serif font-bold text-[#0F172A] border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E07A5F]" />
              <span>Bilingual Story & About Presentation</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                About Story Narrative (English)
              </label>
              <textarea
                rows={3}
                value={formData.about_text || ''}
                onChange={(e) => setFormData({ ...formData, about_text: e.target.value })}
                className="w-full p-3 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                About Story Narrative (Hindi / हिन्दी)
              </label>
              <textarea
                rows={3}
                value={formData.about_text_hi || ''}
                onChange={(e) => setFormData({ ...formData, about_text_hi: e.target.value })}
                className="w-full p-3 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
              />
            </div>
          </div>

          {/* Visual Assets */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2DBD0] shadow-xs space-y-4">
            <h3 className="text-base font-serif font-bold text-[#0F172A] border-b border-slate-100 pb-3 flex items-center gap-2">
              <Image className="w-4 h-4 text-[#E07A5F]" />
              <span>Media & Visual Identity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Image URL</label>
                <input
                  type="text"
                  value={formData.banner_url || ''}
                  onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Logo URL</label>
                <input
                  type="text"
                  value={formData.logo_url || ''}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Engine Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0F172A] text-white p-6 rounded-3xl shadow-xl sticky top-24 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <span className="text-xs uppercase font-bold text-[#E07A5F] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Active Tenant Engine
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Live</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold text-white capitalize">{formData.category?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Slot Size:</span>
                <span className="font-semibold text-white">{formData.slot_interval_mins} mins</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Buffer Gap:</span>
                <span className="font-semibold text-white">{formData.buffer_time_mins} mins</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Deposit Rule:</span>
                <span className="font-semibold text-[#E07A5F]">
                  {formData.deposit_required ? `${formData.deposit_percentage}% Mandatory` : 'None (Pay at venue)'}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Applicable Tax:</span>
                <span className="font-semibold text-white">{formData.tax_rate}%</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-[#E07A5F] hover:bg-[#D47055] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : t('save_changes')}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
