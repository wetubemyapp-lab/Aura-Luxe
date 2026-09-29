import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { StaffItem } from '../../types/index.ts';
import { Sparkles, Star, Award, Calendar, ArrowRight, UserCheck, Loader2, X } from 'lucide-react';
import { Button, Badge } from '../../components/ui/index.ts';

export interface TeamPageProps {
  onNavigateToBooking: (serviceId?: number) => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({ onNavigateToBooking }) => {
  const { activeBusiness, categoryConfig } = useBusiness();
  const { language } = useLanguage();

  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<StaffItem | null>(null);

  useEffect(() => {
    async function loadTeam() {
      if (!activeBusiness) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/staff?businessId=${activeBusiness.id}`);
        if (res.ok) {
          const data = await res.json();
          setStaffList(data.staff || []);
        }
      } catch (err) {
        console.error('Failed to load staff:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, [activeBusiness]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF4EB] text-[#C89B53] text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Master Practitioners</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#1E2433] tracking-tight">
          Meet Our {categoryConfig.specialistTermPlural}
        </h1>
        <p className="text-sm sm:text-base text-[#566176] font-light">
          Dedicated artisans delivering personalized craftsmanship, precision ergonomics, and transformative care.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#D66A78] animate-spin" />
        </div>
      ) : staffList.length === 0 ? (
        <div className="p-16 text-center glass-card rounded-3xl border border-[#EAE5DF]">
          <p className="text-sm text-[#566176]">Our specialists catalog is currently being updated.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {staffList.map((member) => (
            <div
              key={member.id}
              className="glass-card rounded-3xl overflow-hidden border border-[#EAE5DF] flex flex-col justify-between hover-lift transition-all"
            >
              <div>
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={member.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-[#1E2433] shadow-xs">
                      {member.role_title}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-serif font-bold text-xl text-[#1E2433]">{member.name}</h3>
                  <p className="text-xs text-[#566176] leading-relaxed line-clamp-3">
                    {member.bio || 'Renowned practitioner with specialized precision techniques and international certifications.'}
                  </p>

                  {member.specialties && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {member.specialties.split(',').map((spec, i) => (
                        <span key={i} className="text-[10px] px-2.5 py-0.5 rounded-full bg-stone-100 text-[#566176] font-medium">
                          {spec.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between border-t border-[#EAE5DF] mt-4 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedStaff(member)}
                  className="text-xs font-semibold text-[#566176] hover:text-[#1E2433] underline"
                >
                  View Profile
                </button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigateToBooking()}
                  rightIcon={<Calendar className="w-3.5 h-3.5" />}
                >
                  Book Specialist
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staff Profile Modal (/team/[slug]) */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#EAE5DF] space-y-6 relative">
            <button
              type="button"
              onClick={() => setSelectedStaff(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-[#8491A5] hover:text-[#1E2433] hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <img
                src={selectedStaff.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={selectedStaff.name}
                className="w-20 h-20 rounded-2xl object-cover border border-[#EAE5DF] shadow-md"
              />
              <div>
                <Badge variant="accent" size="xs">{selectedStaff.role_title}</Badge>
                <h3 className="font-serif font-bold text-2xl text-[#1E2433] mt-1">{selectedStaff.name}</h3>
                <span className="text-xs text-[#8491A5]">Master Certified Specialist</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#1E2433]">Specialist Bio & Philosophy</h4>
              <p className="text-xs text-[#566176] leading-relaxed">
                {selectedStaff.bio || 'Master craftsman dedicated to individualized grooming, organic skin therapies, and tailored styling consultations.'}
              </p>
            </div>

            {selectedStaff.specialties && (
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#1E2433]">Core Proficiencies</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStaff.specialties.split(',').map((spec, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-xl bg-white border border-[#EAE5DF] text-[#1E2433] font-medium shadow-xs">
                      {spec.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#EAE5DF] flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setSelectedStaff(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedStaff(null);
                  onNavigateToBooking();
                }}
              >
                Reserve with {selectedStaff.name.split(' ')[0]}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
