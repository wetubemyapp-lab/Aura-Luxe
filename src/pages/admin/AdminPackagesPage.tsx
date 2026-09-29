import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { PackageItem } from '../../types/index.ts';
import { Package, Plus, Trash2, Tag, Sparkles } from 'lucide-react';

export const AdminPackagesPage: React.FC = () => {
  const { token } = useAuth();
  const { activeBusiness } = useBusiness();
  const { language, t } = useLanguage();

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currency = activeBusiness?.primary_currency || '₹';

  const fetchPackages = async () => {
    try {
      const bId = activeBusiness?.id || 1;
      const res = await fetch(`/api/packages?businessId=${bId}`);
      if (res.ok) {
        const data = await res.json();
        setPackages(data.packages);
      }
    } catch (err) {
      console.error('Failed to load packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [activeBusiness]);

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness?.id || 1,
          name,
          description: desc,
          price: parseFloat(price),
          original_price: originalPrice ? parseFloat(originalPrice) : undefined,
        }),
      });

      if (res.ok) {
        setName('');
        setDesc('');
        setPrice('');
        setOriginalPrice('');
        setShowAddForm(false);
        await fetchPackages();
      }
    } catch (err) {
      console.error('Failed to add package:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DBD0] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E6] text-[#E07A5F] text-xs font-bold uppercase tracking-wider mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>Curated Service Bundles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A]">
            {language === 'hi' ? 'सर्विस पैकेजेस और कॉम्बो' : 'Packages & Bundled Combos'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {language === 'hi'
              ? 'ब्राइडल, ग्रूमिंग, स्पा और वेलनेस पैकेज प्रबंधित करें'
              : 'Create high-value package combinations with bundled savings.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 bg-[#E07A5F] hover:bg-[#D47055] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'Create Package'}</span>
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddPackage}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E07A5F]/40 shadow-lg space-y-4 animate-fade-in"
        >
          <h3 className="text-lg font-serif font-bold text-[#0F172A]">Create New Service Package</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Package Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Bridal Glow Ritual"
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bundle Price ({currency})</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="4500"
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Regular Price ({currency})</label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="5500"
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Included Services & Highlights</label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. Scissor Styling Cut + 24K Gold Facial + Hot Stone Massage"
              className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Publish Package'}
          </button>
        </form>
      )}

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-3xl border border-[#E2DBD0] p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-[#E07A5F] tracking-wider">
                  Package Deal
                </span>
                <div className="text-right">
                  <span className="font-serif font-bold text-lg text-[#0F172A]">
                    {currency}{Number(pkg.price).toLocaleString()}
                  </span>
                  {pkg.original_price && (
                    <span className="text-xs text-slate-400 line-through ml-2">
                      {currency}{Number(pkg.original_price).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-serif font-bold text-lg text-[#0F172A] mt-1">{pkg.name}</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{pkg.description}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-emerald-600 font-semibold text-[11px]">Active in Catalog</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
