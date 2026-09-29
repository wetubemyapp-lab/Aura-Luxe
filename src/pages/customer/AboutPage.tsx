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

  const businessName = activeBusiness?.name || 'Aura Luxe Atelier';
  const aboutText = language === 'hi' && activeBusiness?.about_text_hi
    ? activeBusiness.about_text_hi
    : activeBusiness?.about_text || 'Founded on principles of artisan craftsmanship, bespoke personal care, and hospital-grade sterilization, our atelier transforms everyday self-care into timeless rejuvenation.';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF4EB] text-[#C89B53] text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Heritage & Philosophy</span>
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
          <h3 className="font-serif font-bold text-xl text-[#1E2433]">Artisan Mastery</h3>
          <p className="text-xs sm:text-sm text-[#566176] leading-relaxed">
            Every {categoryConfig.specialistTerm.toLowerCase()} is certified through advanced global masterclasses, ensuring precision execution tailored to your natural contours and preferences.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 border border-[#EAE5DF] space-y-4 hover-lift">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF4EB] text-[#C89B53] flex items-center justify-center border border-[#C89B53]/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#1E2433]">Hospital-Grade Hygiene</h3>
          <p className="text-xs sm:text-sm text-[#566176] leading-relaxed">
            From autoclave-sterilized instruments to sealed single-use kits, non-comedogenic organic formulas, and HEPA air purification in every private treatment suite.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 border border-[#EAE5DF] space-y-4 hover-lift">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#1E2433]">Uncompromising Hospitality</h3>
          <p className="text-xs sm:text-sm text-[#566176] leading-relaxed">
            Zero wait times with synchronized calendar slots, personalized beverage bars, soundproof private chambers, and doorstep home concierge availability.
          </p>
        </div>
      </div>

      {/* Heritage Story Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center glass-card rounded-3xl p-8 lg:p-12 border border-[#EAE5DF]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-[#1E2433] text-xs font-semibold uppercase tracking-wider">
            <span>Our Commitment</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433]">
            Elevating Personal Care Into A Transformative Art
          </h2>
          <p className="text-xs sm:text-sm text-[#566176] leading-relaxed">
            We believe that wellness and grooming are not mere routines, but mindful pauses in a demanding world. Our spaces are curated with natural stone, ambient lighting, and bespoke botanical aromas designed to calm the senses from the moment you step through our doors.
          </p>

          <div className="space-y-3 pt-2">
            {[
              '100% Cruelty-free and dermatologically tested formulations',
              'Real-time appointment locking with zero double bookings',
              'Transparent pricing with full tax and advance breakdown',
              'Doorstep mobile salon suites equipped with complete travel kits',
            ].map((point, index) => (
              <div key={index} className="flex items-center gap-3 text-xs sm:text-sm text-[#1E2433] font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button variant="primary" onClick={onNavigateToBooking} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Book an Experience
            </Button>
            <Button variant="outline" onClick={onNavigateToServices}>
              Explore Service Catalog
            </Button>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
          <img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80"
            alt="Atelier interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 text-white">
            <div>
              <p className="font-serif font-bold text-lg">Indiranagar Flagship Sanctuary</p>
              <p className="text-xs text-white/80">Crafted with acoustic privacy and ambient warmth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
