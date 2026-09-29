import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { BUSINESS_CATEGORIES, getCategoryConfig } from '../../utils/categoryEngine.ts';
import {
  Settings,
  Database,
  Building2,
  Check,
  Sparkles,
  Sliders,
  Shield,
  Clock,
  DollarSign,
  FileText,
  UserCheck,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Button, Input, Select, Toggle, Badge, Card } from '../../components/ui/index.ts';

export const AdminSettingsPage: React.FC = () => {
  const { businesses, activeBusiness, selectBusiness, updateSettings, categoryConfig } = useBusiness();
  const { language } = useLanguage();

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>(
    activeBusiness?.category || 'unisex_salon'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const previewConfig = getCategoryConfig(selectedCategoryKey);

  const handleApplyCategoryPreset = async () => {
    if (!activeBusiness) return;
    setIsSaving(true);
    setSuccessMsg(null);

    const preset = getCategoryConfig(selectedCategoryKey);

    const result = await updateSettings({
      category: selectedCategoryKey,
      tagline: preset.taglineDefault,
      tagline_hi: preset.taglineDefaultHi,
      deposit_percentage: preset.defaultDepositPct,
      advance_payment_percentage: preset.defaultDepositPct,
      slot_interval_mins: preset.defaultSlotMins,
      buffer_time_mins: preset.defaultBufferMins,
      features_config: {
        ...activeBusiness.features_config,
        ageVerification: preset.formFields.ageVerificationRequired,
        consentWaiver: preset.formFields.consentWaiverRequired,
        designUpload: preset.formFields.designUpload,
        medicalContraindications: preset.formFields.medicalContraindications,
        consultationFirst: preset.formFields.consultationRequired,
      },
    });

    setIsSaving(false);
    if (result.success) {
      setSuccessMsg(`Successfully configured as ${preset.displayName}! Terminology & booking rules updated.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-[#EAE5DF] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4EB] text-[#C89B53] text-xs font-bold uppercase tracking-wider mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>Category & Platform Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433]">
          {language === 'hi' ? 'व्यवसाय विन्यास एवं श्रेणी इंजन' : 'Business Configuration Engine'}
        </h1>
        <p className="text-[#566176] text-xs sm:text-sm mt-1">
          {language === 'hi'
            ? 'एक ही कोडबेस से बार्बर, सैलून, स्पा, टैटू, ब्यूटी और क्लिनिक के लिए शब्दावली और नीतियां अनुकूलित करें।'
            : 'Configure specialist terms, booking workflows, consent waivers, age verification, and resource profiles on the fly.'}
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Category Engine Preset Switcher */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#EAE5DF] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE5DF] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FDF2F3] text-[#D66A78] flex items-center justify-center border border-[#D66A78]/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#1E2433]">
                Domain Category Presets
              </h3>
              <p className="text-xs text-[#566176]">
                Selecting a category adapts booking terminology, specialized forms & resource settings
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleApplyCategoryPreset}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Apply Preset to Business
          </Button>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.values(BUSINESS_CATEGORIES).map((cat) => {
            const isSelected = selectedCategoryKey === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryKey(cat.id)}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? 'border-[#D66A78] bg-[#FDF2F3]/60 ring-2 ring-[#D66A78] shadow-sm'
                    : 'border-[#EAE5DF] bg-white hover:border-[#D66A78]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8491A5]">
                    {cat.id.toUpperCase()}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-[#D66A78]" />}
                </div>
                <h4 className="font-serif font-bold text-xs text-[#1E2433] leading-snug">
                  {cat.displayName.split('&')[0]}
                </h4>
                <p className="text-[10px] text-[#566176] mt-1 line-clamp-1">
                  {cat.specialistTerm}
                </p>
              </button>
            );
          })}
        </div>

        {/* Real-time Category Engine Inspector */}
        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DF] space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-[#EAE5DF] pb-2">
            <span className="font-serif font-bold text-sm text-[#1E2433] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C89B53]" />
              Active Engine Rules for: {previewConfig.displayName}
            </span>
            <Badge variant="accent" size="xs">Live Preview</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-xl border border-[#EAE5DF] space-y-1">
              <span className="text-[10px] text-[#8491A5] uppercase font-bold">Specialist Terminology</span>
              <p className="font-semibold text-[#1E2433]">{previewConfig.specialistTerm}</p>
              <p className="text-[11px] text-[#566176] font-serif">Hindi: {previewConfig.specialistTermHi}</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#EAE5DF] space-y-1">
              <span className="text-[10px] text-[#8491A5] uppercase font-bold">Booking Terminology</span>
              <p className="font-semibold text-[#1E2433]">{previewConfig.bookingTerm}</p>
              <p className="text-[11px] text-[#566176] font-serif">Venue Unit: {previewConfig.venueTerm}</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#EAE5DF] space-y-1">
              <span className="text-[10px] text-[#8491A5] uppercase font-bold">Resource Profile</span>
              <p className="font-semibold text-[#1E2433]">{previewConfig.resourceRequirement.label}</p>
              <p className="text-[11px] text-emerald-700 font-medium">
                Sterilization: {previewConfig.resourceRequirement.sterilizationMandatory ? 'Mandatory' : 'Standard'}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#EAE5DF] flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#1E2433]">Activated Form Fields:</span>
            {previewConfig.formFields.ageVerificationRequired && (
              <Badge variant="error" size="xs">18+ Legal Age Check</Badge>
            )}
            {previewConfig.formFields.consentWaiverRequired && (
              <Badge variant="warning" size="xs">Digital Consent Waiver</Badge>
            )}
            {previewConfig.formFields.designUpload && (
              <Badge variant="info" size="xs">Design Reference Upload</Badge>
            )}
            {previewConfig.formFields.bodyPlacement && (
              <Badge variant="accent" size="xs">Body Placement Zone</Badge>
            )}
            {previewConfig.formFields.hairLength && (
              <Badge variant="gold" size="xs">Hair Length Specification</Badge>
            )}
            {previewConfig.formFields.skinType && (
              <Badge variant="default" size="xs">Skin Type Analysis</Badge>
            )}
            {previewConfig.formFields.medicalContraindications && (
              <Badge variant="warning" size="xs">Medical Allergies Note</Badge>
            )}
            {previewConfig.formFields.consultationRequired && (
              <Badge variant="info" size="xs">Pre-Session Consultation</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Tenant Instances */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#EAE5DF] space-y-6">
        <div className="flex items-center justify-between border-b border-[#EAE5DF] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF4EB] text-[#C89B53] flex items-center justify-center border border-[#C89B53]/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#1E2433]">
                Tenant Business Organizations
              </h3>
              <p className="text-xs text-[#566176]">
                Switch active tenant organization in real-time
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm">
            {businesses.length} Active Organizations
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {businesses.map((b) => {
            const isSelected = activeBusiness?.id === b.id;
            return (
              <div
                key={b.id}
                onClick={() => selectBusiness(b.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#1E2433] text-white border-[#1E2433] shadow-md'
                    : 'bg-white/80 border-[#EAE5DF] hover:border-[#D66A78] text-[#1E2433]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isSelected ? 'bg-[#D66A78] text-white' : 'bg-stone-100 text-[#566176] border border-stone-200'
                    }`}
                  >
                    {b.category?.replace('_', ' ')}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </div>

                <h4 className="font-serif font-bold text-base leading-tight">{b.name}</h4>
                <p className={`text-xs mt-1 line-clamp-1 ${isSelected ? 'text-stone-300' : 'text-[#566176]'}`}>
                  {b.tagline}
                </p>

                <div
                  className={`mt-4 pt-3 border-t text-[11px] flex justify-between ${
                    isSelected ? 'border-stone-700 text-stone-300' : 'border-[#EAE5DF] text-[#8491A5]'
                  }`}
                >
                  <span>Currency: {b.primary_currency}</span>
                  <span>Slots: {b.slot_interval_mins}m</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Database Diagnostic & Architecture */}
      <div className="bg-[#1E2433] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-700 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base">Relational Database Diagnostics</h3>
            <p className="text-xs text-stone-400">PostgreSQL (PGlite file-backed storage cluster)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-stone-400 block text-[10px] uppercase font-bold">Database Engine</span>
            <span className="font-semibold text-emerald-400">PostgreSQL 16 Engine</span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-stone-400 block text-[10px] uppercase font-bold">Category Engine</span>
            <span className="font-semibold text-[#D66A78] capitalize">{activeBusiness?.category || 'Unisex Salon'}</span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-stone-400 block text-[10px] uppercase font-bold">Audit Trails</span>
            <span className="font-semibold text-emerald-400">Synchronous Real-Time</span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-stone-400 block text-[10px] uppercase font-bold">Tenancy Isolation</span>
            <span className="font-semibold text-[#C89B53]">Business Organization Keyed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
