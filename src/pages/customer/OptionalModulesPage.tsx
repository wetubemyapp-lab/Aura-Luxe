import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import {
  Sparkles,
  BookOpen,
  Crown,
  Gift,
  Heart,
  Home,
  Briefcase,
  Check,
  ArrowRight,
  Send,
} from 'lucide-react';
import { Button, Input, Textarea, Badge } from '../../components/ui/index.ts';

export interface OptionalModulesPageProps {
  moduleType: 'blog' | 'membership' | 'gift-cards' | 'bridal' | 'home-service' | 'corporate';
  onNavigateToBooking: () => void;
}

export const OptionalModulesPage: React.FC<OptionalModulesPageProps> = ({
  moduleType,
  onNavigateToBooking,
}) => {
  const { activeBusiness } = useBusiness();
  const { language } = useLanguage();

  const [activeModule, setActiveModule] = useState<'blog' | 'membership' | 'gift-cards' | 'bridal' | 'home-service' | 'corporate'>(moduleType);
  const currency = activeBusiness?.primary_currency || '₹';

  useEffect(() => {
    setActiveModule(moduleType);
  }, [moduleType]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12 animate-fade-in">
      {/* Module 1: Blog & Beauty Journal */}
      {activeModule === 'blog' && (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF4EB] text-[#C89B53] text-xs font-semibold uppercase tracking-widest">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Salon Blog & Tips</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#1E2433] tracking-tight">
              Style, Grooming & Wellness Journal
            </h1>
            <p className="text-sm sm:text-base text-[#566176] font-light">
              Expert advice, aftercare guides, seasonal color trends, and holistic rejuvenation services from our master stylists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'The Art of Scalp Health: Micro-Exfoliation & Serum Infusion',
                cat: 'Hair & Scalp Care',
                date: 'Sep 2026',
                img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
                read: '4 min read',
              },
              {
                title: 'Autumn Botanical Peels: Reversing Sun Damage Mindfully',
                cat: 'Dermatology & Skin',
                date: 'Sep 2026',
                img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
                read: '5 min read',
              },
              {
                title: 'Hot Towel Shave Service: Why Traditional Barbering Endures',
                cat: 'Grooming Heritage',
                date: 'Sep 2026',
                img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
                read: '3 min read',
              },
            ].map((post, i) => (
              <div key={i} className="glass-card rounded-3xl overflow-hidden border border-[#EAE5DF] flex flex-col justify-between hover-lift transition-all">
                <div>
                  <div className="aspect-[16/10] overflow-hidden bg-stone-100">
                    <img src={post.img} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-[#8491A5]">
                      <span className="font-bold uppercase text-[#D66A78]">{post.cat}</span>
                      <span>{post.read}</span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#1E2433] leading-snug">{post.title}</h3>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <span className="text-xs font-semibold text-[#D66A78] hover:underline flex items-center gap-1 cursor-pointer">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Module 2: VIP Membership Club */}
      {activeModule === 'membership' && (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF4EB] text-[#C89B53] text-xs font-semibold uppercase tracking-widest">
              <Crown className="w-3.5 h-3.5" />
              <span>Privilege Tier Program</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#1E2433] tracking-tight">
              Aura Luxe VIP Memberships
            </h1>
            <p className="text-sm sm:text-base text-[#566176] font-light">
              Elevate your self-care routine with complimentary monthly sessions, priority booking access, and member-only pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                tier: 'Silver Sanctuary',
                price: '2,999',
                period: '/month',
                features: ['1 Signature Facial or Hair Treatment / mo', '10% discount on all retail products', 'Standard weekend priority slotting'],
              },
              {
                tier: 'Gold Salon Privilege',
                price: '5,999',
                period: '/month',
                popular: true,
                features: ['2 Full Services or Color sessions / mo', '15% discount across all services & retail', 'Dedicated VIP suite access with beverage bar', '1 Complimentary home service / quarter'],
              },
              {
                tier: 'Platinum Sovereign',
                price: '9,999',
                period: '/month',
                features: ['Unlimited monthly haircuts & blowout styling', '4 Complete Spa/Skin services / mo', '20% off bridal and companion bookings', '24/7 personal concierge booking line'],
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`glass-card rounded-3xl p-8 border flex flex-col justify-between hover-lift transition-all relative ${
                  plan.popular ? 'border-[#D66A78] ring-2 ring-[#D66A78]/30 shadow-xl' : 'border-[#EAE5DF]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="accent" size="xs">Most Desired</Badge>
                  </div>
                )}
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-xl text-[#1E2433]">{plan.tier}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-serif font-bold text-[#1E2433] font-mono">{currency}{plan.price}</span>
                    <span className="text-xs text-[#8491A5]">{plan.period}</span>
                  </div>
                  <ul className="space-y-2.5 pt-4 border-t border-[#EAE5DF]">
                    {plan.features.map((feat, fi) => (
                      <li key={fi} className="flex items-start gap-2.5 text-xs text-[#566176]">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-6 mt-4">
                  <Button variant={plan.popular ? 'primary' : 'outline'} className="w-full" onClick={onNavigateToBooking}>
                    Join Privilege Club
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Module 3: Digital Gift Cards */}
      {activeModule === 'gift-cards' && (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF4EB] text-[#C89B53] text-xs font-semibold uppercase tracking-widest">
              <Gift className="w-3.5 h-3.5" />
              <span>Timeless Gifting</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#1E2433] tracking-tight">
              Salon Gift Cards
            </h1>
            <p className="text-sm sm:text-base text-[#566176] font-light">
              Send instant digital gift vouchers delivered directly via WhatsApp and email for birthdays, anniversaries, or corporate appreciation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 glass-card rounded-3xl p-8 border border-[#EAE5DF] items-center">
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-2xl text-[#1E2433]">The Perfect Gesture of Indulgence</h3>
              <p className="text-xs sm:text-sm text-[#566176] leading-relaxed">
                Recipients can redeem their digital voucher across any service, signature package, or tailored retail products at all branches.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {['2,000', '5,000', '10,000', '15,000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className="px-4 py-2 rounded-xl bg-white border border-[#EAE5DF] font-mono font-bold text-xs text-[#1E2433] hover:border-[#D66A78]"
                  >
                    {currency}{amt}
                  </button>
                ))}
              </div>
              <div className="pt-4">
                <Button variant="primary" onClick={onNavigateToBooking}>
                  Purchase Gift Card
                </Button>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1E2433] to-[#2B354F] text-white shadow-2xl space-y-6 aspect-[16/10] flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="font-serif tracking-widest uppercase text-xs text-[#C89B53]">Aura Luxe Salon</span>
                <Gift className="w-5 h-5 text-[#C89B53]" />
              </div>
              <div>
                <p className="text-xs text-white/70">Card Value</p>
                <p className="font-serif text-3xl font-bold font-mono text-[#FAF8F5]">{currency}5,000</p>
              </div>
              <div className="flex justify-between text-[10px] text-white/60 font-mono">
                <span>VOUCHER: AURA-LUXE-GIFT</span>
                <span>NEVER EXPIRES</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 4: Bridal Trousseau */}
      {activeModule === 'bridal' && (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF4EB] text-[#C89B53] text-xs font-semibold uppercase tracking-widest">
              <Heart className="w-3.5 h-3.5 text-[#D66A78]" />
              <span>Bridal Salon Packages</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#1E2433] tracking-tight">
              Customized Bridal & Groom Suites
            </h1>
            <p className="text-sm sm:text-base text-[#566176] font-light">
              Flawless HD/Airbrush makeup, pre-wedding skin regimens, couture draping, and groomsman grooming lounges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card rounded-3xl p-8 border border-[#EAE5DF] space-y-4">
              <Badge variant="accent" size="xs">The Bride</Badge>
              <h3 className="font-serif font-bold text-2xl text-[#1E2433]">Royal Bridal Trousseau Suite</h3>
              <p className="text-xs text-[#566176] leading-relaxed">
                Includes pre-wedding 30-day glow therapies, luxury body polishing, trial makeup sessions, bridal airbrush finish, and on-location dressing artist.
              </p>
              <Button variant="primary" size="sm" onClick={onNavigateToBooking}>
                Reserve Bridal Suite
              </Button>
            </div>

            <div className="glass-card rounded-3xl p-8 border border-[#EAE5DF] space-y-4">
              <Badge variant="gold" size="xs">The Groom</Badge>
              <h3 className="font-serif font-bold text-2xl text-[#1E2433]">Gentleman Grooming Lounge</h3>
              <p className="text-xs text-[#566176] leading-relaxed">
                Tailored skin rejuvenation, hot towel royal shave, precision beard architecture, and hair texturizing for wedding receptions.
              </p>
              <Button variant="outline" size="sm" onClick={onNavigateToBooking}>
                Reserve Groom Styling
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Module 5: Home Service Concierge */}
      {activeModule === 'home-service' && (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF4EB] text-[#C89B53] text-xs font-semibold uppercase tracking-widest">
              <Home className="w-3.5 h-3.5" />
              <span>Doorstep Salon Concierge</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#1E2433] tracking-tight">
              Sanctuary Delivered To Your Doorstep
            </h1>
            <p className="text-sm sm:text-base text-[#566176] font-light">
              Experience salon perfection in the comfort and privacy of your residence with certified mobile specialists.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 border border-[#EAE5DF] grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-base text-[#1E2433]">1. Select Doorstep Mode</h4>
              <p className="text-xs text-[#566176]">Choose Home Service on our booking engine and enter your address.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-base text-[#1E2433]">2. Mobile Suite Arrives</h4>
              <p className="text-xs text-[#566176]">Our practitioner brings complete single-use sterile kits, towels, and lights.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-base text-[#1E2433]">3. Pure Relaxation</h4>
              <p className="text-xs text-[#566176]">Enjoy seamless treatment with zero travel stress or waiting rooms.</p>
            </div>
          </div>

          <div className="text-center">
            <Button variant="primary" size="lg" onClick={onNavigateToBooking}>
              Book At-Home Experience
            </Button>
          </div>
        </div>
      )}

      {/* Module 6: Corporate Wellness */}
      {activeModule === 'corporate' && (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF4EB] text-[#C89B53] text-xs font-semibold uppercase tracking-widest">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Corporate Grooming & Wellness</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#1E2433] tracking-tight">
              B2B Corporate Wellness Days
            </h1>
            <p className="text-sm sm:text-base text-[#566176] font-light">
              On-site chair massage stations, executive grooming days, and employee wellness voucher programs for modern enterprises.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 border border-[#EAE5DF] max-w-2xl mx-auto space-y-4">
            <h3 className="font-serif font-bold text-xl text-[#1E2433]">Partner With Aura Luxe</h3>
            <p className="text-xs text-[#566176]">
              Request a custom corporate partnership proposal for your leadership summit, team retreat, or campus wellness days.
            </p>
            <div className="space-y-3">
              <Input label="Company Name *" placeholder="e.g. Google India / Tech Mahindra" />
              <Input label="Corporate Contact Email *" placeholder="hr@company.com" />
              <Textarea label="Event Requirements & Employee Headcount" rows={3} placeholder="Estimated participants, dates, preferred on-site treatments..." />
              <Button variant="primary">Submit B2B Inquiry</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
