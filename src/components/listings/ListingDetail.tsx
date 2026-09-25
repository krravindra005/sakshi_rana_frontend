import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { AdsService } from '../../services/ads.service';
import { UsersService } from '../../services/users.service';
import { FavoritesService } from '../../services/favorites.service';
import { Ad } from '../../types/ad';
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Eye, 
  Heart, 
  Phone, 
  MessageSquare, 
  AlertTriangle, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface ListingDetailProps {
  slug: string;
}

export const ListingDetail: React.FC<ListingDetailProps> = ({ slug }) => {
  const { navigateTo } = useRouter();
  
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [similarAds, setSimilarAds] = useState<Ad[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);

  // 1. Fetch listing details
  useEffect(() => {
    let mounted = true;
    const fetchAd = async () => {
      setLoading(true);
      try {
        const result = await AdsService.getBySlug(slug);
        if (result && mounted) {
          setAd(result);
          // Increment views count mock
          result.viewsCount += 1;
          
          if (UsersService.isLoggedIn()) {
            FavoritesService.isFavorite(result.id).then((status) => {
              if (mounted) setIsFavorited(status);
            }).catch(() => {});
          }

          // Fetch similar ads (same category)
          const allAds = await AdsService.getAll();
          if (mounted) {
            const similar = allAds.filter(
              (item) => item.categorySlug === result.categorySlug && item.id !== result.id
            );
            setSimilarAds(similar.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Error fetching ad detail', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAd();
    setIsPhoneRevealed(false);
    setActiveImageIdx(0);

    const handleFavUpdated = (e: Event) => {
      const custom = e as CustomEvent<{ adId: string; isFavorite: boolean }>;
      if (custom.detail && ad && (String(custom.detail.adId) === String(ad.id) || String(custom.detail.adId) === String(ad.slug))) {
        if (mounted) setIsFavorited(custom.detail.isFavorite);
      }
    };
    window.addEventListener('favorites_updated', handleFavUpdated);

    return () => {
      mounted = false;
      window.removeEventListener('favorites_updated', handleFavUpdated);
    };
  }, [slug]);

  const handleToggleFavorite = async () => {
    if (!ad) return;
    if (!UsersService.isLoggedIn()) {
      const currentUrl = window.location.pathname + window.location.search;
      navigateTo(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }
    const previous = isFavorited;
    setIsFavorited(!previous);
    setAd((prev) => prev ? {
      ...prev,
      favoriteCount: Math.max(0, (prev.favoriteCount || 0) + (previous ? -1 : 1))
    } : null);

    try {
      const newStatus = await FavoritesService.toggle(ad.id);
      setIsFavorited(newStatus);
    } catch {
      setIsFavorited(previous);
      setAd((prev) => prev ? {
        ...prev,
        favoriteCount: Math.max(0, (prev.favoriteCount || 0) + (previous ? 1 : -1))
      } : null);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reportReason) {
      setReportSubmitted(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSubmitted(false);
        setReportReason('');
        setReportDetails('');
        alert('Thank you. The report has been filed. Our moderators will review this advertisement in 24 hours.');
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-6 w-48 bg-slate-100 rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <div className="h-96 bg-slate-100 rounded-2xl" />
            <div className="h-40 bg-slate-100 rounded-2xl" />
          </div>
          <div className="h-80 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Advertisement Not Found</h2>
        <p className="text-slate-500 text-sm">
          The listing may have expired, been paused by the advertiser, or taken down for review.
        </p>
        <button
          onClick={() => navigateTo('/')}
          className="bg-slate-950 text-white font-semibold py-2 px-6 rounded-xl text-sm"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-6">
          <button onClick={() => navigateTo('/')} className="hover:text-slate-600">Home</button>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <button onClick={() => navigateTo(`/${ad.categorySlug}/delhi`)} className="hover:text-slate-600 capitalize">
            {ad.categorySlug.replace('-', ' ')}
          </button>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-900 font-semibold truncate max-w-[200px]">{ad.profileName}</span>
        </nav>

        {/* Dynamic Detail layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: Gallery & Profile content */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            
            {/* Gallery Block */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
              {/* Main Stage */}
              <div 
                id="gallery-main-stage"
                onClick={() => setIsFullScreenOpen(true)}
                className="relative h-[440px] bg-slate-100 rounded-xl overflow-hidden cursor-zoom-in"
              >
                <img
                  src={ad.images[activeImageIdx]}
                  alt={`${ad.profileName} photo`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Favorite Heart Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite();
                  }}
                  className={`absolute top-4 right-4 z-20 p-2.5 rounded-full border backdrop-blur-md transition shadow cursor-pointer ${
                    isFavorited
                      ? 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600'
                      : 'bg-white/90 hover:bg-white text-slate-700 border-slate-200'
                  }`}
                  title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current text-white' : 'text-slate-700'}`} />
                </button>

                {/* Images count indicator */}
                <div className="absolute bottom-4 right-4 bg-slate-900/60 backdrop-blur-md text-white font-mono text-[11px] font-bold py-1 px-2.5 rounded-lg">
                  {activeImageIdx + 1} / {ad.images.length} Photos
                </div>

                {/* Left/Right controls */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIdx((prev) => (prev === 0 ? ad.images.length - 1 : prev - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white rounded-full shadow transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIdx((prev) => (prev === ad.images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white rounded-full shadow transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Thumbnails list */}
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {ad.images.map((img, idx) => (
                  <button
                    key={img + idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                      activeImageIdx === idx ? 'border-indigo-600 shadow-sm' : 'border-transparent hover:border-slate-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Meta and Information */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
              
              {/* Title & Stats */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {ad.isVerified && (
                    <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 fill-current" />
                      Verified Profile
                    </span>
                  )}
                  {ad.isFeatured && (
                    <span className="inline-flex items-center gap-1 bg-slate-900 text-amber-400 text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg shadow-sm">
                      Featured
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-medium">Category: <strong className="capitalize text-slate-700">{ad.categorySlug.replace('-', ' ')}</strong></span>
                  
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className={`ml-auto inline-flex items-center gap-1.5 py-1 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                      isFavorited
                        ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                    <span>{isFavorited ? 'Saved in Favorites' : 'Add to Favorites'}</span>
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">{ad.title}</h1>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium pt-3.5 border-t border-slate-100">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-400" /> <span className="capitalize">{ad.citySlug}</span>, {ad.areaSlug?.replace('-', ' ')}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-slate-400" /> Published {ad.postedAt}</span>
                  <span className="flex items-center gap-1"><Eye className="w-4 h-4 text-slate-400" /> {ad.viewsCount} View audits</span>
                  {ad.favoriteCount !== undefined && ad.favoriteCount > 0 && (
                    <span className="flex items-center gap-1 text-rose-600 font-semibold">
                      <Heart className="w-3.5 h-3.5 fill-rose-500" /> {ad.favoriteCount} Favorites
                    </span>
                  )}
                </div>
              </div>

              {/* About description */}
              <div className="prose prose-slate max-w-none">
                <h3 className="text-base font-bold text-slate-950 mb-3">About {ad.profileName}</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{ad.description}</p>
              </div>

              {/* Profile Attributes grid */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-base font-bold text-slate-950 mb-4">Companion Specifications</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(ad.attributes || {}).map(([key, val]) => {
                    if (key === 'placeOfService') return null; // rendered separately
                    return (
                      <div key={key} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-sm font-semibold text-slate-800 capitalize mt-0.5 block">
                          {Array.isArray(val) ? val.join(', ') : val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Services List as Chips */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-base font-bold text-slate-950 mb-3">Services Offered</h3>
                <div className="flex flex-wrap gap-2">
                  {(ad.services || []).map((svc) => (
                    <span
                      key={svc}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100/50 rounded-xl text-xs font-semibold"
                    >
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Place of Service Locations */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-base font-bold text-slate-950 mb-3">Place of Service</h3>
                <div className="flex flex-wrap gap-2">
                  {ad.attributes.placeOfService.map((loc) => (
                    <span
                      key={loc}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                    >
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {loc}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Contact Panel & Safety audits */}
          <div className="space-y-6">
            
            {/* Contact Panel Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-md sticky top-20">
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white shrink-0">
                  <img src={ad.profileImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white leading-tight">Connect with {ad.profileName}</h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Independent Companion
                  </p>
                </div>
              </div>

              {/* Phone Action Button */}
              <div className="space-y-3">
                {isPhoneRevealed ? (
                  <a
                    href={`tel:${ad.contact.phone.replace(/\s+/g, '')}`}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{ad.contact.phone}</span>
                  </a>
                ) : (
                  <button
                    onClick={() => setIsPhoneRevealed(true)}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Reveal Phone Number</span>
                  </button>
                )}

                {/* WhatsApp Action */}
                <a
                  href={`https://wa.me/${ad.contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm rounded-xl transition"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Send WhatsApp Message</span>
                </a>

                {/* Favorite Action Button */}
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm border transition shadow-sm cursor-pointer ${
                    isFavorited
                      ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-white' : 'text-rose-400'}`} />
                  <span>{isFavorited ? 'Saved in Favorite Collections' : 'Save to Favorites'}</span>
                </button>
              </div>

              {/* Safety notice disclaimer */}
              <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-400 leading-relaxed space-y-2">
                <strong className="text-amber-400 block font-mono uppercase tracking-wider text-[10px]">Safety Protocol:</strong>
                <p>&bull; Never send advanced booking fees or deposits before meeting. Genuine independent companions rarely demand up-front digital cash.</p>
                <p>&bull; Always choose a safe, public neutral setting like a luxury hotel lobby or cafe before arranging privacy.</p>
              </div>

              {/* Report Advertisement */}
              <div className="pt-4 border-t border-slate-800 text-center">
                <button
                  id="btn-report-ad"
                  onClick={() => setIsReportModalOpen(true)}
                  className="text-xs text-slate-500 hover:text-rose-400 font-semibold transition flex items-center justify-center gap-1.5 mx-auto hover:underline"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Report this listing</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* SIMILAR ADVERTISEMENTS SECTION */}
        {similarAds.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">
              Similar Companions & Relaxations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarAds.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigateTo(`/ad/${item.slug}`)}
                  className="group bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md cursor-pointer transition flex gap-4"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-50">
                    <img src={item.profileImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition truncate text-sm">
                        {item.profileName}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {item.title}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono capitalize">
                      {item.citySlug} &bull; {item.attributes.bodyType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* FULLSCREEN IMAGE VIEWER MODAL */}
      {isFullScreenOpen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
          <button
            onClick={() => setIsFullScreenOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition z-55"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
            <img
              src={ad.images[activeImageIdx]}
              alt=""
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />

            {/* Left/Right fullscreen controls */}
            <button
              onClick={() => setActiveImageIdx((prev) => (prev === 0 ? ad.images.length - 1 : prev - 1))}
              className="absolute left-4 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActiveImageIdx((prev) => (prev === ad.images.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* REPORT AD MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 relative animate-in zoom-in duration-200">
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-full border border-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
              <h3 className="font-bold text-slate-900 text-lg">Report Advertisement</h3>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Reason for reporting
                </label>
                <select
                  id="report-reason-select"
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none"
                >
                  <option value="">Select a reason</option>
                  <option value="Spam">Spam / Excessive Posting</option>
                  <option value="Scam">Scam / Pre-payment fraud</option>
                  <option value="Fake profile">Fake Profile / Catfish</option>
                  <option value="Incorrect information">Incorrect location or specs</option>
                  <option value="Inappropriate content">Sexually explicit or non-consensual</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Additional Details
                </label>
                <textarea
                  id="report-details-textarea"
                  rows={4}
                  required
                  placeholder="Explain why this profile should be investigated..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 focus:outline-none focus:bg-white transition"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  id="report-submit-btn"
                  type="submit"
                  disabled={reportSubmitted}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1"
                >
                  {reportSubmitted ? (
                    <span>Filing report...</span>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
