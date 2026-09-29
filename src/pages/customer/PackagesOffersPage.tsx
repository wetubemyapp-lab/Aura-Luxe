import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { PackageItem, OfferItem, CouponItem } from '../../types/index.ts';
import { Sparkles, Tag, Gift, Check, Clock, ArrowRight, Copy, CheckCheck, Loader2 } from 'lucide-react';
import { Button, Badge } from '../../components/ui/index.ts';

export interface PackagesOffersPageProps {
  initialTab?: 'packages' | 'offers' | 'coupons';
  onNavigateToBooking: (serviceId?: number) => void;
}

export const PackagesOffersPage: React.FC<PackagesOffersPageProps> = ({
  initialTab = 'packages',
  onNavigateToBooking,
}) => {
  const { activeBusiness } = useBusiness();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'packages' | 'offers' | 'coupons'>(initialTab);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const currency = activeBusiness?.primary_currency || '₹';

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    async function loadMarketingData() {
      if (!activeBusiness) return;
      setLoading(true);
      try {
        const bId = activeBusiness.id;
        const [pkgRes, offRes, cpnRes] = await Promise.all([
          fetch(`/api/packages?businessId=${bId}`),
          fetch(`/api/offers?businessId=${bId}`),
          fetch(`/api/coupons?businessId=${bId}`),
        ]);

        if (pkgRes.ok && pkgRes.headers.get('content-type')?.includes('application/json')) {
          const d = await pkgRes.json();
          setPackages(d.packages || []);
        }
        if (offRes.ok && offRes.headers.get('content-type')?.includes('application/json')) {
          const d = await offRes.json();
          setOffers(d.offers || []);
        }
        if (cpnRes.ok && cpnRes.headers.get('content-type')?.includes('application/json')) {
          const d = await cpnRes.json();
          setCoupons(d.coupons || []);
        }
      } catch (err) {
        console.error('Failed to load packages/offers/coupons:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMarketingData();
  }, [activeBusiness]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF4EB] text-[#C89B53] text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Value & Rewards</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#1E2433] tracking-tight">
          Packages, Offers & Vouchers
        </h1>
        <p className="text-sm sm:text-base text-[#566176] font-light">
          Unlock signature ritual bundles, seasonal rewards, and promotional coupon codes for your next reservation.
        </p>
      </div>

      {/* Nav Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 glass-card rounded-2xl border border-[#EAE5DF]">
          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'packages'
                ? 'bg-[#1E2433] text-white shadow-sm'
                : 'text-[#566176] hover:text-[#1E2433]'
            }`}
          >
            Signature Packages ({packages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('offers')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'offers'
                ? 'bg-[#1E2433] text-white shadow-sm'
                : 'text-[#566176] hover:text-[#1E2433]'
            }`}
          >
            Special Offers ({offers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coupons')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'coupons'
                ? 'bg-[#1E2433] text-white shadow-sm'
                : 'text-[#566176] hover:text-[#1E2433]'
            }`}
          >
            Promo Coupons ({coupons.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#D66A78] animate-spin" />
        </div>
      ) : (
        <>
          {/* TAB 1: Packages */}
          {activeTab === 'packages' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="glass-card rounded-3xl p-6 border border-[#EAE5DF] flex flex-col justify-between hover-lift transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="accent" size="xs">Combo Package</Badge>
                      {pkg.original_price && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                          Save {currency}{Number(pkg.original_price) - Number(pkg.price)}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-lg text-[#1E2433]">{pkg.name}</h3>
                    <p className="text-xs text-[#566176] leading-relaxed line-clamp-3">{pkg.description}</p>
                  </div>

                  <div className="pt-6 border-t border-[#EAE5DF] mt-4 flex items-center justify-between">
                    <div>
                      {pkg.original_price && (
                        <span className="text-xs text-[#8491A5] line-through font-mono mr-2">
                          {currency}{Number(pkg.original_price).toLocaleString()}
                        </span>
                      )}
                      <span className="text-xl font-serif font-bold text-[#1E2433] font-mono">
                        {currency}{Number(pkg.price).toLocaleString()}
                      </span>
                    </div>

                    <Button variant="primary" size="sm" onClick={() => onNavigateToBooking()}>
                      Book Package
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Offers */}
          {activeTab === 'offers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="glass-card rounded-3xl overflow-hidden border border-[#EAE5DF] flex flex-col justify-between hover-lift transition-all group"
                >
                  {offer.banner_image && (
                    <div className="h-44 relative overflow-hidden bg-stone-100">
                      <img
                        src={offer.banner_image}
                        alt={offer.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-amber-400/30">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{offer.festival_tag || 'Festive Offer'}</span>
                      </div>
                      {(offer.valid_until || offer.end_at) && (
                        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-mono font-bold flex items-center gap-1.5 border border-white/20">
                          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span>Ends: {(offer.end_at || offer.valid_until)?.toString().slice(0, 10)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#D66A78] uppercase tracking-wider flex items-center gap-1 bg-[#FDF2F3] px-2.5 py-1 rounded-md">
                        <Tag className="w-3.5 h-3.5" />
                        {offer.discount_type === 'flat'
                          ? `${currency}${offer.discount_value} OFF`
                          : `${offer.discount_pct || offer.discount_value || 20}% OFF`}
                      </span>
                      {!offer.banner_image && (offer.valid_until || offer.end_at) && (
                        <span className="text-[10px] text-[#8491A5] flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-[#C89B53]" />
                          Expires: {(offer.end_at || offer.valid_until)?.toString().slice(0, 10)}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-xl text-[#1E2433]">{offer.title}</h3>
                    {offer.subtitle && (
                      <p className="text-xs font-semibold text-[#C89B53] uppercase tracking-wide">
                        {offer.subtitle}
                      </p>
                    )}
                    <p className="text-xs text-[#566176] leading-relaxed">{offer.description}</p>
                  </div>

                  <div className="px-6 py-4 bg-stone-50/80 border-t border-[#EAE5DF] flex items-center justify-between">
                    {(offer.coupon_code || offer.code) ? (
                      <button
                        type="button"
                        onClick={() => handleCopyCode(offer.coupon_code || offer.code!)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE5DF] text-[#1E2433] font-mono font-bold text-xs flex items-center gap-1.5 hover:border-[#D66A78] transition-colors shadow-xs"
                      >
                        {copiedCode === (offer.coupon_code || offer.code) ? (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#C89B53]" />
                        )}
                        <span>{offer.coupon_code || offer.code}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-stone-400 font-medium">Automatic at Checkout</span>
                    )}

                    <Button variant="primary" size="sm" onClick={() => onNavigateToBooking()}>
                      Claim Offer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Coupons */}
          {activeTab === 'coupons' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="glass-card rounded-3xl p-6 border-2 border-dashed border-[#EAE5DF] flex flex-col justify-between hover-lift transition-all relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="gold" size="xs">
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}% Discount`
                          : `${currency}${coupon.discount_value} Flat Off`}
                      </Badge>
                      {coupon.min_spend && Number(coupon.min_spend) > 0 && (
                        <span className="text-[10px] text-[#8491A5]">
                          Min Spend: {currency}{coupon.min_spend}
                        </span>
                      )}
                    </div>

                    <div className="p-3 rounded-2xl bg-white border border-[#EAE5DF] flex items-center justify-between">
                      <span className="font-mono font-bold text-sm tracking-wider text-[#1E2433]">
                        {coupon.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(coupon.code)}
                        className="p-1.5 rounded-lg hover:bg-black/5 text-[#D66A78] transition-colors"
                        title="Copy coupon code"
                      >
                        {copiedCode === coupon.code ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#566176]">Apply during booking checkout</span>
                    <Button variant="primary" size="sm" onClick={() => onNavigateToBooking()}>
                      Apply & Book
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
