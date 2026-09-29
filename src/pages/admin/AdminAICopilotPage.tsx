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
} from 'lucide-react';

export const AdminAICopilotPage: React.FC = () => {
  const { language } = useLanguage();
  const { activeBusiness } = useBusiness();

  const [activeTab, setActiveTab] = useState<'festival' | 'whatsapp' | 'slow_day' | 'review'>('festival');
  const [festivalName, setFestivalName] = useState('Diwali Grand Festive Season');
  const [discountPct, setDiscountPct] = useState('20');
  const [servicesTargeted, setServicesTargeted] = useState('Royal Scissor Cut, 24K Gold Facial, Aromatherapy Spa');
  const [reviewInput, setReviewInput] = useState('Had an awesome haircut and deep massage today, staff was so polite!');
  const [reviewRating, setReviewRating] = useState(5);

  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (overrideType?: string) => {
    setIsLoading(true);
    setCopied(false);
    const targetType = overrideType || (
      activeTab === 'festival' ? 'festival_campaign' :
      activeTab === 'whatsapp' ? 'whatsapp_promo' :
      activeTab === 'slow_day' ? 'slow_day_booster' : 'review_reply'
    );

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: targetType,
          festivalName,
          discount: discountPct,
          businessName: activeBusiness?.name || 'Aura Luxe Unisex Salon & Spa',
          businessCategory: activeBusiness?.category || 'unisex_salon',
          services: servicesTargeted,
          reviewText: reviewInput,
          reviewRating,
          language,
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
                ? 'त्योहारी मार्केटिंग अभियान, व्हाट्सएप प्रचार, ऑफ-पीक बूस्टर और समीक्षा उत्तर बनाएं।'
                : 'Automate festival campaigns, high-converting WhatsApp broadcasts, off-peak slot boosters, and gracious review replies.'}
            </p>
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E07A5F] to-[#DDA15E] text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 self-start md:self-auto"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {language === 'hi' ? 'रणनीति तैयार करें' : 'Generate Strategy'}
          </button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-stone-100/80 rounded-2xl border border-stone-200">
        <button
          onClick={() => { setActiveTab('festival'); setGeneratedResult(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'festival'
              ? 'bg-white text-[#0F172A] shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Megaphone className="w-4 h-4 text-[#E07A5F]" />
          {language === 'hi' ? 'त्योहार अभियान (Festival)' : 'Festival Campaigns'}
        </button>

        <button
          onClick={() => { setActiveTab('whatsapp'); setGeneratedResult(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'whatsapp'
              ? 'bg-white text-[#0F172A] shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          {language === 'hi' ? 'व्हाट्सएप प्रचार (WhatsApp)' : 'WhatsApp Promos'}
        </button>

        <button
          onClick={() => { setActiveTab('slow_day'); setGeneratedResult(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'slow_day'
              ? 'bg-white text-[#0F172A] shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-blue-600" />
          {language === 'hi' ? 'ऑफ-पीक बूस्टर (Slow Days)' : 'Slow Day Slot Optimizer'}
        </button>

        <button
          onClick={() => { setActiveTab('review'); setGeneratedResult(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'review'
              ? 'bg-white text-[#0F172A] shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-rose-500" />
          {language === 'hi' ? 'समीक्षा उत्तर (Review Reply)' : 'Review Responder'}
        </button>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
          <h3 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E07A5F]" />
            {language === 'hi' ? 'अभियान पैरामीटर' : 'Campaign Parameters'}
          </h3>

          {activeTab === 'festival' && (
            <>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {language === 'hi' ? 'त्योहार या अवसर' : 'Festival or Occasion'}
                </label>
                <select
                  value={festivalName}
                  onChange={(e) => setFestivalName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                >
                  <option value="Diwali Grand Festive Glow">Diwali Grand Festive Glow</option>
                  <option value="Karwa Chauth & Bridal Season">Karwa Chauth & Bridal Season</option>
                  <option value="Eid Celebrations & Grooming">Eid Celebrations & Grooming</option>
                  <option value="New Year & Christmas Glow">New Year & Christmas Glow</option>
                  <option value="Valentine's Pampering Specials">Valentine's Pampering Specials</option>
                  <option value="Monsoon Hydration Rituals">Monsoon Hydration Rituals</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {language === 'hi' ? 'छूट प्रतिशत (Discount %)' : 'Discount Percentage (%)'}
                </label>
                <input
                  type="number"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>
            </>
          )}

          {(activeTab === 'whatsapp' || activeTab === 'festival') && (
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                {language === 'hi' ? 'लक्षित सेवाएं' : 'Targeted Services'}
              </label>
              <textarea
                rows={2}
                value={servicesTargeted}
                onChange={(e) => setServicesTargeted(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs resize-none"
              />
            </div>
          )}

          {activeTab === 'review' && (
            <>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
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
                <label className="block text-xs font-medium text-stone-700 mb-1">
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

          {activeTab === 'slow_day' && (
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 space-y-2">
              <p className="font-semibold">Off-Peak Strategy Assistant:</p>
              <p className="text-blue-800 leading-relaxed">
                Gemini will formulate dynamic Happy Hours, bundle pairings, and automated WhatsApp broadcasts designed to drive bookings during typically low-occupancy weekday slots (Tue-Thu 12 PM - 4 PM).
              </p>
            </div>
          )}

          <button
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#0F172A] hover:bg-[#E07A5F] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#E07A5F]" />}
            {language === 'hi' ? 'एआई आउटपुट बनाएं' : 'Generate with Gemini AI'}
          </button>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                {language === 'hi' ? 'तैयार सामग्री (AI Generated)' : 'Generated Output'}
              </span>

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
                    Share on WhatsApp
                  </a>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#E07A5F] animate-spin" />
                <p className="text-sm font-medium text-stone-600">
                  {language === 'hi' ? 'एआई को-पायलट सामग्री तैयार कर रहा है...' : 'AI Co-Pilot is crafting your campaign copy...'}
                </p>
                <p className="text-xs text-stone-400">Grounded in luxury salon & spa domain intelligence</p>
              </div>
            ) : generatedResult ? (
              <div className="bg-stone-50 rounded-2xl p-5 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-sans border border-stone-200">
                {generatedResult}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 text-stone-400">
                <Sparkles className="w-10 h-10 text-stone-300" />
                <p className="text-sm font-medium text-stone-600">
                  {language === 'hi' ? 'पैरामीटर चुनें और जेनरेट पर क्लिक करें' : 'Select your parameters and click Generate'}
                </p>
                <p className="text-xs max-w-sm">
                  Creates broadcast-ready text, emoji-rich WhatsApp templates, and actionable business strategies in seconds.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
