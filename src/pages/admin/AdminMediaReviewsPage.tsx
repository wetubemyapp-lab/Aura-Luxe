import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { GalleryItem, VideoItem, ReviewItem } from '../../types/index.ts';
import { Image, Video, Star, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface AdminMediaReviewsPageProps {
  viewMode: 'gallery' | 'videos' | 'reviews';
}

export const AdminMediaReviewsPage: React.FC<AdminMediaReviewsPageProps> = ({ viewMode }) => {
  const { token } = useAuth();
  const { activeBusiness } = useBusiness();
  const { language, t } = useLanguage();

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [imgTitle, setImgTitle] = useState('');
  const [imgCategory, setImgCategory] = useState('Portfolio');
  const [imgUrl, setImgUrl] = useState('');

  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const bId = activeBusiness?.id || 1;
      const [galRes, vidRes, revRes] = await Promise.all([
        fetch(`/api/gallery?businessId=${bId}`),
        fetch(`/api/videos?businessId=${bId}`),
        fetch(`/api/reviews?businessId=${bId}`),
      ]);

      if (galRes.ok) setGallery((await galRes.json()).gallery || []);
      if (vidRes.ok) setVideos((await vidRes.json()).videos || []);
      if (revRes.ok) setReviews((await revRes.json()).reviews || []);
    } catch (err) {
      console.error('Failed to load media data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeBusiness]);

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgTitle || !imgUrl) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness?.id || 1,
          title: imgTitle,
          category: imgCategory,
          image_url: imgUrl,
        }),
      });

      if (res.ok) {
        setImgTitle('');
        setImgUrl('');
        setShowAddForm(false);
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to add gallery item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DBD0] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E6] text-[#E07A5F] text-xs font-bold uppercase tracking-wider mb-2">
            {viewMode === 'gallery' ? <Image className="w-3.5 h-3.5" /> : viewMode === 'videos' ? <Video className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
            <span>Media & Trust Proof</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A] capitalize">
            {viewMode === 'gallery'
              ? language === 'hi' ? 'विजुअल पोर्टफोलियो एवं लुकबुक' : 'Lookbook & Visual Gallery'
              : viewMode === 'videos'
              ? language === 'hi' ? 'वीडियो एवं रील्स प्रदर्शन' : 'Video Showcase & Walkthroughs'
              : language === 'hi' ? 'सत्यापित ग्राहक समीक्षाएं' : 'Client Testimonials & Reviews'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {language === 'hi'
              ? 'ग्राहक अनुभव को समृद्ध करने के लिए तस्वीरें, वीडियो और समीक्षाएं प्रबंधित करें'
              : 'Maintain visual proof, before/after transformations, and customer credibility.'}
          </p>
        </div>

        {viewMode === 'gallery' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-2.5 bg-[#E07A5F] hover:bg-[#D47055] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Close' : 'Add Photo'}</span>
          </button>
        )}
      </div>

      {showAddForm && viewMode === 'gallery' && (
        <form
          onSubmit={handleAddGalleryItem}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E07A5F]/40 shadow-lg space-y-4 animate-fade-in"
        >
          <h3 className="text-lg font-serif font-bold text-[#0F172A]">Add Photo to Portfolio Lookbook</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={imgTitle}
                onChange={(e) => setImgTitle(e.target.value)}
                placeholder="e.g. Scissor Fade or Balayage"
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={imgCategory}
                onChange={(e) => setImgCategory(e.target.value)}
                placeholder="e.g. Hair, Skin, Nails, Tattoo"
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E2DBD0] rounded-xl text-xs focus:ring-2 focus:ring-[#E07A5F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL</label>
              <input
                type="text"
                required
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
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
            {submitting ? 'Adding...' : 'Add to Lookbook'}
          </button>
        </form>
      )}

      {/* Grid rendering */}
      {viewMode === 'gallery' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#E2DBD0] shadow-xs group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-2 left-2 bg-[#0F172A]/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                  {item.category}
                </span>
              </div>
              <div className="p-3">
                <p className="text-xs font-serif font-bold text-[#0F172A] truncate">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'reviews' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl border border-[#E2DBD0] p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  {r.is_verified && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Client
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{r.comment}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">{r.user_name}</span>
                <span className="text-[10px] text-slate-400">Client Feedback</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'videos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-[#E2DBD0] p-6 shadow-xs text-center space-y-3">
            <Video className="w-10 h-10 text-[#E07A5F] mx-auto" />
            <h3 className="font-serif font-bold text-base text-[#0F172A]">Video Walkthroughs & Reels</h3>
            <p className="text-xs text-slate-500">
              Embed MP4 reels and transformation tutorials for {activeBusiness?.name}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
