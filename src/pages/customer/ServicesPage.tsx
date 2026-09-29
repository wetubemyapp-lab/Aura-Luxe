import React, { useEffect, useState } from 'react';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { ServiceItem } from '../../types/index.ts';
import { Clock, Calendar, Search, Sparkles } from 'lucide-react';

interface ServicesPageProps {
  onSelectServiceForBooking: (serviceId: number) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onSelectServiceForBooking }) => {
  const { activeBusiness } = useBusiness();
  const settings = activeBusiness;
  const { t, language } = useLanguage();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchServices() {
      if (!activeBusiness) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/services?businessId=${activeBusiness.id}`);
        if (res.ok) {
          const data = await res.json();
          setServices(data.services || []);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, [activeBusiness]);

  const categories = ['all', ...Array.from(new Set(services.map((s) => s.category)))];

  const filteredServices = services.filter((s) => {
    const title = (language === 'hi' ? s.title_hi || s.title : s.title).toLowerCase();
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch = title.includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF2F3] text-[#D66A78] text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#C89B53]" />
          <span className="capitalize">{settings?.category?.replace('_', ' ') || 'Services Menu'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1E2433]">
          {t('services')}
        </h1>
        <p className="text-[#566176] text-sm">
          {language === 'hi'
            ? 'हमारी विशेष सेवाओं की सूची देखें और अपनी पसंद का समय चुनें'
            : 'Explore our artisanal menu of grooming, hair, skin, and wellness treatments.'}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-3 rounded-2xl border border-[#EAE5DF]">
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#1E2433] text-white shadow-xs'
                  : 'bg-white/60 text-[#566176] hover:bg-[#FDF2F3] hover:text-[#D66A78]'
              }`}
            >
              {cat === 'all' ? (language === 'hi' ? 'सभी श्रेणियां' : 'All Categories') : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#8491A5] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'सेवा खोजें...' : 'Search services...'}
            className="w-full pl-9 pr-3 py-1.5 glass-input rounded-lg text-xs text-[#1E2433]"
          />
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-stone-200/60 animate-pulse" />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-[#EAE5DF]">
          <p className="text-[#8491A5] text-sm">
            {language === 'hi' ? 'कोई सेवा नहीं मिली।' : 'No services found matching your criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const title = language === 'hi' ? (service.title_hi || service.title) : service.title;
            const desc = language === 'hi' ? (service.description_hi || service.description) : service.description;

            return (
              <div
                key={service.id}
                className="glass-card rounded-2xl overflow-hidden hover-lift flex flex-col justify-between"
              >
                <div>
                  {service.image_url && (
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={service.image_url}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-[#1E2433] text-xs font-serif font-bold px-2.5 py-1 rounded-full shadow-xs">
                        {settings?.primary_currency || '₹'}{Number(service.price).toLocaleString()}
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold text-[#D66A78] tracking-wider">
                        {service.category}
                      </span>
                      <span className="text-xs text-[#8491A5] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#C89B53]" />
                        {service.duration_mins} {t('mins')}
                      </span>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-[#1E2433]">
                      {title}
                    </h3>

                    {desc && (
                      <p className="text-xs text-[#566176] mt-2 leading-relaxed">
                        {desc}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => onSelectServiceForBooking(service.id)}
                    className="btn-primary-accent w-full py-2.5 rounded-xl text-xs font-medium tracking-wide flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t('book_appointment')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
