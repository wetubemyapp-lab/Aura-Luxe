import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { Sparkles, X, Send, Bot, Calendar, ArrowRight, Loader2 } from 'lucide-react';

interface CustomerAIConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectServiceToBook: (serviceId: number) => void;
}

export const CustomerAIConciergeModal: React.FC<CustomerAIConciergeModalProps> = ({
  isOpen,
  onClose,
  onSelectServiceToBook,
}) => {
  const { language } = useLanguage();
  const { activeBusiness } = useBusiness();
  const [prompt, setPrompt] = useState('');
  const [hairSkinType, setHairSkinType] = useState('All / Sensitive');
  const [occasion, setOccasion] = useState('Festive & Celebration');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; recommendedIds?: number[] }>>([
    {
      sender: 'ai',
      text: language === 'hi'
        ? `नमस्ते! मैं आपका निजी एआई स्टाइल और वेलनेस सलाहकार हूँ। आप अपने बालों, त्वचा, या आने वाले किसी विशेष अवसर के लिए सर्वोत्तम सेवाओं की जानकारी ले सकते हैं।`
        : `Welcome to ${activeBusiness?.name || 'Aura Luxe'}! I am your personal AI Stylist & Treatment Advisor. How can I assist with your grooming, hair, or wellness rituals today?`,
    },
  ]);

  if (!isOpen) return null;

  const quickPrompts = language === 'hi'
    ? [
        'त्योहार या शादी के लिए संपूर्ण ग्रूमिंग पैकेज सुझाएं',
        'संवेदनशील त्वचा के लिए बेस्ट फेशियल कौन सा है?',
        '45 मिनट में त्वरित रिलैक्सिंग हेयर और स्पा ट्रीटमेंट',
      ]
    : [
        'Recommend a head-to-toe glow ritual for a wedding guest',
        'What is best for dry hair and deep scalp repair?',
        'Quick 45-min power grooming package before a meeting',
      ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || prompt;
    if (!query.trim()) return;

    const userMsg = { sender: 'user' as const, text: query };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          hairSkinType,
          occasion,
          language,
          business_id: activeBusiness?.id || 1,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.reply,
            recommendedIds: data.recommendedServiceIds,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.error || 'Sorry, I could not complete the consultation. Please try again.',
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Network issue contacting AI Advisor. Please check our services catalog.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-[#E07A5F]/20">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E07A5F] to-[#DDA15E] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-[#FAF7F2]">
                  {language === 'hi' ? 'ऑरा एआई स्टाइल और ट्रीटमेंट सलाहकार' : 'Aura AI Stylist & Treatment Advisor'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E07A5F]/30 text-[#E07A5F] border border-[#E07A5F]/40 font-mono">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {language === 'hi' ? 'कस्टम ग्रूमिंग और वेलनेस परामर्श' : 'Personalized grooming & wellness consultation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="px-5 py-2.5 bg-[#FAF7F2] border-b border-stone-200 flex flex-wrap gap-2 items-center text-xs">
          <span className="font-medium text-stone-600">
            {language === 'hi' ? 'प्रोफ़ाइल:' : 'Profile:'}
          </span>
          <select
            value={hairSkinType}
            onChange={(e) => setHairSkinType(e.target.value)}
            className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-[#E07A5F]"
          >
            <option value="Normal / Balanced">Normal / Balanced</option>
            <option value="Dry / Frizzy / Sensitive">Dry / Sensitive</option>
            <option value="Oily / Acne-prone">Oily / Acne-prone</option>
            <option value="Chemically Treated / Coloured">Coloured / Treated</option>
          </select>

          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-[#E07A5F]"
          >
            <option value="Festive & Wedding">Festive & Wedding</option>
            <option value="Regular Grooming / Self-Care">Routine Self-Care</option>
            <option value="Corporate / Interview">Executive / Interview</option>
            <option value="Weekend De-Stress">Weekend De-Stress</option>
          </select>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-stone-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-[#E07A5F] flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#E07A5F] text-white rounded-br-none shadow-sm'
                    : 'bg-white text-slate-800 rounded-bl-none border border-stone-200/80 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {m.recommendedIds && m.recommendedIds.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap gap-2">
                    {m.recommendedIds.map((id) => (
                      <button
                        key={id}
                        onClick={() => {
                          onSelectServiceToBook(id);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F172A] text-white text-xs font-medium hover:bg-[#E07A5F] transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {language === 'hi' ? 'यह सेवा बुक करें' : 'Book Recommended Service'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-[#E07A5F] flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white rounded-2xl p-3.5 border border-stone-200 flex items-center gap-2 text-stone-500 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-[#E07A5F]" />
                {language === 'hi' ? 'सलाह तैयार हो रही है...' : 'Crafting expert recommendation...'}
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-3 bg-white border-t border-stone-100 flex gap-2 overflow-x-auto">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="text-xs px-3 py-1.5 rounded-full bg-stone-100 hover:bg-[#E07A5F]/15 hover:text-[#E07A5F] text-stone-700 whitespace-nowrap transition-colors border border-stone-200"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-stone-200 flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              language === 'hi'
                ? 'अपने बालों, चेहरे या पसंदीदा स्टाइल के बारे में पूछें...'
                : 'Ask for advice on skin, haircut, bridal packages, or timing...'
            }
            className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !prompt.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#E07A5F] text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'hi' ? 'भेजें' : 'Send'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
