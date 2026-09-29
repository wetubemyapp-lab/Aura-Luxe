import React, { useEffect, useState } from 'react';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { ServiceItem, PackageItem, OfferItem, StaffItem, GalleryItem, VideoItem, ReviewItem, Branch } from '../../types/index.ts';
import { CustomerAIConciergeModal } from '../../components/ai/CustomerAIConciergeModal.tsx';
import {
  Calendar,
  Sparkles,
  Clock,
  MapPin,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Star,
  Heart,
  Building2,
  Phone,
  MessageCircle,
  ExternalLink,
  Bot,
  ChevronDown,
  Play,
  Check,
  Tag,
  Gift,
  Search,
  UserCheck,
  Zap,
  CreditCard,
  Lock,
  X,
  HelpCircle,
} from 'lucide-react';
import { Button, Badge } from '../../components/ui/index.ts';

interface HomePageProps {
  onNavigateToBooking: (serviceId?: number) => void;
  onNavigateToServices: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToBooking,
  onNavigateToServices,
}) => {
  const { activeBusiness, branches, activeBranch, selectBranch, categoryConfig } = useBusiness();
  const { t, language } = useLanguage();

  const [popularServices, setPopularServices] = useState<ServiceItem[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Booking Bar State
  const [quickServiceId, setQuickServiceId] = useState<number | undefined>(undefined);
  const [quickBranchId, setQuickBranchId] = useState<number | undefined>(undefined);
  const [quickStaffId, setQuickStaffId] = useState<number | undefined>(undefined);
  const [quickDate, setQuickDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  // Modal / Lightbox States
  const [isAiConciergeOpen, setIsAiConciergeOpen] = useState(false);
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<VideoItem | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const businessName = activeBusiness?.name || 'Aura Luxe Salon';
  const tagline = language === 'hi'
    ? (activeBusiness?.tagline_hi || activeBusiness?.tagline)
    : activeBusiness?.tagline || 'Experience personalized elegance, rejuvenating therapies, and master grooming.';
  const bannerImage = activeBusiness?.banner_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80';
  const currency = activeBusiness?.primary_currency || '₹';

  useEffect(() => {
    async function loadHomepageContent() {
      if (!activeBusiness) return;
      setLoading(true);
      try {
        const bId = activeBusiness.id;
        const [srvRes, offRes, pkgRes, stfRes, galRes, vidRes, revRes] = await Promise.all([
          fetch(`/api/services?businessId=${bId}`),
          fetch(`/api/offers?businessId=${bId}`),
          fetch(`/api/packages?businessId=${bId}`),
          fetch(`/api/staff?businessId=${bId}`),
          fetch(`/api/gallery?businessId=${bId}`),
          fetch(`/api/videos?businessId=${bId}`),
          fetch(`/api/reviews?businessId=${bId}`),
        ]);

        if (srvRes.ok && srvRes.headers.get('content-type')?.includes('application/json')) {
          const d = await srvRes.json();
          setPopularServices((d.services || []).slice(0, 6));
          if (d.services && d.services.length > 0) {
            setQuickServiceId(d.services[0].id);
          }
        }
        if (offRes.ok && offRes.headers.get('content-type')?.includes('application/json')) {
          const d = await offRes.json();
          setOffers((d.offers || []).slice(0, 3));
        }
        if (pkgRes.ok && pkgRes.headers.get('content-type')?.includes('application/json')) {
          const d = await pkgRes.json();
          setPackages((d.packages || []).slice(0, 3));
        }
        if (stfRes.ok && stfRes.headers.get('content-type')?.includes('application/json')) {
          const d = await stfRes.json();
          setStaffList((d.staff || []).slice(0, 4));
        }
        if (galRes.ok && galRes.headers.get('content-type')?.includes('application/json')) {
          const d = await galRes.json();
          setGallery((d.gallery || []).slice(0, 6));
        }
        if (vidRes.ok && vidRes.headers.get('content-type')?.includes('application/json')) {
          const d = await vidRes.json();
          setVideos((d.videos || []).slice(0, 3));
        }
        if (revRes.ok && revRes.headers.get('content-type')?.includes('application/json')) {
          const d = await revRes.json();
          setReviews((d.reviews || []).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load homepage wireframe components:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomepageContent();
  }, [activeBusiness]);

  useEffect(() => {
    if (branches.length > 0 && !quickBranchId) {
      const main = branches.find((b) => b.is_main) || branches[0];
      setQuickBranchId(main.id);
    }
  }, [branches, quickBranchId]);

  const handleQuickBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToBooking(quickServiceId);
  };

  const faqs = [
    {
      q: 'How does real-time booking work?',
      a: 'Our website books your chosen staff and time slot immediately, so there are no double bookings or long waiting times.',
    },
    {
      q: 'Can I request home services?',
      a: 'Yes, our mobile salon service operates within a 15km radius of our branches with fully clean and safe kits.',
    },
    {
      q: 'What is the advance payment?',
      a: 'We ask for a small 20% advance payment during checkout to block your stylist. The rest you can pay at the salon counter.',
    },
    {
      q: 'Are hygiene protocols safe?',
      a: 'All our tools are fully sterilized and sealed in single-use pouches that we open right in front of you.',
    },
  ];

  return (
    <div className="space-y-20 pb-20 relative animate-fade-in">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={bannerImage}
            alt={businessName}
            className="w-full h-full object-cover object-center filter brightness-[0.70]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-[#1E2433]/70 to-[#1E2433]/90" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white py-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FAF8F5] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C89B53]" />
            <span>Professional Care. Simple Booking.</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
            Your Style. Your Time. Your {categoryConfig.specialistTerm.split('/')[0]}.
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-200 font-light max-w-2xl mx-auto font-sans leading-relaxed">
            {tagline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigateToBooking()}
              leftIcon={<Calendar className="w-4 h-4" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              BOOK NOW
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={onNavigateToServices}
            >
              EXPLORE SERVICES
            </Button>

            <button
              type="button"
              onClick={() => setIsAiConciergeOpen(true)}
              className="px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-[#C89B53]" />
              <span>Ask AI Stylist</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. QUICK BOOKING BAR */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#EAE5DF] shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE5DF] pb-3">
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#1E2433] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#D66A78]" />
              What would you like today?
            </h3>
            <span className="text-xs text-[#8491A5] hidden sm:inline">Instant Real-Time Reservation</span>
          </div>

          <form onSubmit={handleQuickBookSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Service Select */}
            <div>
              <label className="block text-[10px] font-bold text-[#8491A5] uppercase mb-1">Service</label>
              <select
                value={quickServiceId}
                onChange={(e) => setQuickServiceId(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-white border border-[#EAE5DF] rounded-xl text-xs font-semibold text-[#1E2433]"
              >
                {popularServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({currency}{s.price})
                  </option>
                ))}
              </select>
            </div>

            {/* Location Select */}
            <div>
              <label className="block text-[10px] font-bold text-[#8491A5] uppercase mb-1">Outlet Location</label>
              <select
                value={quickBranchId}
                onChange={(e) => setQuickBranchId(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-white border border-[#EAE5DF] rounded-xl text-xs font-semibold text-[#1E2433]"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Specialist Select */}
            <div>
              <label className="block text-[10px] font-bold text-[#8491A5] uppercase mb-1">Specialist</label>
              <select
                value={quickStaffId}
                onChange={(e) => setQuickStaffId(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-white border border-[#EAE5DF] rounded-xl text-xs font-semibold text-[#1E2433]"
              >
                <option value="">Any Available Master</option>
                {staffList.map((stf) => (
                  <option key={stf.id} value={stf.id}>
                    {stf.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Select */}
            <div>
              <label className="block text-[10px] font-bold text-[#8491A5] uppercase mb-1">Preferred Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={quickDate}
                onChange={(e) => setQuickDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-[#EAE5DF] rounded-xl text-xs font-semibold text-[#1E2433]"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <Button type="submit" variant="primary" className="w-full h-[42px]">
                Book Now
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. POPULAR SERVICES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#EAE5DF] pb-4">
          <div>
            <Badge variant="accent" size="xs">Popular Services</Badge>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433] mt-1">
              Popular Services & Packages
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={onNavigateToServices}>
            View Full Menu
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularServices.map((srv) => (
            <div
              key={srv.id}
              className="glass-card rounded-3xl overflow-hidden border border-[#EAE5DF] flex flex-col justify-between hover-lift transition-all"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                  <img
                    src={srv.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'}
                    alt={srv.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-[#1E2433] shadow-xs">
                      {srv.duration_mins} mins
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C89B53]">
                    {srv.category}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[#1E2433]">{srv.title}</h3>
                  <p className="text-xs text-[#566176] line-clamp-2 leading-relaxed">
                    {srv.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-[#EAE5DF] mt-4 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#8491A5] block">Starts at</span>
                  <span className="text-lg font-serif font-bold text-[#1E2433] font-mono">
                    {currency}{srv.price}
                  </span>
                </div>

                <Button variant="primary" size="sm" onClick={() => onNavigateToBooking(srv.id)}>
                  Book Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED OFFERS */}
      {offers.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="border-b border-[#EAE5DF] pb-4">
            <Badge variant="gold" size="xs">Seasonal Offers</Badge>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433] mt-1">
              Limited-Time Promotions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map((off) => (
              <div
                key={off.id}
                className="glass-card rounded-3xl p-6 border border-[#EAE5DF] flex flex-col justify-between hover-lift transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#C89B53] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {off.discount_pct}% Discount
                    </span>
                    {off.code && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-[#1E2433]">
                        {off.code}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#1E2433]">{off.title}</h3>
                  <p className="text-xs text-[#566176] leading-relaxed">{off.description}</p>
                </div>

                <div className="pt-6 border-t border-[#EAE5DF] mt-4 flex items-center justify-between">
                  {off.valid_until && (
                    <span className="text-[10px] text-[#8491A5]">Expires: {off.valid_until}</span>
                  )}
                  <Button variant="primary" size="sm" onClick={() => onNavigateToBooking()}>
                    Claim Offer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. PACKAGES */}
      {packages.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="border-b border-[#EAE5DF] pb-4">
            <Badge variant="info" size="xs">Bundled Value</Badge>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433] mt-1">
              Best Combo Packages
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="glass-card rounded-3xl p-6 border border-[#EAE5DF] flex flex-col justify-between hover-lift transition-all"
              >
                <div className="space-y-3">
                  <h3 className="font-serif font-bold text-lg text-[#1E2433]">{pkg.name}</h3>
                  <p className="text-xs text-[#566176] leading-relaxed">{pkg.description}</p>
                </div>

                <div className="pt-6 border-t border-[#EAE5DF] mt-4 flex items-center justify-between">
                  <div>
                    {pkg.original_price && (
                      <span className="text-xs text-[#8491A5] line-through font-mono mr-2">
                        {currency}{pkg.original_price}
                      </span>
                    )}
                    <span className="text-xl font-serif font-bold text-[#1E2433] font-mono">
                      {currency}{pkg.price}
                    </span>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => onNavigateToBooking()}>
                    Book Package
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. TEAM / SPECIALISTS */}
      {staffList.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="border-b border-[#EAE5DF] pb-4">
            <Badge variant="accent" size="xs">Master Practitioners</Badge>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433] mt-1">
              Meet Our {categoryConfig.specialistTermPlural}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {staffList.map((stf) => (
              <div
                key={stf.id}
                className="glass-card rounded-3xl p-5 border border-[#EAE5DF] text-center space-y-3 hover-lift transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <img
                    src={stf.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt={stf.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-[#D66A78]/60 shadow-md"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#1E2433]">{stf.name}</h3>
                    <p className="text-xs text-[#8491A5]">{stf.role_title}</p>
                  </div>
                  <p className="text-[11px] text-[#566176] line-clamp-2 leading-relaxed">
                    {stf.bio || 'Certified practitioner delivering individualized perfection.'}
                  </p>
                </div>

                <Button variant="primary" size="sm" className="w-full mt-2" onClick={() => onNavigateToBooking()}>
                  Book Specialist
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. WHY CHOOSE US */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="gold" size="xs">Standard of Excellence</Badge>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433]">
            Why Choose {businessName}?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: UserCheck, title: 'Expert Stylists & Staff', desc: 'Certified stylists who give you personal attention and high-quality results.' },
            { icon: Calendar, title: 'Fast & Simple Booking', desc: 'Real-time booking blocks your slot immediately, so no waiting around or double booking.' },
            { icon: Clock, title: 'Choose Your Time', desc: 'Open all days of the week, with quick self-service to change time or date.' },
            { icon: Tag, title: 'Honest & Clear Prices', desc: 'Clean bills showing taxes and advance amounts openly.' },
            { icon: ShieldCheck, title: '100% Clean & Sanitized', desc: 'All salon tools are fully sanitized and kept in single-use sealed kits.' },
            { icon: Lock, title: 'Easy & Safe Payments', desc: 'Safe payments via Cash, Card swipe machines, and UPI GPay/PhonePe.' },
          ].map((benefit, i) => (
            <div key={i} className="glass-card rounded-3xl p-6 border border-[#EAE5DF] space-y-3 hover-lift">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF4EB] text-[#C89B53] flex items-center justify-center border border-[#C89B53]/30">
                <benefit.icon className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#1E2433]">{benefit.title}</h3>
              <p className="text-xs text-[#566176] leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. VIDEO SHOWCASE */}
      {videos.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="border-b border-[#EAE5DF] pb-4">
            <Badge variant="accent" size="xs">Transformation Reels</Badge>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433] mt-1">
              Video Showcase
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {videos.map((vid) => (
              <div
                key={vid.id}
                onClick={() => setActiveVideoModal(vid)}
                className="glass-card rounded-3xl overflow-hidden border border-[#EAE5DF] cursor-pointer group hover-lift"
              >
                <div className="relative aspect-[16/9] bg-stone-900 overflow-hidden flex items-center justify-center">
                  <img
                    src={vid.thumbnail_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'}
                    alt={vid.title}
                    className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute w-12 h-12 rounded-full bg-white/90 text-[#1E2433] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-serif font-bold text-sm text-[#1E2433]">{vid.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9. GALLERY & LIGHTBOX */}
      {gallery.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="border-b border-[#EAE5DF] pb-4">
            <Badge variant="info" size="xs">Visual Portfolio</Badge>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433] mt-1">
              Salon Photos
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {gallery.map((g) => (
              <div
                key={g.id}
                onClick={() => setActiveLightboxImg(g.image_url)}
                className="rounded-2xl overflow-hidden aspect-square bg-stone-100 cursor-pointer group relative shadow-xs"
              >
                <img
                  src={g.image_url}
                  alt={g.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 10. REVIEWS */}
      {reviews.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex items-center justify-between border-b border-[#EAE5DF] pb-4">
            <div>
              <Badge variant="accent" size="xs">Client Feedback</Badge>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433] mt-1">
                Verified Reviews (4.9 / 5 Stars)
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="glass-card rounded-3xl p-5 border border-[#EAE5DF] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-[#566176] italic leading-relaxed">"{rev.comment}"</p>
                </div>
                <div className="pt-3 border-t border-[#EAE5DF]">
                  <span className="font-bold text-xs text-[#1E2433] block">{rev.user_name}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Verified Guest</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 11. LOCATION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="border-b border-[#EAE5DF] pb-4">
          <Badge variant="gold" size="xs">Find An Outlet</Badge>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433] mt-1">
            Studio Locations & Directions
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center glass-card rounded-3xl p-6 sm:p-8 border border-[#EAE5DF]">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-serif font-bold text-xl text-[#1E2433]">{activeBranch?.name || businessName}</h3>
            <p className="text-xs text-[#566176] leading-relaxed">{activeBranch?.address || activeBusiness?.address}</p>

            <div className="space-y-2 text-xs text-[#566176] pt-2 border-t border-[#EAE5DF]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C89B53]" />
                <span>{activeBranch?.opening_hours || activeBusiness?.opening_hours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D66A78]" />
                <span>{activeBranch?.phone || activeBusiness?.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp: {activeBranch?.whatsapp || activeBusiness?.whatsapp_number}</span>
              </div>
            </div>

            {activeBranch?.google_maps_url && (
              <a
                href={activeBranch.google_maps_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D66A78] hover:underline pt-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Directions in Google Maps
              </a>
            )}
          </div>

          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-[#EAE5DF] aspect-[16/9] bg-stone-200 relative flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80"
              alt="Map Preview"
              className="w-full h-full object-cover filter brightness-90"
            />
            <div className="absolute p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl text-center">
              <MapPin className="w-6 h-6 text-[#D66A78] mx-auto mb-1" />
              <p className="font-serif font-bold text-xs text-[#1E2433]">{activeBranch?.name || 'Flagship Studio'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 12. DYNAMIC FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="accent" size="xs">Frequently Asked Questions</Badge>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433]">Got Questions?</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={index} className="glass-card rounded-2xl border border-[#EAE5DF] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-[#1E2433]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#8491A5] transition-transform ${isOpen ? 'rotate-180 text-[#D66A78]' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-[#566176] leading-relaxed border-t border-[#EAE5DF]/50 pt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 13. FINAL CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="glass-card rounded-3xl p-10 sm:p-14 border border-[#EAE5DF] text-center space-y-6 bg-gradient-to-br from-white to-[#FAF4EB]">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F3] text-[#D66A78] flex items-center justify-center mx-auto border border-[#D66A78]/30">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1E2433]">
            Ready to book your appointment?
          </h2>

          <p className="text-xs sm:text-sm text-[#566176] max-w-lg mx-auto leading-relaxed">
            Select your preferred services, branch location, and master practitioner in seconds with instant confirmation.
          </p>

          <Button
            variant="primary"
            size="lg"
            onClick={() => onNavigateToBooking()}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            BOOK NOW
          </Button>
        </div>
      </section>

      {/* Lightbox Preview Modal */}
      {activeLightboxImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setActiveLightboxImg(null)}>
          <div className="relative max-w-3xl w-full">
            <img src={activeLightboxImg} alt="Enlarged gallery view" className="w-full h-auto rounded-3xl shadow-2xl" />
            <button type="button" onClick={() => setActiveLightboxImg(null)} className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      <CustomerAIConciergeModal
        isOpen={isAiConciergeOpen}
        onClose={() => setIsAiConciergeOpen(false)}
        onSelectServiceToBook={(srvId: number) => {
          setIsAiConciergeOpen(false);
          onNavigateToBooking(srvId);
        }}
      />
    </div>
  );
};
