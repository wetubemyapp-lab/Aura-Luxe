import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { GalleryItem, VideoItem, ReviewItem } from '../../types/index.ts';
import { 
  Image as ImageIcon, Video as VideoIcon, Star, Plus, Trash2, 
  CheckCircle2, Loader2, Edit, MessageSquare, EyeOff, Eye, AlertTriangle, 
  CornerDownRight, RefreshCw, X, ShieldAlert, Check, Settings
} from 'lucide-react';
import { Button, Input, Textarea, Select } from '../../components/ui/index.ts';

interface AdminMediaReviewsPageProps {
  viewMode: 'gallery' | 'videos' | 'reviews';
}

export const AdminMediaReviewsPage: React.FC<AdminMediaReviewsPageProps> = ({ viewMode }) => {
  const { token, user } = useAuth();
  const { activeBusiness } = useBusiness();
  const { language } = useLanguage();

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & UI states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [replyingReview, setReplyingReview] = useState<ReviewItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [removingReview, setRemovingReview] = useState<ReviewItem | null>(null);
  const [removalReason, setRemovalReason] = useState('');

  // Form states - Gallery
  const [imgTitle, setImgTitle] = useState('');
  const [imgDescription, setImgDescription] = useState('');
  const [imgCategory, setImgCategory] = useState('Portfolio');
  const [imgUrl, setImgUrl] = useState('');
  const [imgService, setImgService] = useState('');
  const [imgSortOrder, setImgSortOrder] = useState('0');
  const [imgIsFeatured, setImgIsFeatured] = useState(false);

  // Form states - Videos
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState('');
  const [videoSortOrder, setVideoSortOrder] = useState('0');
  const [videoIsFeatured, setVideoIsFeatured] = useState(false);
  const [videoIsActive, setVideoIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const bId = activeBusiness?.id || 1;
      
      // Fetch Gallery
      const galRes = await fetch(`/api/gallery?businessId=${bId}&archived=true`);
      if (galRes.ok) {
        const d = await galRes.json();
        setGallery(d.gallery || []);
      }

      // Fetch Videos
      const vidRes = await fetch(`/api/videos?businessId=${bId}&archived=true`);
      if (vidRes.ok) {
        const d = await vidRes.json();
        setVideos(d.videos || []);
      }

      // Fetch All Admin Reviews (including hidden, reported, removed for complete history & moderation)
      const revRes = await fetch(`/api/reviews/admin?businessId=${bId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (revRes.ok) {
        const d = await revRes.json();
        setReviews(d.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load admin media data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeBusiness, viewMode]);

  // Handle Add Gallery Item
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
          description: imgDescription,
          category: imgCategory,
          image_url: imgUrl,
          service: imgService || null,
          sort_order: parseInt(imgSortOrder) || 0,
          is_featured: imgIsFeatured,
          is_active: true,
        }),
      });

      if (res.ok) {
        setImgTitle('');
        setImgDescription('');
        setImgUrl('');
        setImgService('');
        setImgSortOrder('0');
        setImgIsFeatured(false);
        setShowAddForm(false);
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to add gallery item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Video Item
  const handleAddVideoItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle || !videoUrl) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness?.id || 1,
          title: videoTitle,
          description: videoDescription,
          video_url: videoUrl,
          thumbnail_url: videoThumbnailUrl,
          sort_order: parseInt(videoSortOrder) || 0,
          is_featured: videoIsFeatured,
          is_active: videoIsActive,
        }),
      });

      if (res.ok) {
        setVideoTitle('');
        setVideoDescription('');
        setVideoUrl('');
        setVideoThumbnailUrl('');
        setVideoSortOrder('0');
        setVideoIsFeatured(false);
        setVideoIsActive(true);
        setShowAddForm(false);
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to add video showcase:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit/Update Video Item
  const handleUpdateVideoItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/videos/${editingVideo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingVideo),
      });

      if (res.ok) {
        setEditingVideo(null);
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to update video:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Video Active Status
  const toggleVideoActive = async (vid: VideoItem) => {
    try {
      const updatedActive = !vid.is_active;
      const res = await fetch(`/api/videos/${vid.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: updatedActive }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Video Featured Status
  const toggleVideoFeatured = async (vid: VideoItem) => {
    try {
      const updatedFeatured = !vid.is_featured;
      const res = await fetch(`/api/videos/${vid.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_featured: updatedFeatured }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Archive / Delete Video Showcase
  const handleArchiveVideo = async (id: number) => {
    if (!confirm('Are you sure you want to archive this video showcase?')) return;
    try {
      const res = await fetch(`/api/videos/${id}/archive`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Restore Video Showcase
  const handleRestoreVideo = async (id: number) => {
    try {
      const res = await fetch(`/api/videos/${id}/restore`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // REVIEWS ENGINE OWNER ACTION: Save Reply
  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview) return;

    try {
      const res = await fetch(`/api/reviews/${replyingReview.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyText })
      });

      if (res.ok) {
        setReplyingReview(null);
        setReplyText('');
        await fetchData();
      } else {
        alert('Failed to post reply.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // REVIEWS ENGINE OWNER ACTION: Hide Review
  const handleHideReview = async (id: number) => {
    try {
      const res = await fetch(`/api/reviews/${id}/hide`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // REVIEWS ENGINE PLATFORM MODERATION: Restore Review
  const handleRestoreReview = async (id: number) => {
    try {
      const res = await fetch(`/api/reviews/${id}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // REVIEWS ENGINE PLATFORM MODERATION: Policy-Based Remove Review
  const handleRemoveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!removingReview || !removalReason) return;

    try {
      const res = await fetch(`/api/reviews/${removingReview.id}/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: removalReason })
      });

      if (res.ok) {
        setRemovingReview(null);
        setRemovalReason('');
        await fetchData();
      } else {
        alert('Failed to remove review.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DBD0] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4EB] text-[#C89B53] text-xs font-bold uppercase tracking-wider mb-2">
            {viewMode === 'gallery' ? (
              <ImageIcon className="w-3.5 h-3.5 text-[#C89B53]" />
            ) : viewMode === 'videos' ? (
              <VideoIcon className="w-3.5 h-3.5 text-[#C89B53]" />
            ) : (
              <Star className="w-3.5 h-3.5 text-[#C89B53]" />
            )}
            <span>Platform Salon Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E2433] capitalize">
            {viewMode === 'gallery' && 'Lookbook & Showcase Portfolio'}
            {viewMode === 'videos' && 'Video Showcase & Walkthroughs'}
            {viewMode === 'reviews' && 'Reviews Moderation & History Engine'}
          </h1>
          <p className="text-[#566176] text-xs sm:text-sm mt-1 font-light">
            Manage your salon visual brand identity, video highlights, and guest credibility trails.
          </p>
        </div>

        {/* Add Actions */}
        {viewMode !== 'reviews' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-2.5 bg-[#1E2433] hover:bg-stone-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Close Pane' : `Add ${viewMode === 'gallery' ? 'Photo' : 'Video'}`}</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#C89B53] animate-spin" />
        </div>
      ) : (
        <>
          {/* Form: Add Gallery Item */}
          {showAddForm && viewMode === 'gallery' && (
            <form
              onSubmit={handleAddGalleryItem}
              className="bg-white p-6 rounded-3xl border border-[#EAE5DF] shadow-sm space-y-4 animate-fade-in max-w-3xl"
            >
              <h3 className="text-base font-serif font-bold text-[#1E2433]">Add Photo item to Lookbook</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Photo Title</label>
                  <Input
                    type="text"
                    required
                    value={imgTitle}
                    onChange={(e) => setImgTitle(e.target.value)}
                    placeholder="e.g. Balayage Gold Sparkle"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Category Tag</label>
                  <Input
                    type="text"
                    required
                    value={imgCategory}
                    onChange={(e) => setImgCategory(e.target.value)}
                    placeholder="e.g. Hair, Nails, Makeup"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-700">Image URL</label>
                  <Input
                    type="text"
                    required
                    value={imgUrl}
                    onChange={(e) => setImgUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-700">Description (Optional)</label>
                  <Textarea
                    value={imgDescription}
                    onChange={(e) => setImgDescription(e.target.value)}
                    placeholder="Describe the artisan work, product used, or specialized styling..."
                    className="text-xs min-h-[60px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Sort Order</label>
                  <Input
                    type="number"
                    value={imgSortOrder}
                    onChange={(e) => setImgSortOrder(e.target.value)}
                    placeholder="0"
                    className="text-xs"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="imgFeatured"
                    checked={imgIsFeatured}
                    onChange={(e) => setImgIsFeatured(e.target.checked)}
                    className="rounded border-[#EAE5DF]"
                  />
                  <label htmlFor="imgFeatured" className="text-xs font-semibold text-stone-700 cursor-pointer">
                    Highlight in Featured Showcase
                  </label>
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="bg-[#1E2433] text-white text-xs">
                {submitting ? 'Saving...' : 'Add to Lookbook'}
              </Button>
            </form>
          )}

          {/* Form: Add Video Showcase Item */}
          {showAddForm && viewMode === 'videos' && (
            <form
              onSubmit={handleAddVideoItem}
              className="bg-white p-6 rounded-3xl border border-[#EAE5DF] shadow-sm space-y-4 animate-fade-in max-w-3xl"
            >
              <h3 className="text-base font-serif font-bold text-[#1E2433]">Add Video to Showcase</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Video Title</label>
                  <Input
                    type="text"
                    required
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g. HydraFacial Deep Cleanse Walkthrough"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Video Link (YouTube, Vimeo, MP4 file)</label>
                  <Input
                    type="text"
                    required
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-700">Thumbnail Image URL</label>
                  <Input
                    type="text"
                    value={videoThumbnailUrl}
                    onChange={(e) => setVideoThumbnailUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-700">Description</label>
                  <Textarea
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    placeholder="Highlight step-by-step styling, transformational changes..."
                    className="text-xs min-h-[60px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Sort Order</label>
                  <Input
                    type="number"
                    value={videoSortOrder}
                    onChange={(e) => setVideoSortOrder(e.target.value)}
                    placeholder="0"
                    className="text-xs"
                  />
                </div>
                <div className="flex gap-6 pt-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="vidFeatured"
                      checked={videoIsFeatured}
                      onChange={(e) => setVideoIsFeatured(e.target.checked)}
                      className="rounded border-[#EAE5DF]"
                    />
                    <label htmlFor="vidFeatured" className="text-xs font-semibold text-stone-700 cursor-pointer">
                      Featured Video
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="vidActive"
                      checked={videoIsActive}
                      onChange={(e) => setVideoIsActive(e.target.checked)}
                      className="rounded border-[#EAE5DF]"
                    />
                    <label htmlFor="vidActive" className="text-xs font-semibold text-stone-700 cursor-pointer">
                      Mark Active Immediately
                    </label>
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="bg-[#1E2433] text-white text-xs">
                {submitting ? 'Saving...' : 'Add Video Showcase'}
              </Button>
            </form>
          )}

          {/* EDIT Video Showcase Modal */}
          {editingVideo && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <form
                onSubmit={handleUpdateVideoItem}
                className="bg-white text-stone-900 w-full max-w-lg rounded-3xl p-6 shadow-xl border border-[#EAE5DF] space-y-4"
              >
                <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                  <h3 className="font-serif font-bold text-lg text-[#1E2433]">Edit Video Showcase</h3>
                  <button type="button" onClick={() => setEditingVideo(null)} className="text-[#566176] hover:text-black">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Video Title</label>
                    <Input
                      type="text"
                      required
                      value={editingVideo.title}
                      onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Video URL</label>
                    <Input
                      type="text"
                      required
                      value={editingVideo.video_url}
                      onChange={(e) => setEditingVideo({ ...editingVideo, video_url: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Thumbnail Image URL</label>
                    <Input
                      type="text"
                      value={editingVideo.thumbnail_url || ''}
                      onChange={(e) => setEditingVideo({ ...editingVideo, thumbnail_url: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Description</label>
                    <Textarea
                      value={editingVideo.description || ''}
                      onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                      className="text-xs min-h-[60px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700">Sort Order</label>
                      <Input
                        type="number"
                        value={editingVideo.sort_order || 0}
                        onChange={(e) => setEditingVideo({ ...editingVideo, sort_order: parseInt(e.target.value) || 0 })}
                        className="text-xs"
                      />
                    </div>
                    <div className="flex flex-col justify-end pb-2 gap-2">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="editFeatured"
                          checked={editingVideo.is_featured || false}
                          onChange={(e) => setEditingVideo({ ...editingVideo, is_featured: e.target.checked })}
                          className="rounded border-[#EAE5DF]"
                        />
                        <label htmlFor="editFeatured" className="text-xs font-semibold text-stone-700 cursor-pointer">
                          Featured
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setEditingVideo(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="bg-[#1E2433] text-white">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW: Gallery Lookbook items */}
          {viewMode === 'gallery' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {gallery.length === 0 ? (
                <div className="col-span-full text-center py-12 text-[#566176] font-light">
                  No lookbook gallery photos found. Click 'Add Photo' to create one.
                </div>
              ) : (
                gallery.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl overflow-hidden border border-[#E2DBD0] shadow-xs group relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 overflow-hidden bg-stone-100">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute bottom-2 left-2 bg-[#1E2433]/85 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          {item.category}
                        </span>
                        {item.is_featured && (
                          <span className="absolute top-2 right-2 bg-[#C89B53] text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="p-4 space-y-1">
                        <p className="text-sm font-serif font-bold text-[#1E2433] truncate">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-[#566176] font-light line-clamp-2">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* VIEW: Video Showcase management with explicit controls */}
          {viewMode === 'videos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.length === 0 ? (
                <div className="col-span-full text-center py-12 text-[#566176] font-light">
                  No video showcase files uploaded yet. Click 'Add Video' to start.
                </div>
              ) : (
                videos.map((vid) => (
                  <div
                    key={vid.id}
                    className="bg-white rounded-3xl overflow-hidden border border-[#EAE5DF] shadow-xs flex flex-col"
                  >
                    <div className="relative aspect-video bg-stone-900 overflow-hidden flex items-center justify-center">
                      <img
                        src={vid.thumbnail_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'}
                        alt={vid.title}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wider ${
                          vid.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {vid.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {vid.is_featured && (
                          <span className="bg-[#FAF4EB] text-[#C89B53] text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wider">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-serif font-bold text-base text-[#1E2433]">{vid.title}</h4>
                        <p className="text-[11px] text-[#8491A5] break-all font-mono">{vid.video_url}</p>
                        {vid.description && (
                          <p className="text-xs text-[#566176] font-light leading-relaxed mt-1">{vid.description}</p>
                        )}
                      </div>

                      {/* Video actions */}
                      <div className="pt-3 border-t border-[#EAE5DF] flex items-center justify-between gap-2">
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleVideoActive(vid)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-[#1E2433]"
                            title={vid.is_active ? 'Mark Inactive' : 'Mark Active'}
                          >
                            {vid.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleVideoFeatured(vid)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-[#C89B53]"
                            title="Toggle Featured"
                          >
                            <Star className={`w-3.5 h-3.5 ${vid.is_featured ? 'fill-[#C89B53]' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingVideo(vid)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-[#1E2433]"
                            title="Edit Video"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleArchiveVideo(vid.id)}
                          className="p-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-[#D66A78]"
                          title="Archive Showcase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* VIEW: Advanced Reviews Moderation Engine */}
          {viewMode === 'reviews' && (
            <div className="space-y-6">
              {/* Reviews Summary KPI Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-[#FAF4EB] p-5 rounded-3xl border border-[#EAE5DF]">
                <div className="p-2 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#8491A5]">Total Reviews</span>
                  <p className="text-2xl font-bold font-serif text-[#1E2433]">{reviews.length}</p>
                </div>
                <div className="p-2 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">Verified Reviews</span>
                  <p className="text-2xl font-bold font-serif text-[#1E2433]">
                    {reviews.filter(r => r.is_verified).length}
                  </p>
                </div>
                <div className="p-2 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500">Reported Flags</span>
                  <p className="text-2xl font-bold font-serif text-[#1E2433]">
                    {reviews.filter(r => r.is_reported).length}
                  </p>
                </div>
                <div className="p-2 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500">Hidden / Policy Removed</span>
                  <p className="text-2xl font-bold font-serif text-[#1E2433]">
                    {reviews.filter(r => r.is_hidden || r.is_removed).length}
                  </p>
                </div>
              </div>

              {/* Reviews Moderation List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-[#566176] font-light bg-white border border-[#EAE5DF] rounded-3xl">
                    No client reviews have been recorded in the platform database yet.
                  </div>
                ) : (
                  reviews.map((r) => {
                    const statusClass = r.is_removed 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : r.is_hidden 
                      ? 'bg-stone-100 text-stone-700 border-stone-200'
                      : r.is_reported 
                      ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                    const statusLabel = r.is_removed
                      ? 'Policy Removed'
                      : r.is_hidden
                      ? 'Hidden'
                      : r.is_reported
                      ? 'Flagged / Reported'
                      : 'Active & Verified';

                    return (
                      <div
                        key={r.id}
                        className="bg-white rounded-3xl p-6 border border-[#EAE5DF] shadow-xs space-y-4 transition-all hover:shadow-sm"
                      >
                        {/* Rating, verified state, status badges */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                                  }`}
                                />
                              ))}
                            </div>
                            {r.is_verified && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Verified Visit
                              </span>
                            )}
                          </div>

                          {/* Action state indicator */}
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </div>

                        {/* Review Content */}
                        <div className="space-y-1">
                          {r.title && <h5 className="font-bold text-sm text-[#1E2433]">{r.title}</h5>}
                          <p className="text-xs text-stone-800 leading-relaxed font-light italic">
                            "{r.comment}"
                          </p>

                          {/* Image Attachments */}
                          {r.images && (
                            <div className="flex gap-2 pt-2">
                              {r.images.split(',').map((imgUrl, idx) => (
                                <div key={idx} className="w-14 h-14 rounded-lg overflow-hidden border border-stone-200">
                                  <img src={imgUrl.trim()} alt="Attach" className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Service & Staff Context */}
                          {(r.service_title || r.staff_name || r.booking_id) && (
                            <div className="flex flex-wrap items-center gap-2 pt-2 text-[10px] font-medium text-[#8491A5]">
                              {r.booking_id && <span>Booking: <strong>#{r.booking_id}</strong></span>}
                              {r.booking_id && r.service_title && <span className="text-stone-300">·</span>}
                              {r.service_title && <span>Service: <strong>{r.service_title}</strong></span>}
                              {r.service_title && r.staff_name && <span className="text-stone-300">·</span>}
                              {r.staff_name && <span>Stylist: <strong>{r.staff_name}</strong></span>}
                            </div>
                          )}
                        </div>

                        {/* Audit Details (Report / Removal Reasons for complete trail history) */}
                        {(r.is_reported && r.report_reason) && (
                          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-xs text-amber-800 flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                            <div>
                              <strong className="font-semibold block">Report Claim Filed:</strong>
                              <span className="font-light">"{r.report_reason}"</span>
                            </div>
                          </div>
                        )}

                        {r.is_removed && r.removal_reason && (
                          <div className="p-3 bg-red-50 rounded-2xl border border-red-100 text-xs text-red-850 flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                            <div>
                              <strong className="font-semibold block">Removed according to platform policies:</strong>
                              <span className="font-light">"{r.removal_reason}"</span>
                            </div>
                          </div>
                        )}

                        {/* Existing Owner Reply */}
                        {r.owner_reply && (
                          <div className="flex items-start gap-2 pl-4 border-l-2 border-[#C89B53] py-1 bg-stone-50/50 rounded-r-xl">
                            <CornerDownRight className="w-4 h-4 text-[#C89B53] shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#C89B53]">Salon Response:</span>
                              <p className="text-xs text-[#566176] font-light">"{r.owner_reply}"</p>
                            </div>
                          </div>
                        )}

                        {/* Interactive moderation controls (Owner replying, Hide, Report, Restore, Remove) */}
                        <div className="pt-4 border-t border-[#EAE5DF] flex flex-wrap items-center justify-between gap-4">
                          <div className="text-xs text-[#8491A5]">
                            Submitted by <strong className="text-[#1E2433] font-semibold">{r.user_name}</strong>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Reply Action */}
                            {!r.is_removed && (
                              <button
                                onClick={() => {
                                  setReplyingReview(r);
                                  setReplyText(r.owner_reply || '');
                                }}
                                className="px-3 py-1.5 rounded-lg border border-[#EAE5DF] hover:bg-stone-50 text-xs font-semibold text-[#1E2433] flex items-center gap-1"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{r.owner_reply ? 'Edit Reply' : 'Reply'}</span>
                              </button>
                            )}

                            {/* Hide Toggle */}
                            {!r.is_removed && !r.is_hidden && (
                              <button
                                onClick={() => handleHideReview(r.id)}
                                className="px-3 py-1.5 rounded-lg border border-[#EAE5DF] hover:bg-stone-50 text-xs font-semibold text-[#566176] flex items-center gap-1"
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hide</span>
                              </button>
                            )}

                            {/* Platform Restore Action */}
                            {(r.is_hidden || r.is_reported || r.is_removed) && (
                              <button
                                onClick={() => handleRestoreReview(r.id)}
                                className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 flex items-center gap-1"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Restore / Approve</span>
                              </button>
                            )}

                            {/* Policy based Removal (Platform Policy) */}
                            {!r.is_removed && (
                              <button
                                onClick={() => setRemovingReview(r)}
                                className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold text-[#D66A78] flex items-center gap-1"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span>Remove (Policy Violations)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL: Replying to review */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveReply}
            className="bg-white text-stone-900 w-full max-w-md rounded-3xl p-6 shadow-xl border border-[#EAE5DF] space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-stone-200">
              <h3 className="font-serif font-bold text-lg text-[#1E2433]">Owner Response</h3>
              <button type="button" onClick={() => setReplyingReview(null)} className="text-stone-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-[#566176]">
                Replying to <strong className="text-black">{replyingReview.user_name}</strong>'s review:
              </p>
              <div className="p-3 bg-stone-50 rounded-xl text-xs font-light italic">
                "{replyingReview.comment}"
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Your Response Message</label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank you for visiting Aura Luxe! We appreciate your kind words and look forward..."
                  className="text-xs min-h-[100px]"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
              <Button variant="secondary" size="sm" type="button" onClick={() => setReplyingReview(null)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" className="bg-[#1E2433] text-white">
                Post Response
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Policy Removal Reason */}
      {removingReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <form
            onSubmit={handleRemoveReview}
            className="bg-white text-stone-900 w-full max-w-md rounded-3xl p-6 shadow-xl border border-[#EAE5DF] space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-stone-200">
              <h3 className="font-serif font-bold text-lg text-[#D66A78] flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <span>Remove Review (Policy Violation)</span>
              </h3>
              <button type="button" onClick={() => setRemovingReview(null)} className="text-stone-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Select the explicit platform policy that has been violated to mask this review and log a removal reason:
              </p>
              <Select
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                className="text-xs"
                required
              >
                <option value="">-- Choose Violation Type --</option>
                <option value="Contains offensive, profane, or abusive language">Abusive Language / Hate Speech</option>
                <option value="Review is verified to be spam, promotional, or advertise competitor services">Spam & Advertisement</option>
                <option value="Involves fake accounts, false booking claims, or impersonation">Fake Review / Fraudulent Claim</option>
                <option value="Violates individual privacy by sharing private telephone/email/names">Privacy Policy Breach</option>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
              <Button variant="secondary" size="sm" type="button" onClick={() => setRemovingReview(null)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                Enforce Removal Policy
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
