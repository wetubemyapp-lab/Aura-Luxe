import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { GalleryItem, VideoItem, ReviewItem } from '../../types/index.ts';
import { 
  Sparkles, Star, Image, Video, MessageSquare, CheckCircle, 
  Loader2, Play, AlertCircle, Plus, Send, X, Flag, EyeOff, MessageCircle
} from 'lucide-react';
import { Button, Input, Textarea, Select } from '../../components/ui/index.ts';

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
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState<'gallery' | 'videos' | 'reviews'>(initialTab);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Video showcase state
  const [activePlayingVideo, setActivePlayingVideo] = useState<VideoItem | null>(null);

  // Review submission state
  const [showAddReview, setShowAddReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [userName, setUserName] = useState(user?.name || '');
  const [reviewTitle, setReviewTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Dropdown list states for review submission
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [userBookings, setUserBookings] = useState<any[]>([]);

  // Reporting state
  const [reportingReview, setReportingReview] = useState<ReviewItem | null>(null);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Load primary media & reviews
  const loadMediaData = async () => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const bId = activeBusiness.id;
      const [galRes, vidRes, revRes] = await Promise.all([
        fetch(`/api/gallery?businessId=${bId}`),
        fetch(`/api/videos?businessId=${bId}`),
        fetch(`/api/reviews?businessId=${bId}`),
      ]);

      if (galRes.ok) {
        const d = await galRes.json();
        setGallery(d.gallery || []);
      }
      if (vidRes.ok) {
        const d = await vidRes.json();
        setVideos(d.videos || []);
      }
      if (revRes.ok) {
        const d = await revRes.json();
        setReviews(d.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load gallery/videos/reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMediaData();
  }, [activeBusiness]);

  // Fetch helper lists (services, staff, bookings) when opening the Add Review modal
  useEffect(() => {
    async function fetchReviewHelpers() {
      if (!activeBusiness || !showAddReview) return;
      try {
        const bId = activeBusiness.id;
        
        // Fetch Services
        const sRes = await fetch(`/api/services?businessId=${bId}`);
        if (sRes.ok) {
          const sData = await sRes.json();
          setServices(sData.services || []);
        }

        // Fetch Staff
        const stRes = await fetch(`/api/staff?businessId=${bId}`);
        if (stRes.ok) {
          const stData = await stRes.json();
          setStaff(stData.staff || []);
        }

        // If user logged in, fetch their completed bookings to suggest
        if (user && token) {
          const bkRes = await fetch(`/api/bookings/my-bookings`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (bkRes.ok) {
            const bkData = await bkRes.json();
            // Filter completed or checked-in bookings for the active business
            const completed = (bkData.bookings || []).filter((b: any) => 
              b.business_id === bId && 
              ['COMPLETED', 'completed', 'CHECKED_IN', 'in_service'].includes(b.status)
            );
            setUserBookings(completed);
          }
        }
      } catch (err) {
        console.error('Failed to load review helpers:', err);
      }
    }
    fetchReviewHelpers();
  }, [showAddReview, activeBusiness, user, token]);

  // Sync user name from profile if user logged in
  useEffect(() => {
    if (user?.name) {
      setUserName(user.name);
    }
  }, [user]);

  // Parse Video URLs for Showcase
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      // YouTube Embed
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else {
          videoId = url.split('v=')[1]?.split('&')[0];
        }
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      // Vimeo Embed
      if (url.includes('vimeo.com')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
      }
    } catch (e) {
      console.error('Failed to parse video url:', url);
    }
    return '';
  };

  const isEmbeddable = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  // Submit Review Handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!userName.trim()) {
      setFormError('Please enter your name.');
      return;
    }
    if (!comment.trim()) {
      setFormError('Please write some comments.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        business_id: activeBusiness?.id || 1,
        user_name: userName,
        rating,
        title: reviewTitle,
        comment,
        images,
        service_id: selectedServiceId ? parseInt(selectedServiceId) : null,
        staff_id: selectedStaffId ? parseInt(selectedStaffId) : null,
        booking_id: bookingId ? parseInt(bookingId) : null,
      };

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setFormSuccess(data.message || 'Review submitted successfully!');
      // Reset state
      setRating(5);
      setReviewTitle('');
      setComment('');
      setImages('');
      setSelectedServiceId('');
      setSelectedStaffId('');
      setBookingId('');
      
      // Reload reviews
      loadMediaData();
      
      // Close modal after delay
      setTimeout(() => {
        setShowAddReview(false);
        setFormSuccess('');
      }, 1500);

    } catch (err: any) {
      setFormError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Report Handler
  const handleReportReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingReview || !reportReason.trim()) return;

    try {
      const res = await fetch(`/api/reviews/${reportingReview.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason }),
      });

      if (res.ok) {
        alert('Review reported successfully. The administration team will review this post.');
        setReportingReview(null);
        setReportReason('');
        loadMediaData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to report review');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Prepopulate rating based on booking selection
  const handleBookingChange = (bId: string) => {
    setBookingId(bId);
    if (bId) {
      const bk = userBookings.find(b => b.id === parseInt(bId));
      if (bk) {
        if (bk.service_id) setSelectedServiceId(bk.service_id.toString());
        if (bk.staff_id) setSelectedStaffId(bk.staff_id.toString());
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF4EB] text-[#C89B53] text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-[#C89B53]" />
          <span>Salon Work & Customer Reviews</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#1E2433] tracking-tight">
          Photos, Videos & Checked Reviews
        </h1>
        <p className="text-sm sm:text-base text-[#566176] font-light">
          Explore our photos, transformation videos, and real feedback from salon guests.
        </p>
      </div>

      {/* Nav Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 bg-white shadow-sm rounded-2xl border border-[#EAE5DF]">
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
          <Loader2 className="w-8 h-8 text-[#C89B53] animate-spin" />
        </div>
      ) : (
        <>
          {/* TAB 1: Gallery */}
          {activeTab === 'gallery' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
              {gallery.length === 0 ? (
                <div className="col-span-full text-center py-12 text-[#566176] font-light">
                  No showcase gallery items found.
                </div>
              ) : (
                gallery.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl overflow-hidden border border-[#EAE5DF] group hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5 text-white">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#C89B53]">
                            {item.category || 'Portfolio'}
                          </span>
                          <h4 className="font-serif font-bold text-sm mt-0.5">{item.title}</h4>
                          {item.description && (
                            <p className="text-xs text-[#EAE5DF] font-light mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Videos (Showcase with Play functionality to avoid autoplaying) */}
          {activeTab === 'videos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
              {videos.length === 0 ? (
                <div className="col-span-full text-center py-12 text-[#566176] font-light">
                  No transformation videos available right now.
                </div>
              ) : (
                videos.map((vid) => (
                  <div
                    key={vid.id}
                    className="bg-white rounded-3xl overflow-hidden border border-[#EAE5DF] group hover:shadow-md transition-all flex flex-col"
                  >
                    {/* Quiet preview thumbnail; clicking opens clean dialog player */}
                    <div 
                      onClick={() => setActivePlayingVideo(vid)}
                      className="relative aspect-[16/9] bg-stone-900 overflow-hidden flex items-center justify-center cursor-pointer"
                    >
                      <img
                        src={vid.thumbnail_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'}
                        alt={vid.title}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute w-12 h-12 rounded-full bg-white text-[#1E2433] flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                        <Play className="w-5 h-5 ml-0.5 text-[#1E2433] fill-current" />
                      </div>
                      {vid.is_featured && (
                        <span className="absolute top-3 left-3 bg-[#1E2433] text-[#C89B53] text-[9px] uppercase font-bold px-2 py-1 rounded-md tracking-wider">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#1E2433]">{vid.title}</h4>
                        {vid.description && (
                          <p className="text-xs text-[#566176] font-light mt-1.5 leading-relaxed">
                            {vid.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setActivePlayingVideo(vid)}
                      >
                        Watch Video
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FAF4EB] p-6 rounded-3xl border border-[#EAE5DF]">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1E2433]">Have you visited us recently?</h3>
                  <p className="text-xs text-[#566176] font-light">Share your honest experience and help others find their perfect look.</p>
                </div>
                <Button 
                  onClick={() => setShowAddReview(true)}
                  className="bg-[#1E2433] hover:bg-stone-800 text-white flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Write a Review
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-[#566176] font-light">
                    No verified reviews yet. Be the first to leave one!
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white rounded-3xl p-6 border border-[#EAE5DF] space-y-4 hover:shadow-sm transition-all flex flex-col justify-between relative"
                    >
                      {/* Rating and Verified Badge */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'
                                }`}
                              />
                            ))}
                          </div>
                          {rev.is_verified && (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-150 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Verified Visit
                            </span>
                          )}
                        </div>

                        {/* Title & Comment */}
                        <div>
                          {rev.title && (
                            <h5 className="font-bold text-sm text-[#1E2433] mb-1">
                              {rev.title}
                            </h5>
                          )}
                          <p className="text-xs text-[#566176] leading-relaxed font-light">
                            "{rev.comment}"
                          </p>
                        </div>

                        {/* Uploaded image */}
                        {rev.images && (
                          <div className="flex gap-2 flex-wrap">
                            {rev.images.split(',').map((imgUrl, idx) => (
                              <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border border-stone-200">
                                <img src={imgUrl.trim()} alt="User upload" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Service / Staff metadata */}
                        {(rev.service_title || rev.staff_name) && (
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#8491A5] font-medium pt-1">
                            {rev.service_title && (
                              <span>Service: <strong className="text-[#1E2433] font-semibold">{rev.service_title}</strong></span>
                            )}
                            {rev.service_title && rev.staff_name && <span className="text-stone-300">|</span>}
                            {rev.staff_name && (
                              <span>Expert: <strong className="text-[#1E2433] font-semibold">{rev.staff_name}</strong></span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Owner Reply */}
                      {rev.owner_reply && (
                        <div className="bg-[#FAF4EB] p-3.5 rounded-2xl border border-[#FAF4EB] space-y-1 mt-3">
                          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-[#C89B53]">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Owner Response</span>
                          </div>
                          <p className="text-xs text-[#566176] font-light italic">
                            "{rev.owner_reply}"
                          </p>
                        </div>
                      )}

                      {/* Bottom Footer & Action bar */}
                      <div className="pt-4 border-t border-[#EAE5DF] flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-[#1E2433]">{rev.user_name}</h4>
                          <span className="text-[9px] text-[#8491A5]">
                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Real Guest'}
                          </span>
                        </div>
                        
                        {/* Report review */}
                        <button
                          onClick={() => setReportingReview(rev)}
                          className="text-[#8491A5] hover:text-[#D66A78] transition-colors p-1"
                          title="Report Review"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL 1: Watch Video Showcase Player (Not autoplaying by default, fully embed compliant) */}
      {activePlayingVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E2433] text-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
            <button
              onClick={() => setActivePlayingVideo(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 space-y-4">
              <h3 className="font-serif font-bold text-lg text-white pr-10">{activePlayingVideo.title}</h3>
              
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-stone-950">
                {isEmbeddable(activePlayingVideo.video_url) ? (
                  <iframe
                    src={getEmbedUrl(activePlayingVideo.video_url)}
                    title={activePlayingVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={activePlayingVideo.video_url}
                    poster={activePlayingVideo.thumbnail_url}
                    controls
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              {activePlayingVideo.description && (
                <p className="text-xs text-stone-300 font-light leading-relaxed">
                  {activePlayingVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Report Review */}
      {reportingReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white text-stone-900 w-full max-w-md rounded-3xl p-6 shadow-xl border border-[#EAE5DF] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#EAE5DF]">
              <h3 className="font-serif font-bold text-lg text-[#1E2433]">Report Review</h3>
              <button onClick={() => setReportingReview(null)} className="text-[#566176] hover:text-[#1E2433]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReportReview} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Reason for Reporting</label>
                <Textarea
                  placeholder="Tell us why this review violates platform policy (e.g., spam, offensive content, fake account)..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="text-xs min-h-[100px]"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setReportingReview(null)}>
                  Cancel
                </Button>
                <Button size="sm" className="bg-[#D66A78] hover:bg-red-700 text-white" type="submit">
                  Submit Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Review Dialog */}
      {showAddReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white text-stone-900 w-full max-w-lg rounded-3xl p-6 shadow-xl border border-[#EAE5DF] space-y-4 my-8">
            <div className="flex justify-between items-center pb-2 border-b border-[#EAE5DF]">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#1E2433]">Write a Review</h3>
                <p className="text-[11px] text-[#566176] font-light">Your review helps us build a better experience.</p>
              </div>
              <button onClick={() => setShowAddReview(false)} className="text-[#566176] hover:text-[#1E2433]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Select */}
              <div className="space-y-1.5 text-center">
                <label className="text-xs font-bold text-stone-700 block">Your Overall Rating</label>
                <div className="flex justify-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setRating(starValue)}
                      className="transition-transform active:scale-95 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          starValue <= rating 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-stone-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Your Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Priyan Singh"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              {/* Verified Booking link */}
              {user && userBookings.length > 0 ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Link to a Checked Booking (Optional)</label>
                  <Select
                    value={bookingId}
                    onChange={(e) => handleBookingChange(e.target.value)}
                    className="text-xs"
                  >
                    <option value="">-- No booking reference --</option>
                    {userBookings.map((bk) => (
                      <option key={bk.id} value={bk.id.toString()}>
                        Booking #{bk.id} on {new Date(bk.booking_date).toLocaleDateString()} - {bk.service_title || 'Service'}
                      </option>
                    ))}
                  </Select>
                  <p className="text-[10px] text-emerald-600 font-medium">
                    Selecting your completed booking will automatically verify this review.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Verify with Booking Reference ID (Optional)</label>
                  <Input
                    type="number"
                    placeholder="Enter completed Booking ID (e.g. 101)"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    className="text-xs"
                  />
                  <p className="text-[10px] text-[#8491A5]">
                    Enter a valid completed Booking ID reference to obtain a verified visit badge.
                  </p>
                </div>
              )}

              {/* Dropdowns for service and staff if not bound by booking */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Service</label>
                  <Select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="text-xs"
                  >
                    <option value="">-- Select Service --</option>
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.id.toString()}>{srv.title}</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Staff Expert</label>
                  <Select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="text-xs"
                  >
                    <option value="">-- Select Expert --</option>
                    {staff.map((st) => (
                      <option key={st.id} value={st.id.toString()}>{st.name}</option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Review Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Review Title (Optional)</label>
                <Input
                  type="text"
                  placeholder="Summarize your experience (e.g. Excellent service!)"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="text-xs"
                />
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Your Feedback</label>
                <Textarea
                  placeholder="Describe your overall service experience, quality of work, cleanliness, and consultation..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="text-xs min-h-[80px]"
                  required
                />
              </div>

              {/* Image upload link */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Image URLs (Optional, comma-separated)</label>
                <Input
                  type="text"
                  placeholder="https://example.com/salon-review-photo.jpg"
                  value={images}
                  onChange={(e) => setImages(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#EAE5DF]">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowAddReview(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  disabled={submitting}
                  className="bg-[#1E2433] hover:bg-stone-800 text-white flex items-center gap-1.5"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
