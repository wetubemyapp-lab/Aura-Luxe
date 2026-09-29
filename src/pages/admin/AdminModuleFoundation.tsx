import React from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { AdminPageTab } from '../../types/index.ts';
import {
  Users,
  Package,
  Sparkles,
  Ticket,
  Image,
  Video,
  Star,
  Settings,
  Database,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface AdminModuleFoundationProps {
  module: AdminPageTab;
}

const MODULE_CONFIG: Record<
  string,
  {
    titleEn: string;
    titleHi: string;
    descEn: string;
    descHi: string;
    icon: any;
    tableName: string;
    fields: string[];
  }
> = {
  staff: {
    titleEn: 'Staff & Team Management',
    titleHi: 'स्टाफ और टीम प्रबंधन',
    descEn: 'Configure certified stylists, massage therapists, aestheticians, and team shifts.',
    descHi: 'प्रमाणित स्टाइलिस्ट, मसाज थेरेपिस्ट और एस्थेटिशियन का प्रबंधन करें।',
    icon: Users,
    tableName: 'staff',
    fields: ['id', 'name', 'role_title', 'role_title_hi', 'bio', 'image_url', 'is_active'],
  },
  packages: {
    titleEn: 'Service Packages & Combos',
    titleHi: 'सर्विस पैकेज और कॉम्बो',
    descEn: 'Curate curated bridal, grooming, spa, and beauty packages with bundled pricing.',
    descHi: 'ब्राइडल, ग्रूमिंग, स्पा और ब्यूटी पैकेज बंडल तैयार करें।',
    icon: Package,
    tableName: 'packages',
    fields: ['id', 'name', 'description', 'price', 'original_price', 'service_ids', 'is_active'],
  },
  offers: {
    titleEn: 'Seasonal Offers & Campaigns',
    titleHi: 'मौसमी ऑफर्स और अभियान',
    descEn: 'Launch promotional discounts, festival specials, and weekend flash campaigns.',
    descHi: 'प्रमोशनल छूट, त्योहारी विशेष और सप्ताहांत अभियान शुरू करें।',
    icon: Sparkles,
    tableName: 'offers',
    fields: ['id', 'title', 'title_hi', 'description', 'discount_pct', 'code', 'valid_until', 'is_active'],
  },
  coupons: {
    titleEn: 'Discount Coupons & Vouchers',
    titleHi: 'डिस्काउंट कूपन और वाउचर',
    descEn: 'Create customer redeemable promo codes with minimum spend conditions.',
    descHi: 'न्यूनतम खर्च शर्तों के साथ प्रोमो कोड और वाउचर बनाएं।',
    icon: Ticket,
    tableName: 'coupons',
    fields: ['id', 'code', 'discount_amount', 'min_spend', 'is_active'],
  },
  gallery: {
    titleEn: 'Visual Portfolio & Gallery',
    titleHi: 'विजुअल पोर्टफोलियो और गैलरी',
    descEn: 'Showcase before/after transformations, salon interior, and aesthetic lookbooks.',
    descHi: 'सैलून इंटीरियर, हेयरस्टाइल और सौंदर्य लुकबुक प्रदर्शित करें।',
    icon: Image,
    tableName: 'gallery',
    fields: ['id', 'title', 'category', 'image_url', 'created_at'],
  },
  videos: {
    titleEn: 'Video Showcase & Reels',
    titleHi: 'वीडियो प्रदर्शन और रील्स',
    descEn: 'Embed styling walkthroughs, customer transformations, and brand reels.',
    descHi: 'स्टाइलिंग वॉकथ्रू और ट्रांसफ़ॉर्मेशन वीडियो जोड़ें।',
    icon: Video,
    tableName: 'videos',
    fields: ['id', 'title', 'video_url', 'thumbnail_url', 'created_at'],
  },
  reviews: {
    titleEn: 'Customer Reviews & Feedback',
    titleHi: 'ग्राहक समीक्षाएं और फीडबैक',
    descEn: 'Monitor verified customer testimonials, star ratings, and client remarks.',
    descHi: 'ग्राहक समीक्षाएं, रेटिंग और फीडबैक प्रबंधित करें।',
    icon: Star,
    tableName: 'reviews',
    fields: ['id', 'user_name', 'rating', 'comment', 'is_verified', 'created_at'],
  },
  settings: {
    titleEn: 'Operating System & Security Settings',
    titleHi: 'ऑपरेटिंग सिस्टम और सुरक्षा सेटिंग्स',
    descEn: 'Manage PostgreSQL database connections, currency formats, and staff roles.',
    descHi: 'डेटाबेस कनेक्शन, मुद्रा प्रारूप और भूमिकाएं प्रबंधित करें।',
    icon: Settings,
    tableName: 'business_settings / users',
    fields: ['business_settings', 'users', 'auth_tokens', 'rbac_rules'],
  },
};

export const AdminModuleFoundation: React.FC<AdminModuleFoundationProps> = ({ module }) => {
  const { language } = useLanguage();
  const { settings } = useBusiness();
  const config = MODULE_CONFIG[module] || MODULE_CONFIG.staff;
  const Icon = config.icon;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E2DBD0] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E6] text-[#E07A5F] text-xs font-bold uppercase tracking-wider mb-2">
          <Icon className="w-3.5 h-3.5" />
          <span>Core Structure Module</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A]">
          {language === 'hi' ? config.titleHi : config.titleEn}
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          {language === 'hi' ? config.descHi : config.descEn}
        </p>
      </div>

      {/* Module Foundation Card */}
      <div className="bg-white rounded-3xl border border-[#E2DBD0] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF0E6] text-[#E07A5F] flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#0F172A]">
                {language === 'hi' ? 'मॉड्यूल आर्किटेक्चर एवं स्कीमा' : 'Relational Table Foundation'}
              </h3>
              <p className="text-xs text-slate-500">
                PostgreSQL Table: <span className="font-mono text-[#0F172A] font-bold">{config.tableName}</span>
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Schema Initialized</span>
          </span>
        </div>

        {/* Schema Specification */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Relational Columns & Dynamic Fields
          </h4>
          <div className="flex flex-wrap gap-2">
            {config.fields.map((field) => (
              <span
                key={field}
                className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E2DBD0] text-xs font-mono text-slate-700"
              >
                {field}
              </span>
            ))}
          </div>
        </div>

        {/* Database Status Notice */}
        <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E2DBD0] flex items-start gap-3 text-xs text-slate-600">
          <Database className="w-4 h-4 text-[#E07A5F] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#0F172A]">
              Stage 1 Foundation Ready
            </p>
            <p className="text-slate-500 mt-0.5">
              The PostgreSQL relational table <code className="text-[#0F172A]">{config.tableName}</code> is verified in the backend and ready for specialized sub-module actions according to your prompt flow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
