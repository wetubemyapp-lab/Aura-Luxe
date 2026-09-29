import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { CouponItem, OfferItem } from '../../types/index.ts';
import { Ticket, Sparkles, Plus, Trash2, CheckCircle2, Tag } from 'lucide-react';

interface AdminMarketingPageProps {
  viewMode: 'offers' | 'coupons';
}

export const AdminMarketingPage: React.FC<AdminMarketingPageProps> = ({ viewMode }) => {
  const { token } = useAuth();
  const { activeBusiness } = useBusiness();
  const { language, t } = useLanguage();

  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minSpend, setMinSpend] = useState('500');

  // Festival Offer Form states
  const [offerTitle, setOfferTitle] = useState('');
  const [offerSubtitle, setOfferSubtitle] = useState('');
  const [festivalTag, setFestivalTag] = useState('Diwali');
  const [offerDesc, setOfferDesc] = useState('');
  const [bannerImage, setBannerImage] = useState('https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80');
  const [offerDiscount, setOfferDiscount] = useState('20');
  const [offerDiscountType, setOfferDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [offerCouponCode, setOfferCouponCode] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const currency = activeBusiness?.primary_currency || '₹';

  const FESTIVAL_OPTIONS = [
    'Diwali',
    'Holi',
    'Valentine',
    'Wedding Season',
    'New Year',
    'Eid',
    'Raksha Bandhan',
    'Karwa Chauth',
    'Custom Festival',
  ];

  const fetchData = async () => {
    try {
      const bId = activeBusiness?.id || 1;
      const [coupRes, offRes] = await Promise.all([
        fetch(`/api/coupons?businessId=${bId}`),
        fetch(`/api/offers?businessId=${bId}`),
      ]);

      if (coupRes.ok) {
        const coupData = await coupRes.json();
        setCoupons(coupData.coupons);
      }
      if (offRes.ok) {
        const offData = await offRes.json();
        setOffers(offData.offers);
      }
    } catch (err) {
      console.error('Failed to load marketing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeBusiness]);

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness?.id || 1,
          code: code.trim().toUpperCase(),
          discount_type: discountType,
          discount_value: parseFloat(discountValue),
          min_spend: parseFloat(minSpend) || 0,
        }),
      });

      if (res.ok) {
        setCode('');
        setDiscountValue('');
        setShowAddForm(false);
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to add coupon:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness?.id || 1,
          title: offerTitle,
          subtitle: offerSubtitle,
          festival_tag: festivalTag,
          description: offerDesc,
          banner_image: bannerImage,
          discount_type: offerDiscountType,
          discount_value: parseFloat(offerDiscount) || 0,
          coupon_code: offerCouponCode.trim().toUpperCase(),
          start_at: startAt || null,
          end_at: endAt || null,
          is_featured: true,
          is_active: true,
        }),
      });

      if (res.ok) {
        setOfferTitle('');
        setOfferSubtitle('');
        setOfferDesc('');
        setOfferCouponCode('');
        setShowAddForm(false);
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to add festival offer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveOffer = async (offerId: number) => {
    if (!confirm('Are you sure you want to archive or remove this offer banner?')) return;
    try {
      const res = await fetch(`/api/offers/${offerId}/archive`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to archive offer:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DBD0] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E6] text-[#E07A5F] text-xs font-bold uppercase tracking-wider mb-2">
            <Ticket className="w-3.5 h-3.5" />
            <span>Customer Acquisition & Incentives</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A]">
            {viewMode === 'coupons'
              ? language === 'hi' ? 'डिस्काउंट कूपन और वाउचर' : 'Coupons & Promo Vouchers'
              : language === 'hi' ? 'मौसमी ऑफर्स और अभियान' : 'Promotional Offers & Campaigns'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {language === 'hi'
              ? 'ग्राहकों के लिए विशेष छूट कोड और मौसमी अभियानों को प्रबंधित करें'
              : 'Create redeemable booking discount codes validated in real-time by the Universal Booking Engine.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 bg-[#E07A5F] hover:bg-[#D47055] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : viewMode === 'coupons' ? 'Create Coupon' : 'Create Offer'}</span>
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={viewMode === 'coupons' ? handleAddCoupon : handleAddOffer}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E07A5F]/40 shadow-lg space-y-4 animate-fade-in"
        >
          <h3 className="text-lg font-serif font-bold text-[#0F172A]">
            {viewMode === 'coupons' ? 'Create New Promo Coupon' : 'Create Seasonal Campaign'}
          </h3>

          {viewMode === 'coupons' ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. LUXE25"
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Cash Amount ({currency})</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Value ({discountType === 'percentage' ? '%' : currency})
                </label>
                <input
                  type="number"
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="20"
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Min Spend ({currency})</label>
                <input
                  type="number"
                  value={minSpend}
                  onChange={(e) => setMinSpend(e.target.value)}
                  placeholder="500"
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Festival / Celebration</label>
                  <select
                    value={festivalTag}
                    onChange={(e) => setFestivalTag(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs font-bold text-[#E07A5F] focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                  >
                    {FESTIVAL_OPTIONS.map((f) => (
                      <option key={f} value={f}>🎉 {f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Headline</label>
                  <input
                    type="text"
                    required
                    value={offerTitle}
                    onChange={(e) => setOfferTitle(e.target.value)}
                    placeholder="e.g. Grand Diwali Radiance Pamper Package"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sub-headline</label>
                  <input
                    type="text"
                    value={offerSubtitle}
                    onChange={(e) => setOfferSubtitle(e.target.value)}
                    placeholder="e.g. Free Hair Spa + 25% Off Festive Services"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={offerDiscountType}
                    onChange={(e) => setOfferDiscountType(e.target.value as any)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount ({currency})</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discount Value ({offerDiscountType === 'percentage' ? '%' : currency})
                  </label>
                  <input
                    type="number"
                    value={offerDiscount}
                    onChange={(e) => setOfferDiscount(e.target.value)}
                    placeholder="25"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Linked Promo Coupon Code</label>
                  <input
                    type="text"
                    value={offerCouponCode}
                    onChange={(e) => setOfferCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. DIWALI25"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign End Date (Countdown)</label>
                  <input
                    type="date"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Festival Banner Image URL</label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                  />
                  {bannerImage && (
                    <button
                      type="button"
                      onClick={() => setBannerImage('')}
                      className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all"
                    >
                      Remove Banner
                    </button>
                  )}
                </div>
                {bannerImage && (
                  <div className="mt-2 h-24 rounded-2xl overflow-hidden border border-[#E2DBD0] relative group">
                    <img src={bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white text-xs font-bold">
                      Banner Preview
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Terms & Highlights</label>
                <textarea
                  rows={2}
                  value={offerDesc}
                  onChange={(e) => setOfferDesc(e.target.value)}
                  placeholder="Offer details, complementary treatments included, and booking guidelines..."
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {submitting ? 'Saving to Database...' : 'Save & Activate'}
          </button>
        </form>
      )}

      {/* Grid listing */}
      {viewMode === 'coupons' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-[#E2DBD0] p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-md bg-[#FAF0E6] text-[#E07A5F]">
                    {c.code}
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold">Active</span>
                </div>

                <h3 className="font-serif font-bold text-xl text-[#0F172A] mt-2">
                  {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `${currency}${c.discount_value} OFF`}
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Valid on bookings with minimum spend of {currency}{Number(c.min_spend).toLocaleString()}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Universal Booking Engine Validated</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-3xl border border-[#E2DBD0] overflow-hidden shadow-xs flex flex-col justify-between group hover:border-[#E07A5F]/60 transition-all"
            >
              {o.banner_image && (
                <div className="h-36 relative overflow-hidden bg-slate-100">
                  <img src={o.banner_image} alt={o.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-amber-400/30">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{o.festival_tag || 'Festival Special'}</span>
                  </div>
                  {o.valid_until && (
                    <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-mono">
                      Ends: {o.valid_until.toString().slice(0, 10)}
                    </div>
                  )}
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-[#E07A5F] tracking-wider px-2 py-0.5 rounded-md bg-[#FAF0E6]">
                    {o.discount_type === 'flat' ? `${currency}${o.discount_value} OFF` : `${o.discount_pct || o.discount_value || 20}% OFF`}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                    Active
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg text-[#0F172A]">{o.title}</h3>
                {o.subtitle && <p className="text-xs font-medium text-[#E07A5F] mt-0.5">{o.subtitle}</p>}
                <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">{o.description}</p>

                {(o.coupon_code || o.code) && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-mono font-bold">
                    <Tag className="w-3.5 h-3.5 text-[#E07A5F]" />
                    <span>Code: {o.coupon_code || o.code}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Festival Campaign</span>
                <button
                  type="button"
                  onClick={() => handleArchiveOffer(o.id)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                  title="Remove Offer Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
