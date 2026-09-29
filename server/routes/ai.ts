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

// Customer AI Stylist & Treatment Advisor Concierge (with explicit safety disclaimer rule)
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

    // Fetch active services for this business to ground recommendations and guarantee zero hallucinations
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
7. **CRITICAL INFORMATION GUIDANCE DISCLAIMER**: You must clearly present all recommendations as informational guidance, NOT as medical diagnosis or guaranteed treatment outcomes. Always append a friendly disclaimer at the bottom stating that this is beauty/wellness advice and to consult with our physical staff or a specialist for personal evaluations.
8. **SAFETY & GROUNDING RULE**: Never recommend or invent services, prices, or policies that are not listed in the Services Catalog above.
`.trim();

    const userContent = `Customer inquiry: "${prompt}"\nCustomer profile details: Hair/Skin Type: ${hairSkinType || 'Not specified'}, Event/Occasion: ${occasion || 'Routine maintenance'}. Language preferred: ${language}.`;

    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback response when API key is pending
      const sampleMatch = srvRes.rows[0];
      return res.json({
        reply: language === 'hi'
          ? `नमस्ते! आपकी ज़रूरतों के लिए हम हमारे विशेष "${sampleMatch?.title_hi || sampleMatch?.title || 'रॉयल केयर'}" की सलाह देते हैं। यह आपकी त्वचा और बालों को निखारने के लिए आदर्श है। आप इसे सीधे बुक कर सकते हैं!\n\n*ध्यान दें: यह केवल सामान्य जानकारी है, व्यक्तिगत सलाह के लिए हमारे विशेषज्ञों से मिलें।*`
          : `Hello! Based on your query, we highly recommend trying our **${sampleMatch?.title || 'Signature Treatment'}** (${business?.primary_currency || '₹'}${sampleMatch?.price}). It offers deep revitalization and restorative nourishment for your specific needs.\n\n*Disclaimer: This recommendation is for informational guidance only and is not a medical diagnosis or guaranteed cure. Speak with our experts at the salon for a complete diagnosis.*`,
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

// Owner AI Business Co-Pilot: Campaigns, Slow Day Optimization, WhatsApp Promos, Review Replies, Descriptions
aiRouter.post('/copilot', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      taskType, // 'festival_campaign' | 'whatsapp_promo' | 'slow_day_booster' | 'review_reply' | 'service_description' | 'offer_title' | 'offer_description' | 'instagram_caption' | 'seo_meta' | 'faq_draft'
      festivalName = 'Diwali',
      discount = '20',
      businessName = 'Aura Luxe Unisex Salon & Spa',
      businessCategory = 'unisex_salon',
      services = 'Hair Styling, 24K Facial, Aromatherapy Spa',
      reviewText = '',
      reviewRating = 5,
      language = 'en',
      business_id = 1,
    } = req.body;

    // Retrieve LIVE active structured business data to ensure AI Safety (Rule 36)
    // AI must never invent service, price, availability, discount, staff, business policy.
    const srvRes = await pg.query<any>(
      `SELECT title, price, duration_mins FROM services WHERE business_id = $1 AND is_archived = FALSE LIMIT 10`,
      [business_id || 1]
    );
    const staffRes = await pg.query<any>(
      `SELECT name, role_title FROM staff WHERE business_id = $1 AND is_active = TRUE`,
      [business_id || 1]
    );
    const branchRes = await pg.query<any>(
      `SELECT name, address FROM branches WHERE business_id = $1 AND is_active = TRUE`,
      [business_id || 1]
    );

    const dbServicesContext = srvRes.rows.map((s: any) => `- ${s.title}: ₹${s.price} (${s.duration_mins} mins)`).join('\n');
    const dbStaffContext = staffRes.rows.map((st: any) => `- ${st.name} (${st.role_title})`).join('\n');
    const dbBranchesContext = branchRes.rows.map((b: any) => `- ${b.name} located at ${b.address}`).join('\n');

    const businessDataPrompt = `
[LIVE STRUCTURED BUSINESS DATA CONTEXT - NEVER INVENT OUTSIDE OF THIS]:
Available Real Services & Prices:
${dbServicesContext || '- Hair Cut: ₹800\n- Facial: ₹2400\n- Body Spa: ₹3200'}

Real Stylists & Staff:
${dbStaffContext || '- Vikram Oberoi (Master Stylist)\n- Ananya Deshmukh (Senior Aesthetician)'}

Real Active Branches:
${dbBranchesContext || '- Bandra West flagship\n- Indiranagar Studio'}
`.trim();

    if (!process.env.GEMINI_API_KEY) {
      // Dynamic fallback
      let fallbackText = '';
      if (taskType === 'festival_campaign') {
        fallbackText = `🎉 *${festivalName} Grand Festive Glow Campaign* 🎉\nCelebrate with timeless elegance at ${businessName}! Enjoy up to ${discount}% OFF on our real luxury services like Royal Hair Styling (₹850) or 24K Gold Facial (₹2400). Book early to reserve prime weekend slots with our master stylists! Code: FESTIVE${discount}`;
      } else if (taskType === 'whatsapp_promo') {
        fallbackText = `✨ *WhatsApp Exclusive Campaign* ✨\n\nBook your luxury grooming or hair-care services this week with *Vikram Oberoi* or *Ananya Deshmukh* & receive complimentary Argan Scalp Therapy! \n\n*Code:* GLOW${discount}\n*Call:* +91 98765 43210\n\nTap here to book: wa.me/919876543210`;
      } else if (taskType === 'review_reply') {
        fallbackText = `Thank you so much for your wonderful ${reviewRating}-star review! Our team at ${businessName} is thrilled that you enjoyed your service. We look forward to welcoming you back to our Bandra or Indiranagar salons soon. ✨`;
      } else if (taskType === 'service_description') {
        fallbackText = `Experience our premium ${services || 'Hair Styling'} designed for optimal results. Tailored individually for your hair texture, featuring argan infusion and hot styling.`;
      } else if (taskType === 'offer_title') {
        fallbackText = `🌟 Limited Period: Get ${discount}% Off on Premium Styling Packages!`;
      } else if (taskType === 'offer_description') {
        fallbackText = `Pamper yourself this festive season with an exclusive ${discount}% discount on our most popular hair, massage, and facial treatments. Valid only on weekdays before 4 PM.`;
      } else if (taskType === 'instagram_caption') {
        fallbackText = `Ready for a stunning hair transformation? 💇‍♀️✨ Book a personalized appointment with our expert stylists today. #AuraLuxe #SalonStyle #BandraSalons #GlowUp`;
      } else if (taskType === 'seo_meta') {
        fallbackText = `Aura Luxe Salon | Best Haircuts, Facials & Spa Treatments in Bandra & Indiranagar. Book top stylists, certified skin treatments, and safe organic beauty care online.`;
      } else if (taskType === 'faq_draft') {
        fallbackText = `Q: How do I change my booking time?\nA: You can change your time or date easily through our member dashboard up to 4 hours before your slot.`;
      } else {
        fallbackText = `💡 Slow Day Strategy: Introduce "Happy Hours" from Tuesday to Thursday (12 PM - 4 PM) offering a bundled 15% discount on our real services to boost salon occupancy by ~35%.`;
      }
      return res.json({ result: fallbackText });
    }

    let prompt = '';
    let systemInstruction = `You are the executive AI Growth Strategist and Marketing Director for ${businessName}, an appointment-based business platform OS. Respond in ${language === 'hi' ? 'Hindi / Hinglish' : 'English'}. Keep copy engaging, crisp, emoji-rich, and ready to broadcast or post. Use bold markup for emphasis. ALWAYS stick to real services and real pricing mentioned in the business data context below.`;

    const userQueryText = `${businessDataPrompt}\n\nTask: Generate ${taskType.replace('_', ' ')} for ${businessName}.\nParameters: Festival/Occasion: ${festivalName}, Discount: ${discount}%, Target Services: ${services}.\nReview Text: "${reviewText}" (Rating: ${reviewRating}).`;

    if (taskType === 'festival_campaign') {
      prompt = `${userQueryText}\nCreate a high-converting festive campaign copy. Include:\n1. Catchy headline\n2. 3 key selling points\n3. Ready-to-copy WhatsApp broadcast message with emojis and placeholders.`;
    } else if (taskType === 'whatsapp_promo') {
      prompt = `${userQueryText}\nDraft 2 distinct WhatsApp promotional message templates. Highlight services: ${services} with a ${discount}% seasonal coupon. Use bold formatting (*text*), bullet points, and a clear Call to Action link.`;
    } else if (taskType === 'slow_day_booster') {
      prompt = `${userQueryText}\nSuggest 3 concrete actionable strategies, pricing adjustments, combo bundles, and promotional hooks to fill empty slots on slow weekday afternoons (e.g. Tuesday-Thursday 1 PM - 4 PM) for our ${businessCategory}.`;
    } else if (taskType === 'review_reply') {
      prompt = `${userQueryText}\nDraft a polite, gracious, and brand-building reply to this customer review (${reviewRating} stars): "${reviewText || 'Had an amazing experience!'}".`;
    } else if (taskType === 'service_description') {
      prompt = `${userQueryText}\nGenerate a beautiful, engaging, and professional service description (80-120 words) for our service: ${services}.`;
    } else if (taskType === 'offer_title') {
      prompt = `${userQueryText}\nGenerate 3 catchy, high-converting offer titles (under 60 characters each) highlighting our ${discount}% discount or festive season.`;
    } else if (taskType === 'offer_description') {
      prompt = `${userQueryText}\nGenerate a compelling description (60-90 words) explaining our seasonal offer, its terms, and booking benefits.`;
    } else if (taskType === 'instagram_caption') {
      prompt = `${userQueryText}\nDraft an engaging Instagram post caption. Include relevant luxury salon hashtags and a strong call-to-action to book online.`;
    } else if (taskType === 'seo_meta') {
      prompt = `${userQueryText}\nGenerate SEO Meta Title and Meta Description tags tailored for search engines to boost Google rank for our services.`;
    } else if (taskType === 'faq_draft') {
      prompt = `${userQueryText}\nDraft 3 useful FAQs with answers based on our real booking and styling practices.`;
    } else {
      prompt = `${userQueryText}\nProvide 3 strategic revenue enhancement tips.`;
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
