import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { Branch } from '../../types/index.ts';
import {
  Building2,
  Plus,
  MapPin,
  Phone,
  Mail,
  Clock,
  Archive,
  RotateCcw,
  CheckCircle,
  ExternalLink,
  Loader2,
  Sparkles,
  MessageCircle,
  DollarSign,
  Home,
  Shield,
  Palette,
  Calendar,
  CreditCard,
  Edit2,
  X,
} from 'lucide-react';
import { Button, Input, Textarea, Select, Toggle, Badge, Card } from '../../components/ui/index.ts';

export const AdminBranchesPage: React.FC = () => {
  const { language } = useLanguage();
  const { activeBusiness, refreshBranches } = useBusiness();
  const { token } = useAuth();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [viewArchived, setViewArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [modalTab, setModalTab] = useState<'basics' | 'contact' | 'policies' | 'payments' | 'homeservice'>('basics');

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [code, setCode] = useState('');
  const [businessCategory, setBusinessCategory] = useState('unisex_salon');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [openingHours, setOpeningHours] = useState('Mon - Sun: 09:30 AM - 09:30 PM');
  const [holidays, setHolidays] = useState('National Holidays, Diwali, New Year');
  const [mapsUrl, setMapsUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [themeColor, setThemeColor] = useState('#D66A78');
  const [cancellationPolicy, setCancellationPolicy] = useState('Free cancellation up to 4 hours prior.');
  const [advanceDepositPct, setAdvanceDepositPct] = useState('20');
  const [acceptCash, setAcceptCash] = useState(true);
  const [acceptCard, setAcceptCard] = useState(true);
  const [acceptUpi, setAcceptUpi] = useState(true);
  const [upiId, setUpiId] = useState('auraluxe@upi');
  const [allowHomeService, setAllowHomeService] = useState(true);
  const [homeRadiusKm, setHomeRadiusKm] = useState('15');
  const [homeExtraFee, setHomeExtraFee] = useState('150');
  const [slotDurationMins, setSlotDurationMins] = useState('30');
  const [maxAdvanceDays, setMaxAdvanceDays] = useState('30');
  const [bufferTimeMins, setBufferTimeMins] = useState('10');
  const [parallelChairs, setParallelChairs] = useState('4');
  const [isMain, setIsMain] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBranchesList = async () => {
    setIsLoading(true);
    try {
      const bId = activeBusiness?.id || 1;
      const res = await fetch(`/api/branches?businessId=${bId}&archived=${viewArchived}`);
      if (res.ok) {
        const data = await res.json();
        setBranches(data.branches || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchesList();
  }, [activeBusiness, viewArchived]);

  const openCreateModal = () => {
    setEditingBranch(null);
    setName('');
    setSlug('');
    setCode('');
    setBusinessCategory(activeBusiness?.category || 'unisex_salon');
    setAddress('');
    setPhone('+91 98765 43210');
    setWhatsapp('+91 98765 43210');
    setEmail('outlet@auraluxe.com');
    setLatitude('');
    setLongitude('');
    setOpeningHours('Mon - Sun: 09:30 AM - 09:30 PM');
    setHolidays('National Holidays, Diwali, New Year');
    setMapsUrl('https://maps.google.com');
    setLogoUrl('');
    setCoverImage('');
    setThemeColor('#D66A78');
    setCancellationPolicy('Free cancellation up to 4 hours prior.');
    setAdvanceDepositPct('20');
    setAcceptCash(true);
    setAcceptCard(true);
    setAcceptUpi(true);
    setUpiId('auraluxe@upi');
    setAllowHomeService(true);
    setHomeRadiusKm('15');
    setHomeExtraFee('150');
    setSlotDurationMins('30');
    setMaxAdvanceDays('30');
    setBufferTimeMins('10');
    setParallelChairs('4');
    setIsMain(branches.length === 0);
    setModalTab('basics');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Branch) => {
    setEditingBranch(b);
    setName(b.name || '');
    setSlug(b.slug || '');
    setCode(b.code || '');
    setBusinessCategory(b.business_category || activeBusiness?.category || 'unisex_salon');
    setAddress(b.address || '');
    setPhone(b.phone || '');
    setWhatsapp(b.whatsapp || b.phone || '');
    setEmail(b.email || '');
    setLatitude(b.latitude ? String(b.latitude) : '');
    setLongitude(b.longitude ? String(b.longitude) : '');
    setOpeningHours(b.opening_hours || 'Mon - Sun: 09:30 AM - 09:30 PM');
    setHolidays(b.holidays || 'National Holidays');
    setMapsUrl(b.google_maps_url || '');
    setLogoUrl(b.logo_url || '');
    setCoverImage(b.cover_image || '');
    setThemeColor(b.theme_color || '#D66A78');
    setCancellationPolicy(b.cancellation_policy || 'Free cancellation up to 4 hours prior.');
    setAdvanceDepositPct(String(b.advance_deposit_pct || 20));
    setAcceptCash(b.payment_settings?.acceptCash ?? true);
    setAcceptCard(b.payment_settings?.acceptCard ?? true);
    setAcceptUpi(b.payment_settings?.acceptUpi ?? true);
    setUpiId(b.payment_settings?.upiId || 'auraluxe@upi');
    setAllowHomeService(b.home_service_settings?.allowed ?? true);
    setHomeRadiusKm(String(b.home_service_settings?.radiusKm || 15));
    setHomeExtraFee(String(b.home_service_settings?.extraFee || 150));
    setSlotDurationMins(String(b.booking_settings?.slotDurationMins || 30));
    setMaxAdvanceDays(String(b.booking_settings?.maxAdvanceDays || 30));
    setBufferTimeMins(String(b.booking_settings?.bufferTimeMins || 10));
    setParallelChairs(String(b.booking_settings?.parallelChairs || 4));
    setIsMain(b.is_main);
    setModalTab('basics');
    setIsModalOpen(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;
    setIsSubmitting(true);

    const payload = {
      business_id: activeBusiness?.id || 1,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      code: code || `BR-${Date.now().toString().slice(-4)}`,
      business_category: businessCategory,
      address,
      phone,
      whatsapp,
      email,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      opening_hours: openingHours,
      holidays,
      google_maps_url: mapsUrl,
      logo_url: logoUrl,
      cover_image: coverImage,
      theme_color: themeColor,
      cancellation_policy: cancellationPolicy,
      advance_deposit_pct: parseFloat(advanceDepositPct) || 20,
      payment_settings: {
        acceptCash,
        acceptCard,
        acceptUpi,
        upiId,
      },
      home_service_settings: {
        allowed: allowHomeService,
        radiusKm: parseInt(homeRadiusKm) || 15,
        extraFee: parseFloat(homeExtraFee) || 150,
      },
      booking_settings: {
        slotDurationMins: parseInt(slotDurationMins) || 30,
        maxAdvanceDays: parseInt(maxAdvanceDays) || 30,
        bufferTimeMins: parseInt(bufferTimeMins) || 10,
        parallelChairs: parseInt(parallelChairs) || 4,
      },
      is_main: isMain,
    };

    try {
      const url = editingBranch ? `/api/branches/${editingBranch.id}` : '/api/branches';
      const method = editingBranch ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        await fetchBranchesList();
        await refreshBranches();
      }
    } catch (err) {
      console.error('Failed to save branch:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirm('Are you sure you want to archive this branch outlet?')) return;
    try {
      const res = await fetch(`/api/branches/${id}/archive`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchBranchesList();
        await refreshBranches();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const res = await fetch(`/api/branches/${id}/restore`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchBranchesList();
        await refreshBranches();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE5DF] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4EB] text-[#C89B53] text-xs font-semibold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Multi-Tenant Outlet Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433]">
            {language === 'hi' ? 'शाखाएं और आउटलेट प्रबंधन' : 'Outlets & Branch Infrastructure'}
          </h1>
          <p className="text-xs sm:text-sm text-[#566176] mt-1">
            {language === 'hi'
              ? 'एक ही व्यवस्थापक खाते से कई आउटलेट, ब्रांडिंग, स्टाफ, नीतियां और पेमेंट गेटवे प्रबंधित करें।'
              : 'Control multiple standalone branches, localized categories, policies, and payment routing under one business umbrella.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {language === 'hi' ? '+ नया आउटलेट जोड़ें' : '+ New Outlet'}
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 p-3 glass-card rounded-2xl border border-[#EAE5DF]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewArchived(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              !viewArchived ? 'bg-[#1E2433] text-white shadow-xs' : 'text-[#566176] hover:bg-black/5'
            }`}
          >
            Active Outlets ({branches.filter((b) => !b.is_archived).length})
          </button>
          <button
            onClick={() => setViewArchived(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewArchived ? 'bg-[#1E2433] text-white shadow-xs' : 'text-[#566176] hover:bg-black/5'
            }`}
          >
            Archived ({branches.filter((b) => b.is_archived).length})
          </button>
        </div>

        <span className="text-xs text-[#8491A5] font-medium hidden sm:inline">
          {branches.length} Registered {branches.length === 1 ? 'Location' : 'Locations'}
        </span>
      </div>

      {/* Outlets Grid */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#D66A78] animate-spin" />
        </div>
      ) : branches.length === 0 ? (
        <div className="p-16 text-center glass-card rounded-3xl border border-[#EAE5DF] space-y-3">
          <Building2 className="w-12 h-12 text-[#8491A5] mx-auto" />
          <h3 className="font-serif font-bold text-base text-[#1E2433]">No Outlets Configured</h3>
          <p className="text-xs text-[#566176] max-w-sm mx-auto">
            Create your primary flagship studio and add regional branch locations.
          </p>
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            + Create First Outlet
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((b) => (
            <div
              key={b.id}
              className={`glass-card rounded-3xl p-6 border transition-all hover-lift flex flex-col justify-between ${
                b.is_main ? 'border-[#D66A78]/50 ring-1 ring-[#D66A78]/30' : 'border-[#EAE5DF]'
              } ${b.is_archived ? 'opacity-60 bg-stone-100' : ''}`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-[#1E2433] text-base">{b.name}</h3>
                      {b.is_main && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FDF2F3] text-[#D66A78] font-bold border border-[#D66A78]/30">
                          Flagship
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#8491A5] mt-0.5">
                      <span>Code: {b.code}</span>
                      {b.slug && (
                        <>
                          <span>·</span>
                          <span>/{b.slug}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(b)}
                      title="Edit outlet details"
                      className="p-1.5 text-[#8491A5] hover:text-[#1E2433] rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!viewArchived ? (
                      <button
                        onClick={() => handleArchive(b.id)}
                        title="Archive branch"
                        className="p-1.5 text-[#8491A5] hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestore(b.id)}
                        title="Restore branch"
                        className="p-1.5 text-[#8491A5] hover:text-emerald-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-[#566176] pt-3 border-t border-[#EAE5DF]">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#D66A78] shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{b.address}</span>
                  </div>

                  {b.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#8491A5] shrink-0" />
                      <span>{b.phone}</span>
                    </div>
                  )}

                  {b.whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>WhatsApp: {b.whatsapp}</span>
                    </div>
                  )}

                  {b.opening_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#C89B53] shrink-0" />
                      <span className="truncate">{b.opening_hours}</span>
                    </div>
                  )}

                  {/* Badges / Policy highlights */}
                  <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-[#1E2433] font-medium">
                      Deposit: {b.advance_deposit_pct ?? 20}%
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium">
                      Doorstep: {b.home_service_settings?.allowed ? 'Enabled' : 'Disabled'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                      Slot: {b.booking_settings?.slotDurationMins || 30}m
                    </span>
                  </div>
                </div>
              </div>

              {b.google_maps_url && (
                <div className="pt-4 mt-3 border-t border-[#EAE5DF]/60">
                  <a
                    href={b.google_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#D66A78] hover:underline font-semibold text-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Google Maps Navigation
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Comprehensive Multi-Tenant Outlet Configuration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FAF8F5] rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-[#EAE5DF] space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#EAE5DF] pb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1E2433]">
                  {editingBranch ? 'Edit Branch Outlet Configuration' : 'Provision New Branch Outlet'}
                </h3>
                <p className="text-xs text-[#566176]">
                  Configure multi-tenant outlet settings, location coordinates, policies, and payment routing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-[#8491A5] hover:text-[#1E2433] hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-[#EAE5DF] pb-2 text-xs overflow-x-auto">
              {[
                { id: 'basics', label: '1. Identity & Brand' },
                { id: 'contact', label: '2. Contact & Location' },
                { id: 'policies', label: '3. Booking & Policies' },
                { id: 'payments', label: '4. Payment Settings' },
                { id: 'homeservice', label: '5. Home Service' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setModalTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    modalTab === tab.id
                      ? 'bg-[#1E2433] text-white shadow-xs'
                      : 'text-[#566176] hover:bg-black/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-4 overflow-y-auto flex-1 pr-1">
              {/* Tab 1: Basics & Identity */}
              {modalTab === 'basics' && (
                <div className="space-y-3 animate-fade-in">
                  <Input
                    label="Outlet Name *"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Indiranagar Flagship Studio"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Unique URL Slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. indiranagar-flagship"
                      helperText="Used for branch-specific direct booking URLs"
                    />
                    <Input
                      label="Branch Code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="e.g. BR-BLR-01"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select
                      label="Business Category"
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                    >
                      <option value="unisex_salon">Unisex Salon</option>
                      <option value="barber_shop">Barber Shop</option>
                      <option value="hair_salon">Hair Salon</option>
                      <option value="spa_ayurvedic">Luxury Spa & Ayurvedic Center</option>
                      <option value="tattoo_piercing">Tattoo & Piercing Studio</option>
                      <option value="aesthetic_clinic">Aesthetic & Skin Clinic</option>
                    </Select>

                    <Input
                      label="Theme Accent Color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      placeholder="#D66A78"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isMainOutlet"
                      checked={isMain}
                      onChange={(e) => setIsMain(e.target.checked)}
                      className="rounded border-[#EAE5DF] text-[#D66A78] focus:ring-[#D66A78]"
                    />
                    <label htmlFor="isMainOutlet" className="text-xs text-[#1E2433] font-semibold cursor-pointer">
                      Designate as Flagship / Main Outlet
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 2: Contact & Location */}
              {modalTab === 'contact' && (
                <div className="space-y-3 animate-fade-in">
                  <Textarea
                    label="Physical Address *"
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Floor, building, street, locality, landmark, city, pin code"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Desk Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98450 11223"
                    />
                    <Input
                      label="WhatsApp Number"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+91 98450 11223"
                    />
                    <Input
                      label="Outlet Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="branch@auraluxe.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Latitude"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="12.9716"
                    />
                    <Input
                      label="Longitude"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="77.5946"
                    />
                  </div>

                  <Input
                    label="Google Maps Direct Link"
                    type="url"
                    value={mapsUrl}
                    onChange={(e) => setMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/..."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Opening Hours"
                      value={openingHours}
                      onChange={(e) => setOpeningHours(e.target.value)}
                      placeholder="Mon-Sun: 09:30 AM - 09:30 PM"
                    />
                    <Input
                      label="Annual Holidays (Excluded Dates)"
                      value={holidays}
                      onChange={(e) => setHolidays(e.target.value)}
                      placeholder="Diwali, Holi, New Year"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Policies & Booking Rules */}
              {modalTab === 'policies' && (
                <div className="space-y-3 animate-fade-in">
                  <Textarea
                    label="Cancellation & Rescheduling Policy"
                    rows={2}
                    value={cancellationPolicy}
                    onChange={(e) => setCancellationPolicy(e.target.value)}
                    placeholder="e.g. Free cancellation up to 4 hours before service."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Advance Deposit Required (%)"
                      type="number"
                      min={0}
                      max={100}
                      value={advanceDepositPct}
                      onChange={(e) => setAdvanceDepositPct(e.target.value)}
                      placeholder="20"
                    />
                    <Input
                      label="Slot Duration (Minutes)"
                      type="number"
                      value={slotDurationMins}
                      onChange={(e) => setSlotDurationMins(e.target.value)}
                      placeholder="30"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Buffer Time Between Slots (Minutes)"
                      type="number"
                      value={bufferTimeMins}
                      onChange={(e) => setBufferTimeMins(e.target.value)}
                      placeholder="10"
                    />
                    <Input
                      label="Parallel Stations / Service Capacity"
                      type="number"
                      value={parallelChairs}
                      onChange={(e) => setParallelChairs(e.target.value)}
                      placeholder="4"
                    />
                  </div>

                  <Input
                    label="Maximum Booking Advance Horizon (Days)"
                    type="number"
                    value={maxAdvanceDays}
                    onChange={(e) => setMaxAdvanceDays(e.target.value)}
                    placeholder="30"
                  />
                </div>
              )}

              {/* Tab 4: Payment Routing Settings */}
              {modalTab === 'payments' && (
                <div className="space-y-3 animate-fade-in">
                  <p className="text-xs text-[#566176]">
                    Configure which payment methods this branch accepts for counter settlements and advance deposits.
                  </p>

                  <div className="space-y-2 p-3 bg-white rounded-2xl border border-[#EAE5DF]">
                    <Toggle
                      checked={acceptCash}
                      onChange={setAcceptCash}
                      label="Accept Cash at Venue"
                      description="Allow clients to pay remaining balance in cash"
                    />
                    <Toggle
                      checked={acceptCard}
                      onChange={setAcceptCard}
                      label="Accept Credit/Debit Cards / POS Terminal"
                      description="Enable in-store card swipe terminal checkout"
                    />
                    <Toggle
                      checked={acceptUpi}
                      onChange={setAcceptUpi}
                      label="Accept Instant UPI QR Code"
                      description="Generate dynamic or static UPI QR codes"
                    />
                  </div>

                  <Input
                    label="Outlet UPI ID / VPA"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="branch.outlet@okhdfcbank"
                    helperText="Receives direct UPI payments from checkout QR codes"
                  />
                </div>
              )}

              {/* Tab 5: Doorstep Home Service Settings */}
              {modalTab === 'homeservice' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="p-3 bg-white rounded-2xl border border-[#EAE5DF]">
                    <Toggle
                      checked={allowHomeService}
                      onChange={setAllowHomeService}
                      label="Enable Doorstep Home Service for this Outlet"
                      description="Specialists can travel to customer residences within the service radius"
                    />
                  </div>

                  {allowHomeService && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Service Radius (Kilometers)"
                        type="number"
                        value={homeRadiusKm}
                        onChange={(e) => setHomeRadiusKm(e.target.value)}
                        placeholder="15"
                      />
                      <Input
                        label="Travel & Convenience Surcharge (₹)"
                        type="number"
                        value={homeExtraFee}
                        onChange={(e) => setHomeExtraFee(e.target.value)}
                        placeholder="150"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-[#EAE5DF]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSubmitting}
                  >
                    {editingBranch ? 'Save Outlet Settings' : 'Provision Outlet'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
