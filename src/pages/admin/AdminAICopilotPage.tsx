import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import {
  Sparkles,
  Megaphone,
  MessageSquare,
  TrendingUp,
  HeartHandshake,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  RefreshCw,
  FileText,
  Tag,
  PenTool,
  Search,
  HelpCircle,
  Maximize2,
} from 'lucide-react';
import { Button } from '../../components/ui/index.ts';

export const AdminAICopilotPage: React.FC = () => {
  const { language } = useLanguage();
  const { activeBusiness } = useBusiness();

  // All pluggable task types supported
  const [activeTab, setActiveTab] = useState<
    | 'festival_campaign'
    | 'whatsapp_promo'
    | 'slow_day_booster'
    | 'review_reply'
    | 'service_description'
    | 'offer_title'
    | 'offer_description'
    | 'instagram_caption'
    | 'seo_meta'
    | 'faq_draft'
  >('festival_campaign');

  const [festivalName, setFestivalName] = useState('Diwali Grand Festive Season');
  const [discountPct, setDiscountPct] = useState('20');
  const [servicesTargeted, setServicesTargeted] = useState('Royal Scissor Cut, 24K Gold Facial, Aromatherapy Spa');
  const [reviewInput, setReviewInput] = useState('Had an awesome haircut and deep massage today, staff was so polite!');
  const [reviewRating, setReviewRating] = useState(5);

  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setCopied(false);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: activeTab,
          festivalName,
          discount: discountPct,
          businessName: activeBusiness?.name || 'Aura Luxe Unisex Salon & Spa',
          businessCategory: activeBusiness?.category || 'unisex_salon',
          services: servicesTargeted,
          reviewText: reviewInput,
          reviewRating,
          language,
          business_id: activeBusiness?.id || 1,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedResult(data.result);
      } else {
        setGeneratedResult(data.error || 'Failed to generate content. Please try again.');
      }
    } catch (e) {
      setGeneratedResult('Network error communicating with AI Co-Pilot.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tasksList = [
    { id: 'festival_campaign' as const, label: 'Festival Campaigns', icon: Megaphone, desc: 'Festival campaign copy' },
    { id: 'whatsapp_promo' as const, label: 'WhatsApp Broadcasts', icon: MessageSquare, desc: 'WhatsApp promotion messages' },
    { id: 'instagram_caption' as const, label: 'Instagram Captions', icon: PenTool, desc: 'Social media captions with hashtags' },
    { id: 'service_description' as const, label: 'Service Descriptions', icon: FileText, desc: 'SEO-ready service description cards' },
    { id: 'offer_title' as const, label: 'Offer Titles', icon: Tag, desc: 'Compelling offer/coupon headers' },
    { id: 'offer_description' as const, label: 'Offer Descriptions', icon: FileText, desc: 'Clear terms and highlights' },
    { id: 'seo_meta' as const, label: 'SEO Meta Descriptions', icon: Search, desc: 'Google rank tags' },
    { id: 'faq_draft' as const, label: 'FAQ Drafts', icon: HelpCircle, desc: 'Booking policy question drafts' },
    { id: 'slow_day_booster' as const, label: 'Slow Day Booster', icon: TrendingUp, desc: 'Off-peak occupancies optimization' },
    { id: 'review_reply' as const, label: 'Review Responses', icon: HeartHandshake, desc: 'Polite brand building replies' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E07A5F]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#E07A5F]/20 text-[#E07A5F]">
                <Sparkles className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-serif font-bold text-[#FAF7F2]">
                {language === 'hi' ? 'एआई बिजनेस को-पायलट' : 'AI Business Co-Pilot'}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E07A5F]/30 text-[#E07A5F] border border-[#E07A5F]/40 font-mono">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-slate-300 text-sm">
              {language === 'hi'
                ? 'त्योहारी मार्केटिंग अभियान, व्हाट्सएप प्रचार, विवरण और सोशल मीडिया कैप्शन एआई से तैयार करें।'
                : 'Instantly generate high-converting WhatsApp promotions, SEO meta, service descriptions, and Instagram copy.'}
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E07A5F] to-[#DDA15E] text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 self-start md:self-auto"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {language === 'hi' ? 'रणनीति तैयार करें' : 'Generate Content'}
          </button>
        </div>
      </div>

      {/* Grid of Task Types Selector */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Select AI Generation Goal</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {tasksList.map((task) => {
            const Icon = task.icon;
            const isSelected = activeTab === task.id;
            return (
              <button
                key={task.id}
                onClick={() => {
                  setActiveTab(task.id);
                  setGeneratedResult('');
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'border-[#E07A5F] bg-[#FAF4EB] text-stone-900 shadow-xs ring-1 ring-[#E07A5F]'
                    : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-[#E07A5F]' : 'text-stone-400'}`} />
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F]" />}
                </div>
                <div>
                  <p className="font-bold text-xs truncate">{task.label}</p>
                  <p className="text-[9px] text-stone-400 line-clamp-1">{task.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
          <h3 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E07A5F]" />
            {language === 'hi' ? 'अभियान पैरामीटर' : 'Campaign Parameters'}
          </h3>

          {/* Festival Context fields */}
          {(activeTab === 'festival_campaign' || activeTab === 'instagram_caption' || activeTab === 'offer_title' || activeTab === 'offer_description') && (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'hi' ? 'त्योहार या अवसर' : 'Festival or Occasion'}
                </label>
                <select
                  value={festivalName}
                  onChange={(e) => setFestivalName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
                >
                  <option value="Diwali Grand Festive Glow">Diwali Grand Festive Glow</option>
                  <option value="Karwa Chauth Specials">Karwa Chauth Specials</option>
                  <option value="Eid Mubarak Delights">Eid Mubarak Delights</option>
                  <option value="Christmas & New Year Bash">Christmas & New Year Bash</option>
                  <option value="Monsoon Pampering Deals">Monsoon Pampering Deals</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'hi' ? 'छूट प्रतिशत (Discount %)' : 'Discount Percentage (%)'}
                </label>
                <input
                  type="number"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                />
              </div>
            </>
          )}

          {/* Service focused fields */}
          {(activeTab === 'service_description' || activeTab === 'whatsapp_promo' || activeTab === 'festival_campaign') && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {language === 'hi' ? 'लक्षित सेवाएं' : 'Targeted Services / Packages'}
              </label>
              <textarea
                rows={2}
                value={servicesTargeted}
                onChange={(e) => setServicesTargeted(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs resize-none"
              />
            </div>
          )}

          {/* Review Replies fields */}
          {activeTab === 'review_reply' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'hi' ? 'ग्राहक समीक्षा' : 'Customer Review Text'}
                </label>
                <textarea
                  rows={3}
                  value={reviewInput}
                  onChange={(e) => setReviewInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'hi' ? 'रेटिंग (Stars)' : 'Review Rating'}
                </label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                  <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  <option value={2}>⭐⭐ (2 Stars)</option>
                  <option value={1}>⭐ (1 Star)</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'slow_day_booster' && (
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 space-y-1">
              <p className="font-semibold">Weekday High-Occupancy Optimizer</p>
              <p className="text-blue-800 leading-relaxed">
                Gemini will scan our real services and formulate dynamic Happy Hours, bundle pairings, and whatsapp drafts to fill empty chairs on weekday afternoons.
              </p>
            </div>
          )}

          {activeTab === 'seo_meta' && (
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-purple-900 space-y-1">
              <p className="font-semibold">Google Rank Strategy</p>
              <p className="text-purple-800 leading-relaxed">
                Formulates Meta Title tags, Meta Keywords, and OG Share snippets tailored to your salon brand category.
              </p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#0F172A] hover:bg-[#E07A5F] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#E07A5F]" />}
            {language === 'hi' ? 'एआई आउटपुट बनाएं' : 'Craft Copy with Gemini'}
          </button>
        </div>

        {/* Output Column with Live Edit Capabilities */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                  {language === 'hi' ? 'तैयार सामग्री (AI Generated)' : 'Generated Output'}
                </span>
                {generatedResult && (
                  <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 animate-pulse">
                    ✏️ Editable Content
                  </span>
                )}
              </div>

              {generatedResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(generatedResult)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-medium transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Broadcast
                  </a>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#E07A5F] animate-spin" />
                <p className="text-sm font-medium text-stone-600">
                  {language === 'hi' ? 'एआई सामग्री तैयार कर रहा है...' : 'AI Co-Pilot is crafting your campaign copy...'}
                </p>
                <p className="text-xs text-stone-400">Grounded in luxury salon & spa database context</p>
              </div>
            ) : generatedResult ? (
              <div className="space-y-2">
                <textarea
                  rows={14}
                  value={generatedResult}
                  onChange={(e) => setGeneratedResult(e.target.value)}
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed font-mono resize-y focus:outline-none focus:ring-1 focus:ring-[#E07A5F]"
                  placeholder="Edit generated content here..."
                />
                <p className="text-[10px] text-stone-400 italic">
                  *This text field is live. You can make adjustments above before copying or sharing with your audience.
                </p>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 text-stone-400">
                <Sparkles className="w-10 h-10 text-stone-300 animate-bounce" />
                <p className="text-sm font-medium text-stone-600">
                  {language === 'hi' ? 'पैरामीटर चुनें और जेनरेट पर क्लिक करें' : 'Select parameters and click Generate'}
                </p>
                <p className="text-xs max-w-sm">
                  Creates ready-to-copy, custom editable templates, descriptions, and FAQs grounded in real services.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
