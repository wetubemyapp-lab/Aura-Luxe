import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { GalleryItem, VideoItem, ReviewItem } from '../../types/index.ts';
import { Sparkles, Star, Image, Video, MessageSquare, CheckCircle, Loader2, Play } from 'lucide-react';
import { Button, Badge } from '../../components/ui/index.ts';

export interface MediaReviewsPageProps {
  initialTab?: 'gallery' | 'videos' | 'reviews';
  onNavigateToBooking: () => void;
}

export const MediaReviewsPage: React.FC<MediaReviewsPageProps> = ({
  initialTab = 'gallery',
  onNavigateToBooking,
}) => {
  const { activeBusiness } = useBusiness();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'gallery' | 'videos' | 'reviews'>(initialTab);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    async function loadMediaData() {
      if (!activeBusiness) return;
      setLoading(true);
      try {
        const bId = activeBusiness.id;
        const [galRes, vidRes, revRes] = await Promise.all([
          fetch(`/api/gallery?businessId=${bId}`),
          fetch(`/api/videos?businessId=${bId}`),
          fetch(`/api/reviews?businessId=${bId}`),
        ]);

        if (galRes.ok && galRes.headers.get('content-type')?.includes('application/json')) {
          const d = await galRes.json();
          setGallery(d.gallery || []);
        }
        if (vidRes.ok && vidRes.headers.get('content-type')?.includes('application/json')) {
          const d = await vidRes.json();
          setVideos(d.videos || []);
        }
        if (revRes.ok && revRes.headers.get('content-type')?.includes('application/json')) {
          const d = await revRes.json();
          setReviews(d.reviews || []);
        }
      } catch (err) {
        console.error('Failed to load gallery/videos/reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMediaData();
  }, [activeBusiness]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF4EB] text-[#C89B53] text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Atelier Showcase & Client Voices</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#1E2433] tracking-tight">
          Visual Gallery, Reels & Verified Reviews
        </h1>
        <p className="text-sm sm:text-base text-[#566176] font-light">
          Explore our signature portfolio, artisan transformations, and authenticated guest feedback.
        </p>
      </div>

      {/* Nav Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 glass-card rounded-2xl border border-[#EAE5DF]">
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'gallery'
                ? 'bg-[#1E2433] text-white shadow-sm'
                : 'text-[#566176] hover:text-[#1E2433]'
            }`}
          >
            <Image className="w-4 h-4" />
            Photo Gallery ({gallery.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'videos'
                ? 'bg-[#1E2433] text-white shadow-sm'
                : 'text-[#566176] hover:text-[#1E2433]'
            }`}
          >
            <Video className="w-4 h-4" />
            Transformation Videos ({videos.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'bg-[#1E2433] text-white shadow-sm'
                : 'text-[#566176] hover:text-[#1E2433]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Guest Reviews ({reviews.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#D66A78] animate-spin" />
        </div>
      ) : (
        <>
          {/* TAB 1: Gallery */}
          {activeTab === 'gallery' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="glass-card rounded-3xl overflow-hidden border border-[#EAE5DF] group hover-lift transition-all"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 text-white">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#C89B53]">
                          {item.category}
                        </span>
                        <h4 className="font-serif font-bold text-sm">{item.title}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Videos */}
          {activeTab === 'videos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  className="glass-card rounded-3xl overflow-hidden border border-[#EAE5DF] group hover-lift transition-all"
                >
                  <div className="relative aspect-[16/9] bg-stone-900 overflow-hidden flex items-center justify-center">
                    <img
                      src={vid.thumbnail_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'}
                      alt={vid.title}
                      className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute w-12 h-12 rounded-full bg-white/90 text-[#1E2433] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-serif font-bold text-sm text-[#1E2433]">{vid.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="glass-card rounded-3xl p-6 border border-[#EAE5DF] space-y-4 hover-lift transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                        {rev.is_verified && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified Visit
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#566176] leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#EAE5DF]">
                      <h4 className="font-bold text-xs text-[#1E2433]">{rev.user_name}</h4>
                      <span className="text-[10px] text-[#8491A5]">Authenticated Atelier Guest</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
