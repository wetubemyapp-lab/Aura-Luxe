import React from 'react';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Sparkles, ShieldCheck, HeartHandshake, Award, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/index.ts';

export interface AboutPageProps {
  onNavigateToBooking: () => void;
  onNavigateToServices: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigateToBooking,
  onNavigateToServices,
}) => {
  const { activeBusiness, categoryConfig } = useBusiness();
  const { language } = useLanguage();

  const businessName = activeBusiness?.name || 'Aura Luxe Salon';
  const aboutText = language === 'hi' && activeBusiness?.about_text_hi
    ? activeBusiness.about_text_hi
    : activeBusiness?.about_text || 'Started with a commitment to offer modern, stylish, and high-quality beauty care. Every appointment is done with personal attention in a clean, quiet, and relaxing environment.';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF4EB] text-[#C89B53] text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Story & Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#1E2433] tracking-tight">
          About {businessName}
        </h1>
        <p className="text-base sm:text-lg text-[#566176] font-light leading-relaxed">
          {aboutText}
        </p>
      </div>

      {/* Brand Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-3xl p-8 border border-[#EAE5DF] space-y-4 hover-lift">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F3] text-[#D66A78] flex items-center justify-center border border-[#D66A78]/30">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#1E2433]">Expert Stylists & Staff</h3>
          <p className="text-xs sm:text-sm text-[#566176] leading-relaxed">
            Every stylist and staff is certified through advanced masterclasses, ensuring perfect beauty care and styling customized to your preferences.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 border border-[#EAE5DF] space-y-4 hover-lift">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF4EB] text-[#C89B53] flex items-center justify-center border border-[#C89B53]/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#1E2433]">100% Clean & Sanitized</h3>
          <p className="text-xs sm:text-sm text-[#566176] leading-relaxed">
            From fully sanitized tools to single-use clean kits, organic products, and fresh air setups in every single treatment room.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 border border-[#EAE5DF] space-y-4 hover-lift">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#1E2433]">Best Customer Care & Service</h3>
          <p className="text-xs sm:text-sm text-[#566176] leading-relaxed">
            Zero wait times with perfectly timed calendar bookings, free hot/cold drinks, silent private chambers, and doorstep home services.
          </p>
        </div>
      </div>

      {/* Heritage Story Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center glass-card rounded-3xl p-8 lg:p-12 border border-[#EAE5DF]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-[#1E2433] text-xs font-semibold uppercase tracking-wider">
            <span>Our Promise</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433]">
            Taking Care of Your Beauty & Comfort Personally
          </h2>
          <p className="text-xs sm:text-sm text-[#566176] leading-relaxed">
            We believe that wellness and hair-care are not just chores, but relaxing breaks in a busy daily life. Our rooms are designed with beautiful natural stone, soft lighting, and sweet-smelling essential oils to make you feel calm the moment you walk inside.
          </p>

          <div className="space-y-3 pt-2">
            {[
              '100% Safe and skin-tested professional products',
              'Instant booking confirmation with zero double bookings',
              'Clean, honest pricing with full tax and advance payment details',
              'Home salon options where we bring the full kit to your house',
            ].map((point, index) => (
              <div key={index} className="flex items-center gap-3 text-xs sm:text-sm text-[#1E2433] font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button variant="primary" onClick={onNavigateToBooking} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Book an Appointment
            </Button>
            <Button variant="outline" onClick={onNavigateToServices}>
              See All Services
            </Button>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
          <img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80"
            alt="Salon interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 text-white">
            <div>
              <p className="font-serif font-bold text-lg">Indiranagar Flagship Salon</p>
              <p className="text-xs text-white/80">Designed with perfect soundproofing and warm lighting</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
