import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { ShieldCheck, FileText, RotateCcw, Sparkles } from 'lucide-react';

export interface LegalPolicyPageProps {
  initialTab?: 'privacy' | 'terms' | 'cancellation-policy';
}

export const LegalPolicyPage: React.FC<LegalPolicyPageProps> = ({
  initialTab = 'privacy',
}) => {
  const { activeBusiness, activeBranch } = useBusiness();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'cancellation-policy'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const businessName = activeBusiness?.name || 'Aura Luxe Salon';
  const cancellationPolicy = activeBranch?.cancellation_policy || 'Free cancellation and full refund of advance amount is given if you cancel up to 4 hours before your booking time. If you cancel within 4 hours or do not show up, the advance amount will be kept to pay the stylist.';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fade-in">
      {/* Nav Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 glass-card rounded-2xl border border-[#EAE5DF]">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'privacy' ? 'bg-[#1E2433] text-white shadow-sm' : 'text-[#566176] hover:text-[#1E2433]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'terms' ? 'bg-[#1E2433] text-white shadow-sm' : 'text-[#566176] hover:text-[#1E2433]'
            }`}
          >
            <FileText className="w-4 h-4" />
            Terms of Service
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cancellation-policy')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'cancellation-policy' ? 'bg-[#1E2433] text-white shadow-sm' : 'text-[#566176] hover:text-[#1E2433]'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Cancellation & Refunds
          </button>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-8 sm:p-10 border border-[#EAE5DF] space-y-6 text-[#566176] text-xs sm:text-sm leading-relaxed">
        {/* Privacy Policy */}
        {activeTab === 'privacy' && (
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433]">Privacy Policy</h1>
            <p className="text-xs text-[#8491A5]">Last Updated: September 2026</p>

            <p>
              At {businessName}, we respect your personal privacy. We collect minimal customer information (such as name, verified phone number, email address, and appointment preferences) solely to facilitate real-time booking reservations, send automated WhatsApp/SMS booking confirmations, and personalize your in-studio or doorstep experience.
            </p>

            <h3 className="font-serif font-bold text-base text-[#1E2433] pt-2">1. Data Storage & Security</h3>
            <p>
              Your contact details and historical booking records are stored in secure, encrypted relational database clusters. We never sell, rent, or distribute your personal details to third-party advertisers.
            </p>

            <h3 className="font-serif font-bold text-base text-[#1E2433] pt-2">2. Payment Processing</h3>
            <p>
              All online transactions, advance deposits, and counter UPI/Card payments are processed securely through PCI-DSS compliant payment gateways. We never store credit card numbers on our servers.
            </p>
          </div>
        )}

        {/* Terms of Service */}
        {activeTab === 'terms' && (
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433]">Terms of Service</h1>
            <p className="text-xs text-[#8491A5]">Last Updated: September 2026</p>

            <p>
              By accessing and booking services through {businessName}, you agree to adhere to our standard operational terms, hygiene standards, and courteous appointment scheduling guidelines.
            </p>

            <h3 className="font-serif font-bold text-base text-[#1E2433] pt-2">1. Punctuality & Slot Allocation</h3>
            <p>
              To maintain seamless scheduling for all guests, please arrive 5–10 minutes prior to your allocated slot. Sessions delayed by more than 15 minutes due to guest delay may be shortened or rescheduled.
            </p>

            <h3 className="font-serif font-bold text-base text-[#1E2433] pt-2">2. Right of Refusal</h3>
            <p>
              We reserve the right to decline or halt service in instances of infectious dermatological conditions, intoxication, or disrespectful conduct towards our practitioners.
            </p>
          </div>
        )}

        {/* Cancellation & Refund Policy */}
        {activeTab === 'cancellation-policy' && (
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433]">Cancellation & Refund Policy</h1>
            <p className="text-xs text-[#8491A5]">Last Updated: September 2026</p>

            <div className="p-4 rounded-2xl bg-[#FAF4EB] border border-[#EAE5DF] text-[#1E2433] font-medium">
              {cancellationPolicy}
            </div>

            <h3 className="font-serif font-bold text-base text-[#1E2433] pt-2">1. Rescheduling Guidelines</h3>
            <p>
              You may self-reschedule any confirmed booking directly from the <strong>My Bookings</strong> tab up to 4 hours before the appointment with zero penalty.
            </p>

            <h3 className="font-serif font-bold text-base text-[#1E2433] pt-2">2. Refund Disbursement</h3>
            <p>
              Eligible refunds for cancelled reservations are credited back to the original payment source or issued as digital store credits within 3–5 business banking days.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
