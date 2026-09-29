import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { ServiceItem } from '../../types/index.ts';
import { Scissors, Plus, Trash2, Clock, CheckCircle2, Sparkles } from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const { token } = useAuth();
  const { settings } = useBusiness();
  const { language, t } = useLanguage();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleHi, setNewTitleHi] = useState('');
  const [newCategory, setNewCategory] = useState('Hair');
  const [newPrice, setNewPrice] = useState('');
  const [newDuration, setNewDuration] = useState('45');
  const [newDesc, setNewDesc] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          title_hi: newTitleHi || undefined,
          category: newCategory,
          price: parseFloat(newPrice),
          duration_mins: parseInt(newDuration) || 45,
          description: newDesc || undefined,
          image_url: newImageUrl || undefined,
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewTitleHi('');
        setNewPrice('');
        setNewDesc('');
        setNewImageUrl('');
        setShowAddForm(false);
        await fetchServices();
      }
    } catch (err) {
      console.error('Failed to add service:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        await fetchServices();
      }
    } catch (err) {
      console.error('Failed to delete service:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DBD0] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E6] text-[#E07A5F] text-xs font-bold uppercase tracking-wider mb-2">
            <Scissors className="w-3.5 h-3.5" />
            <span>Service Catalog Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A]">
            {t('services')}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {language === 'hi'
              ? 'सेवाएं, कीमतें, अवधि और विवरण प्रबंधित करें'
              : 'Add, update, or remove customer-facing services stored dynamically in PostgreSQL.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 bg-[#E07A5F] hover:bg-[#D47055] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'Add New Service'}</span>
        </button>
      </div>

      {/* Add Service Modal/Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddService}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E07A5F]/40 shadow-lg space-y-4 animate-fade-in"
        >
          <h3 className="text-lg font-serif font-bold text-[#0F172A]">Add New Service</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title (EN)</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Keratin Hair Spa"
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title (HI / हिन्दी)</label>
              <input
                type="text"
                value={newTitleHi}
                onChange={(e) => setNewTitleHi(e.target.value)}
                placeholder="उदा. केराटिन हेयर स्पा"
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
              >
                <option value="Hair">Hair & Styling</option>
                <option value="Skin & Facial">Skin & Facial</option>
                <option value="Spa & Massage">Spa & Massage</option>
                <option value="Nails & Studio">Nails & Studio</option>
                <option value="Grooming & Shave">Grooming & Shave</option>
                <option value="Makeup & Bridal">Makeup & Bridal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹)</label>
              <input
                type="number"
                required
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="850"
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL (Optional)</label>
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Treatment details and benefits..."
              className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {submitting ? 'Saving to Database...' : 'Save Service'}
          </button>
        </form>
      )}

      {/* Services List Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-[#E2DBD0] p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] uppercase font-bold text-[#E07A5F] tracking-wider">
                  {s.category}
                </span>
                <span className="text-sm font-serif font-bold text-[#0F172A]">
                  {settings?.primary_currency || '₹'}{Number(s.price).toLocaleString()}
                </span>
              </div>

              <h3 className="font-serif font-bold text-base text-[#0F172A] mt-1">
                {s.title}
              </h3>
              {s.title_hi && (
                <p className="text-xs text-slate-500 font-sans">{s.title_hi}</p>
              )}

              <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                {s.description || 'No description provided.'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#E07A5F]" />
                {s.duration_mins} {t('mins')}
              </span>

              <button
                onClick={() => handleDeleteService(s.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                title="Delete Service"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
