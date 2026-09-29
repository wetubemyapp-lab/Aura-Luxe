import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { pg } from '../db.ts';

export const aiRouter = Router();

// Server-side Gemini Client Initialization according to gemini-api guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Customer AI Stylist & Treatment Advisor Concierge
aiRouter.post('/concierge', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      prompt,
      hairSkinType = '',
      occasion = '',
      language = 'en',
      business_id = 1,
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Fetch active services for this business to ground recommendations
    const srvRes = await pg.query<any>(
      `SELECT id, title, title_hi, category, price, duration_mins, description
       FROM services WHERE business_id = $1 AND is_archived = FALSE LIMIT 10`,
      [business_id]
    );

    const busRes = await pg.query<any>(
      `SELECT name, category, primary_currency FROM businesses WHERE id = $1`,
      [business_id]
    );
    const business = busRes.rows[0];
    const servicesList = srvRes.rows.map((s: any) =>
      `ID: ${s.id} | ${s.title} (${s.category}) - ${business?.primary_currency || '₹'}${s.price}, ${s.duration_mins} mins: ${s.description}`
    ).join('\n');

    const systemInstruction = `
You are the elite "Aura AI Concierge & Treatment Stylist" for ${business?.name || 'Aura Luxe'}, a luxury salon, spa, barber, and personal care studio.
Your role is to guide customers with expert styling, skin rituals, grooming advice, and recommend the best available services from the catalog.

Services Catalog:
${servicesList}

Rules:
1. Always be warm, sophisticated, encouraging, and helpful.
2. If language is 'hi', reply in natural, welcoming Hindi (Devanagari script) or Hinglish when appropriate.
3. If language is 'en', reply in English.
4. Recommend 1-3 specific services from the catalog when relevant, providing their ID and why they suit the customer.
5. Provide practical care tips (e.g. pre-treatment prep, post-treatment maintenance).
6. Format your answer with clean markdown bullet points.
    `.trim();

    const userContent = `Customer inquiry: "${prompt}"\nCustomer profile details: Hair/Skin Type: ${hairSkinType || 'Not specified'}, Event/Occasion: ${occasion || 'Routine maintenance'}. Language preferred: ${language}.`;

    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback response when API key is pending
      const sampleMatch = srvRes.rows[0];
      return res.json({
        reply: language === 'hi'
          ? `नमस्ते! आपकी ज़रूरतों के लिए हम हमारे विशेष "${sampleMatch?.title_hi || sampleMatch?.title || 'रॉयल केयर'}" की सलाह देते हैं। यह आपकी त्वचा और बालों को निखारने के लिए आदर्श है। आप इसे सीधे बुक कर सकते हैं!`
          : `Hello! Based on your query, we highly recommend trying our **${sampleMatch?.title || 'Signature Treatment'}** (${business?.primary_currency || '₹'}${sampleMatch?.price}). It offers deep revitalization and restorative nourishment for your specific needs.`,
        recommendedServiceIds: sampleMatch ? [sampleMatch.id] : [],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userContent,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'We are delighted to assist with your styling consultation.';

    // Extract any matching service IDs mentioned
    const recommendedIds: number[] = [];
    for (const s of (srvRes.rows as any[])) {
      if (reply.toLowerCase().includes(s.title.toLowerCase()) || reply.includes(`ID: ${s.id}`) || reply.includes(`#${s.id}`)) {
        recommendedIds.push(s.id);
      }
    }

    return res.json({
      reply,
      recommendedServiceIds: recommendedIds.length > 0 ? recommendedIds : (srvRes.rows[0] ? [(srvRes.rows[0] as any).id] : []),
    });
  } catch (error: any) {
    console.error('AI Concierge error:', error);
    return res.status(500).json({
      error: 'AI Concierge temporarily unavailable',
      fallback: 'We recommend checking our featured services catalog or consulting our master stylists in person.',
    });
  }
});

// Owner AI Business Co-Pilot: Campaigns, Slow Day Optimization, WhatsApp Promos, Review Replies
aiRouter.post('/copilot', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      taskType, // 'festival_campaign' | 'whatsapp_promo' | 'slow_day_booster' | 'review_reply'
      festivalName = 'Diwali',
      discount = '20',
      businessName = 'Aura Luxe Unisex Salon & Spa',
      businessCategory = 'unisex_salon',
      services = 'Hair Styling, 24K Facial, Aromatherapy Spa',
      reviewText = '',
      reviewRating = 5,
      language = 'en',
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      // Dynamic fallback
      let fallbackText = '';
      if (taskType === 'festival_campaign') {
        fallbackText = `🎉 *${festivalName} Grand Festive Glow Campaign* 🎉\nCelebrate with timeless elegance at ${businessName}! Enjoy up to ${discount}% OFF on all luxury packages. Book early to reserve prime weekend slots: wa.me/919876543210`;
      } else if (taskType === 'whatsapp_promo') {
        fallbackText = `✨ Special WhatsApp Exclusive: Book your ${services} this week & receive complimentary hydration scalp therapy! Code: GLOW${discount}`;
      } else if (taskType === 'review_reply') {
        fallbackText = `Thank you so much for your wonderful ${reviewRating}-star review! Our team at ${businessName} is thrilled that you enjoyed your service. We look forward to welcoming you back soon. ✨`;
      } else {
        fallbackText = `💡 Slow Day Strategy: Introduce "Happy Hours" from Tuesday to Thursday (12 PM - 4 PM) offering a bundled 15% discount on multi-service bookings to boost salon chair occupancy by ~35%.`;
      }
      return res.json({ result: fallbackText });
    }

    let prompt = '';
    let systemInstruction = `You are the executive AI Growth Strategist and Marketing Director for ${businessName}, an appointment-based business platform OS. Respond in ${language === 'hi' ? 'Hindi / Hinglish' : 'English'}. Keep copy engaging, crisp, emoji-rich, and ready to broadcast or post.`;

    if (taskType === 'festival_campaign') {
      prompt = `Create a high-converting ${festivalName} festival marketing campaign for our ${businessCategory} offering ${discount}% discount. Include:\n1. Catchy headline\n2. 3 key selling points\n3. Ready-to-copy WhatsApp broadcast message with emojis and placeholders\n4. Instagram / Social media caption with hashtags.`;
    } else if (taskType === 'whatsapp_promo') {
      prompt = `Draft 2 distinct WhatsApp promotional message templates for ${businessName}. Highlight services: ${services} with a ${discount}% seasonal coupon. Use bold formatting (*text*), bullet points, and a clear Call to Action link.`;
    } else if (taskType === 'slow_day_booster') {
      prompt = `Analyze how to fill empty slots on slow weekday afternoons (e.g. Tuesday-Thursday 1 PM - 4 PM) for our ${businessCategory}. Suggest 3 concrete actionable strategies, pricing adjustments, combo bundles, and promotional hooks.`;
    } else if (taskType === 'review_reply') {
      prompt = `Draft a polite, gracious, and brand-building reply to this customer review (${reviewRating} stars): "${reviewText || 'Had an amazing experience, love the hair and massage!'}".`;
    } else {
      prompt = `Provide 3 strategic revenue enhancement tips for ${businessName}.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ result: response.text });
  } catch (error: any) {
    console.error('AI Copilot error:', error);
    return res.status(500).json({ error: 'Failed to generate AI strategy' });
  }
});
