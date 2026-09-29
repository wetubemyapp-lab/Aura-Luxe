import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { StaffItem } from '../../types/index.ts';
import { Users, Plus, Trash2, DollarSign, Award, Sparkles } from 'lucide-react';

export const AdminStaffPage: React.FC = () => {
  const { token } = useAuth();
  const { activeBusiness } = useBusiness();
  const { language, t } = useLanguage();

  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [roleTitleHi, setRoleTitleHi] = useState('');
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [commissionRate, setCommissionRate] = useState('20');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      const bId = activeBusiness?.id || 1;
      const res = await fetch(`/api/staff?businessId=${bId}`);
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff);
      }
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [activeBusiness]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !roleTitle) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness?.id || 1,
          name,
          role_title: roleTitle,
          role_title_hi: roleTitleHi || undefined,
          bio: bio || undefined,
          specialties: specialties || undefined,
          commission_rate: parseFloat(commissionRate) || 15,
          image_url: imageUrl || undefined,
        }),
      });

      if (res.ok) {
        setName('');
        setRoleTitle('');
        setRoleTitleHi('');
        setBio('');
        setSpecialties('');
        setImageUrl('');
        setShowAddForm(false);
        await fetchStaff();
      }
    } catch (err) {
      console.error('Failed to add staff:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (!confirm('Remove this specialist from staff roster?')) return;
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchStaff();
      }
    } catch (err) {
      console.error('Failed to delete staff:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DBD0] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E6] text-[#E07A5F] text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Staff Capabilities & Commission Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A]">
            {language === 'hi' ? 'स्टाफ एवं रोस्टर प्रबंधन' : 'Staff, Specialists & Commission'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {language === 'hi'
              ? 'प्रमाणित स्टाइलिस्ट, कलाकार, विशेषज्ञ और कमीशन दरें प्रबंधित करें'
              : 'Configure professionals, capability specialties, and commission attribution rules.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 bg-[#E07A5F] hover:bg-[#D47055] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'Add Team Member'}</span>
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddStaff}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E07A5F]/40 shadow-lg space-y-4 animate-fade-in"
        >
          <h3 className="text-lg font-serif font-bold text-[#0F172A]">Add Specialist to Roster</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram Oberoi"
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role Title (English)</label>
              <input
                type="text"
                required
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Senior Master Stylist"
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Commission Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Specialties & Skills</label>
              <input
                type="text"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                placeholder="e.g. Balayage, Razor Fades, Deep Tissue"
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Photo URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {submitting ? 'Saving to Database...' : 'Save Team Member'}
          </button>
        </form>
      )}

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-3xl border border-[#E2DBD0] p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3">
                <img
                  src={s.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={s.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#E07A5F]"
                />
                <div>
                  <h3 className="font-serif font-bold text-base text-[#0F172A]">{s.name}</h3>
                  <p className="text-xs text-[#E07A5F] font-medium">{s.role_title}</p>
                </div>
              </div>

              {s.specialties && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Core Specialties</p>
                  <p className="text-xs text-slate-700 mt-0.5">{s.specialties}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                {s.commission_rate}% Commission
              </span>
              <button
                onClick={() => handleDeleteStaff(s.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
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
