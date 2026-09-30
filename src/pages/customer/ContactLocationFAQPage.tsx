import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Send,
  HelpCircle,
} from 'lucide-react';
import { Button, Input, Textarea, Badge } from '../../components/ui/index.ts';

export interface ContactLocationFAQPageProps {
  initialTab?: 'contact' | 'location' | 'faq';
  onNavigateToBooking: () => void;
}

export const ContactLocationFAQPage: React.FC<ContactLocationFAQPageProps> = ({
  initialTab = 'contact',
  onNavigateToBooking,
}) => {
  const { activeBusiness, branches, activeBranch, selectBranch } = useBusiness();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'contact' | 'location' | 'faq'>(initialTab);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Inquiry Form State
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [isSent, setIsSent] = useState(false);

  const faqs = [
    {
      q: language === 'hi' ? 'अपॉइंटमेंट के लिए अग्रिम जमा राशि (Advance Deposit) कैसे काम करती है?' : 'How do advance deposits work for appointments?',
      a: language === 'hi' 
        ? `हमारे विशेषज्ञों के समय का सम्मान करने और शेड्यूल को सुरक्षित रखने के लिए, हम एक मामूली अग्रिम जमा (आमतौर पर 20%) की आवश्यकता रखते हैं। शेष राशि का भुगतान स्टूडियो काउंटर पर नकद, कार्ड या यूपीआई क्यूआर कोड के माध्यम से किया जा सकता है।`
        : `To respect our master specialists' time and prevent schedule blackouts, we require a nominal advance deposit (typically 20%). The remaining balance can be settled at the studio counter via Cash, POS Card terminal, or instant UPI QR code.`,
    },
    {
      q: language === 'hi' ? 'क्या मैं अपनी बुकिंग को फिर से शेड्यूल या रद्द कर सकता हूँ?' : 'Can I reschedule or cancel my reservation?',
      a: language === 'hi'
        ? 'हाँ, बुकिंग को आपके "My Bookings" पोर्टल से निर्धारित समय से 4 घंटे पहले तक पूर्ण क्रेडिट के साथ फिर से शेड्यूल या रद्द किया जा सकता है।'
        : 'Yes, reservations can be rescheduled or cancelled with full credit up to 4 hours prior to the scheduled start time directly from your My Bookings portal.',
    },
    {
      q: language === 'hi' ? 'क्या मेरे क्षेत्र में होम सर्विस (Doorstep Services) उपलब्ध है?' : 'Are home doorstep services available in my area?',
      a: language === 'hi'
        ? 'हम अपनी शाखाओं के 15 किमी के दायरे में पूर्ण मोबाइल डोरस्टेप सेवाएं प्रदान करते हैं। हमारे विशेषज्ञ पूरी तरह से स्वच्छ किट और पोर्टेबल लाइट के साथ यात्रा करते हैं।'
        : 'We offer full mobile doorstep suites within a 15km radius of our branches. Our practitioners travel with complete single-use sanitized kits, portable styling lights, and protective covers.',
    },
    {
      q: language === 'hi' ? 'हाइजीन (स्वच्छता) के क्या मानक अपनाए जाते हैं?' : 'What hygiene standards are practiced?',
      a: language === 'hi'
        ? 'हम चिकित्सा-ग्रेड नसबंदी (Sterilization) बनाए रखते हैं: सभी उपकरणों की अल्ट्रासोनिक सफाई की जाती है और आपके सामने खोले गए सिंगल-यूज़ पाउच में सील किया जाता है।'
        : 'We strictly maintain medical-grade sterilization: all metal instruments undergo multi-stage ultrasonic cleaning and medical autoclave sterilization sealed in single-use pouches opened in front of you.',
    },
    {
      q: language === 'hi' ? 'क्या बिना रिजर्वेशन के वॉक-इन मेहमान आ सकते हैं?' : 'Do you accommodate walk-in guests without reservations?',
      a: language === 'hi'
        ? 'हालांकि अपॉइंटमेंट को पहली प्राथमिकता दी जाती है, हम तत्काल स्लॉट के लिए सभी फ्रंट डेस्क पर लाइव वॉक-इन डिजिटल कतार बनाए रखते हैं।'
        : 'While appointments have first priority, we maintain a live walk-in digital queue at all front desks to accommodate immediate openings.',
    },
  ];

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      setInquiryName('');
      setInquiryPhone('');
      setInquiryMsg('');
      setIsSent(false);
    }, 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF4EB] text-[#C89B53] text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Concierge & Assistance</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#1E2433] tracking-tight">
          Contact, Locations & FAQs
        </h1>
        <p className="text-sm sm:text-base text-[#566176] font-light">
          Connect directly with our desk team, navigate to your nearest salon branch, or explore answers to common queries.
        </p>
      </div>

      {/* Nav Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 glass-card rounded-2xl border border-[#EAE5DF]">
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'contact' ? 'bg-[#1E2433] text-white shadow-sm' : 'text-[#566176] hover:text-[#1E2433]'
            }`}
          >
            <Phone className="w-4 h-4" />
            Contact & Inquiry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('location')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'location' ? 'bg-[#1E2433] text-white shadow-sm' : 'text-[#566176] hover:text-[#1E2433]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Branch Locations ({branches.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'faq' ? 'bg-[#1E2433] text-white shadow-sm' : 'text-[#566176] hover:text-[#1E2433]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Frequently Asked Questions
          </button>
        </div>
      </div>

      {/* TAB 1: Contact & Inquiry */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#EAE5DF] space-y-6">
              <h3 className="font-serif font-bold text-xl text-[#1E2433]">Call or Chat with Us</h3>

              <div className="space-y-4 text-xs text-[#566176]">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#D66A78] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1E2433] block">Call Us</span>
                    <span>{activeBranch?.phone || activeBusiness?.phone || '+91 98765 43210'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1E2433] block">WhatsApp Fast-Response</span>
                    <span>{activeBranch?.whatsapp || activeBusiness?.whatsapp_number || '+91 98765 43210'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#C89B53] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1E2433] block">Email Support</span>
                    <span>{activeBranch?.email || activeBusiness?.email || 'concierge@auraluxe.com'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#8491A5] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1E2433] block">Operating Hours</span>
                    <span>{activeBranch?.opening_hours || activeBusiness?.opening_hours || 'Mon-Sun: 09:30 AM - 09:30 PM'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 border border-[#EAE5DF] space-y-4">
            <h3 className="font-serif font-bold text-xl text-[#1E2433]">Send A Direct Inquiry</h3>
            <p className="text-xs text-[#566176]">
              Have a special bridal inquiry, custom hair color consultation, or corporate inquiry? Leave us a note.
            </p>

            {isSent ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                Thank you! Your message has been routed to our concierge team. We will reply via WhatsApp/phone promptly.
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-4">
                <Input
                  label="Your Name *"
                  required
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                />
                <Input
                  label="Phone Number *"
                  required
                  value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
                <Textarea
                  label="Your Message or Question *"
                  required
                  rows={3}
                  value={inquiryMsg}
                  onChange={(e) => setInquiryMsg(e.target.value)}
                  placeholder="Describe your desired services, dates, or custom requests..."
                />
                <Button type="submit" variant="primary" rightIcon={<Send className="w-4 h-4" />}>
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Locations & Branches */}
      {activeTab === 'location' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((b) => (
              <div
                key={b.id}
                className={`glass-card rounded-3xl p-6 border transition-all hover-lift flex flex-col justify-between ${
                  activeBranch?.id === b.id ? 'border-[#D66A78] ring-1 ring-[#D66A78]/30' : 'border-[#EAE5DF]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-lg text-[#1E2433]">{b.name}</h3>
                    {b.is_main && <Badge variant="accent" size="xs">Flagship</Badge>}
                  </div>
                  <p className="text-xs text-[#566176]">{b.address}</p>

                  <div className="pt-2 border-t border-[#EAE5DF] space-y-1.5 text-xs text-[#8491A5]">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#D66A78]" />
                      <span>{b.phone || activeBusiness?.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#C89B53]" />
                      <span>{b.opening_hours || 'Mon-Sun: 09:30 AM - 09:30 PM'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EAE5DF] mt-4 flex items-center justify-between">
                  {b.google_maps_url ? (
                    <a
                      href={b.google_maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#D66A78] hover:underline font-semibold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Google Maps
                    </a>
                  ) : (
                    <span className="text-xs text-[#8491A5]">Central District</span>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      selectBranch(b.id);
                      onNavigateToBooking();
                    }}
                  >
                    Book This Branch
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FAQs */}
      {activeTab === 'faq' && (
        <div className="max-w-3xl mx-auto space-y-3 animate-fade-in">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="glass-card rounded-2xl border border-[#EAE5DF] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-[#1E2433]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#8491A5] transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#D66A78]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[#566176] leading-relaxed border-t border-[#EAE5DF]/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
