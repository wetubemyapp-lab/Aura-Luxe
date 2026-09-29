import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { ServiceItem, ServiceAddon } from '../../types/index.ts';
import {
  Sparkles,
  Clock,
  ShieldCheck,
  Check,
  Calendar,
  ArrowLeft,
  DollarSign,
  Heart,
  Loader2,
} from 'lucide-react';
import { Button, Badge } from '../../components/ui/index.ts';

export interface ServiceDetailPageProps {
  serviceId?: number;
  serviceSlug?: string;
  onBack: () => void;
  onBookService: (serviceId: number) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  serviceId,
  serviceSlug,
  onBack,
  onBookService,
}) => {
  const { activeBusiness, categoryConfig } = useBusiness();
  const { language } = useLanguage();

  const [service, setService] = useState<ServiceItem | null>(null);
  const [addons, setAddons] = useState<ServiceAddon[]>([]);
  const [loading, setLoading] = useState(true);

  const currency = activeBusiness?.primary_currency || '₹';

  useEffect(() => {
    async function loadServiceDetail() {
      if (!activeBusiness) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/services?businessId=${activeBusiness.id}`);
        if (res.ok) {
          const data = await res.json();
          const allServices: ServiceItem[] = data.services || [];
          const matched = serviceId
            ? (allServices.find((s) => s.id === serviceId) || null)
            : (allServices[0] || null);
          setService(matched);

          if (matched) {
            const addRes = await fetch(`/api/services/${matched.id}/addons`);
            if (addRes.ok) {
              const addData = await addRes.json();
              setAddons(addData.addons || []);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load service detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadServiceDetail();
  }, [activeBusiness, serviceId]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="w-8 h-8 text-[#D66A78] animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <p className="text-stone-500">Service not found.</p>
        <Button variant="outline" onClick={onBack}>Back to Services</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#566176] hover:text-[#1E2433] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Services
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Service Media */}
        <div className="lg:col-span-6 rounded-3xl overflow-hidden shadow-2xl border border-[#EAE5DF] aspect-[4/3] bg-stone-100">
          <img
            src={service.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Service Details & Booking Card */}
        <div className="lg:col-span-6 glass-card rounded-3xl p-6 sm:p-8 border border-[#EAE5DF] space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="accent" size="xs">
                {service.category.replace('_', ' ').toUpperCase()}
              </Badge>
              <span className="text-xs text-[#8491A5] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#C89B53]" />
                {service.duration_mins} Minutes Duration
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433]">
              {language === 'hi' && service.title_hi ? service.title_hi : service.title}
            </h1>

            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-serif font-bold text-[#1E2433] font-mono">
                {currency}{service.price}
              </span>
              <span className="text-xs text-[#8491A5]">+ Applicable Taxes</span>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-[#EAE5DF]">
            <h3 className="font-serif font-bold text-sm text-[#1E2433]">Ritual Description</h3>
            <p className="text-xs sm:text-sm text-[#566176] leading-relaxed">
              {language === 'hi' && service.description_hi ? service.description_hi : service.description}
            </p>
          </div>

          {/* Add-ons if available */}
          {addons.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#EAE5DF]">
              <h3 className="font-serif font-bold text-sm text-[#1E2433]">Recommended Add-On Rituals</h3>
              <div className="space-y-2">
                {addons.map((add) => (
                  <div key={add.id} className="p-3 rounded-2xl bg-white border border-[#EAE5DF] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#1E2433]">{add.title}</span>
                      <span className="text-[10px] text-[#8491A5] block">+{add.duration_mins} mins</span>
                    </div>
                    <span className="font-bold text-[#D66A78] font-mono">+{currency}{add.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 pt-4 border-t border-[#EAE5DF]">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Includes 100% sterile single-use kits & pre-consultation diagnostics</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => onBookService(service.id)}
              rightIcon={<Calendar className="w-4 h-4" />}
            >
              Reserve This Ritual ({currency}{service.price})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
