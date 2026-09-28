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
  DollarSign,
  User as UserIcon,
  Mail,
  Maximize2,
  ExternalLink,
  Tag
} from 'lucide-react';

interface ListingDetailProps {
  slug: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600';

export const ListingDetail: React.FC<ListingDetailProps> = ({ slug }) => {
  const { navigateTo } = useRouter();
  
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  
  const [similarAds, setSimilarAds] = useState<Ad[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);

  // Fetch listing details dynamically when slug changes
  useEffect(() => {
    let mounted = true;
    const fetchAd = async () => {
      if (!slug) {
        if (mounted) {
          setLoading(false);
          setError('Invalid advertisement slug provided.');
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await AdsService.getBySlug(slug);
        if (mounted) {
          if (result) {
            setAd(result);
            result.viewsCount = (result.viewsCount || 0) + 1;
            
            if (UsersService.isLoggedIn()) {
              FavoritesService.isFavorite(result.id)
                .then((status) => {
                  if (mounted) setIsFavorited(status);
                })
                .catch(() => {});
            }

            // Fetch similar ads matching category
            AdsService.getAll()
              .then((allAds) => {
                if (mounted) {
                  const similar = allAds.filter(
                    (item) => item.id !== result.id && (item.categorySlug === result.categorySlug || item.category === result.category)
                  );
                  setSimilarAds(similar.slice(0, 3));
                }
              })
              .catch(() => {});
          } else {
            setError('Advertisement not found or unavailable.');
            setAd(null);
          }
        }
      } catch (err: any) {
        console.error('Error fetching ad details:', err);
        if (mounted) {
          setError(err?.message || 'Failed to load advertisement details.');
          setAd(null);
        }
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
        alert('Thank you. The report has been filed. Our moderation team will inspect this advertisement within 24 hours.');
      }, 1200);
    }
  };

  // 1. Loading Skeleton State
  if (loading) {
    return (
      <div className="bg-[#fcfcfd] min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
          <div className="h-4 w-48 bg-slate-200 rounded-lg mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-[440px] bg-slate-200 rounded-2xl" />
              <div className="h-48 bg-slate-200 rounded-2xl" />
              <div className="h-32 bg-slate-200 rounded-2xl" />
            </div>
            <div className="space-y-6">
              <div className="h-96 bg-slate-200 rounded-2xl" />
              <div className="h-48 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Not Found / Error State
  if (error || !ad) {
    return (
      <div className="bg-[#fcfcfd] min-h-screen py-24 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-100 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Advertisement Not Available</h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            {error || 'The requested advertisement could not be found or has been removed.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigateTo('/')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-6 rounded-xl text-xs shadow-sm transition"
            >
              Return to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safe Property Mapping
  const images = (ad.images && ad.images.length > 0) 
    ? ad.images 
    : [ad.coverImage || ad.profileImage || FALLBACK_IMAGE];

  const categoryName = ad.category || (ad.categorySlug ? ad.categorySlug.replace(/-/g, ' ') : 'Classified');
  const cityName = ad.cityName || (ad.citySlug ? ad.citySlug.replace(/-/g, ' ') : 'City');
  const areaName = ad.areaName || (ad.areaSlug ? ad.areaSlug.replace(/-/g, ' ') : undefined);
  
  const placeOfService = Array.isArray(ad.attributes?.placeOfService) ? ad.attributes.placeOfService : [];
  const contactPhone = ad.contact?.phone || '';
  const contactWhatsapp = ad.contact?.whatsapp || contactPhone;
  const seller = ad.user;

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 font-medium mb-6">
          <button onClick={() => navigateTo('/')} className="hover:text-slate-600 transition">Home</button>
          <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
          {ad.categorySlug && (
            <>
              <button onClick={() => navigateTo(`/${ad.categorySlug}/delhi`)} className="hover:text-slate-600 capitalize transition">
                {categoryName}
              </button>
              <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            </>
          )}
          {ad.citySlug && (
            <>
              <span className="capitalize text-slate-600">{cityName}</span>
              <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            </>
          )}
          <span className="text-slate-900 font-semibold truncate max-w-[240px]">{ad.profileName || ad.title}</span>
        </nav>

        {/* Dynamic Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: Gallery & Main Information */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Gallery Block */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
              
              {/* Main Photo Stage */}
              <div 
                id="gallery-main-stage"
                onClick={() => setIsFullScreenOpen(true)}
                className="relative h-[380px] sm:h-[460px] bg-slate-900 rounded-xl overflow-hidden cursor-zoom-in group"
              >
                <img
                  src={images[activeImageIdx] || FALLBACK_IMAGE}
                  alt={`${ad.profileName} photo`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

                {/* Fullscreen Expand Icon */}
                <div className="absolute top-4 left-4 bg-slate-900/70 backdrop-blur-md text-white p-2 rounded-lg text-xs font-semibold opacity-80 group-hover:opacity-100 transition">
                  <Maximize2 className="w-4 h-4" />
                </div>

                {/* Favorite Button */}
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

                {/* Photos Count Indicator */}
                <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white font-mono text-[11px] font-bold py-1 px-3 rounded-lg border border-white/10">
                  {activeImageIdx + 1} / {images.length} Photos
                </div>

                {/* Carousel Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-sm text-slate-800 hover:bg-white rounded-full shadow-lg transition cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-sm text-slate-800 hover:bg-white rounded-full shadow-lg transition cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Carousel Strip */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 pt-1">
                  {images.map((img, idx) => (
                    <button
                      key={img + idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                        activeImageIdx === idx ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/20' : 'border-slate-100 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Meta and Information Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
              
              {/* Owner Moderation Notice Banner */}
              {(ad.moderationStatus !== 'approved' || ad.status !== 'published') && (
                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 flex items-center gap-3 text-xs font-semibold text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    This advertisement is currently <strong>{ad.status === 'published' ? 'Pending Moderation Review' : ad.status}</strong>. Only you (the publisher) can view this listing.
                  </span>
                </div>
              )}

              {/* Title, Badges & Price Header */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {(ad.moderationStatus !== 'approved' || ad.status !== 'published') && (
                    <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg shadow-xs">
                      Pending Review
                    </span>
                  )}
                  {ad.isVerified && (
                    <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5 fill-current" />
                      Verified Profile
                    </span>
                  )}
                  {ad.isFeatured && (
                    <span className="inline-flex items-center gap-1 bg-slate-900 text-amber-400 text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg shadow-xs">
                      Featured
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-medium">
                    Category: <strong className="capitalize text-slate-700">{categoryName}</strong>
                  </span>

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
                    <span>{isFavorited ? 'Saved' : 'Save'}</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    {ad.title}
                  </h1>
                  
                  {ad.price !== undefined && ad.price > 0 && (
                    <div className="shrink-0 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
                      <span className="block text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">Rate / Pricing</span>
                      <span className="text-xl font-extrabold text-indigo-600 font-mono">₹{ad.price.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium pt-3.5 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="capitalize">{cityName}</span>
                    {areaName && <span>, {areaName}</span>}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-400" /> Published {ad.postedAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-slate-400" /> {ad.viewsCount} Views
                  </span>
                  {ad.favoriteCount !== undefined && ad.favoriteCount > 0 && (
                    <span className="flex items-center gap-1 text-rose-600 font-semibold">
                      <Heart className="w-3.5 h-3.5 fill-rose-500" /> {ad.favoriteCount} Favorites
                    </span>
                  )}
                </div>
              </div>

              {/* Description Block */}
              <div className="prose prose-slate max-w-none pt-2 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-950 mb-3">About {ad.profileName}</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {ad.description || 'No detailed description provided.'}
                </p>
              </div>

              {/* Specifications & Attributes */}
              {ad.attributes && Object.keys(ad.attributes).length > 0 && (
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-base font-bold text-slate-950 mb-4">Companion Specifications</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.entries(ad.attributes).map(([key, val]) => {
                      if (key === 'placeOfService' || !val) return null;
                      return (
                        <div key={key} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="text-sm font-semibold text-slate-800 capitalize mt-0.5 block">
                            {Array.isArray(val) ? val.join(', ') : String(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Services Offered */}
              {ad.services && ad.services.length > 0 && (
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-base font-bold text-slate-950 mb-3">Services Offered</h3>
                  <div className="flex flex-wrap gap-2">
                    {ad.services.map((svc) => (
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
              )}

              {/* Place of Service Locations */}
              {placeOfService.length > 0 && (
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-base font-bold text-slate-950 mb-3">Place of Service</h3>
                  <div className="flex flex-wrap gap-2">
                    {placeOfService.map((loc) => (
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
              )}

            </div>

          </div>

          {/* RIGHT COLUMN: Contact Panel & Seller Context */}
          <div className="space-y-6">
            
            {/* Contact Panel Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-md sticky top-20">
              
              {/* Seller / Publisher Summary */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white shrink-0">
                  <img 
                    src={seller?.avatar || ad.profileImage || FALLBACK_IMAGE} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white leading-tight">
                    {seller?.name || ad.profileName}
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Verified Advertiser
                  </p>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="space-y-3">
                {isPhoneRevealed ? (
                  <a
                    href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{contactPhone || 'No Phone Specified'}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsPhoneRevealed(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Reveal Phone Number</span>
                  </button>
                )}

                {/* WhatsApp Direct Action */}
                {contactWhatsapp && (
                  <a
                    href={`https://wa.me/${contactWhatsapp.replace(/\+/g, '').replace(/\s+/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm rounded-xl transition"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Send WhatsApp Message</span>
                  </a>
                )}

                {/* Save to Favorites Button */}
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm border transition shadow-xs cursor-pointer ${
                    isFavorited
                      ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-white' : 'text-rose-400'}`} />
                  <span>{isFavorited ? 'Saved in Favorites' : 'Save to Favorites'}</span>
                </button>
              </div>

              {/* Safety Protocol Disclaimer */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 leading-relaxed space-y-2">
                <strong className="text-amber-400 block font-mono uppercase tracking-wider text-[10px]">Safety Protocol:</strong>
                <p>&bull; Never send advanced booking fees or deposits before meeting in person.</p>
                <p>&bull; Always meet in safe, public neutral settings prior to arranging private meetings.</p>
              </div>

              {/* Report Advertisement */}
              <div className="pt-3 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="text-xs text-slate-500 hover:text-rose-400 font-semibold transition flex items-center justify-center gap-1.5 mx-auto hover:underline cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Report this listing</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* Similar Listings Section */}
        {similarAds.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">
              Similar Ads in {categoryName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarAds.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigateTo(`/ad/${item.slug || item.id}`)}
                  className="group bg-white rounded-2xl border border-slate-100 p-4 shadow-xs hover:shadow-md cursor-pointer transition flex gap-4"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <img src={item.profileImage || FALLBACK_IMAGE} alt="" className="w-full h-full object-cover transition duration-300 group-hover:scale-105" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition truncate text-sm">
                        {item.profileName || item.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {item.title}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono capitalize pt-2">
                      <span>{item.citySlug || 'Classified'}</span>
                      <span className="font-bold text-indigo-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                        View &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullScreenOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsFullScreenOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsFullScreenOpen(false)}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer z-50"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
            <img 
              src={images[activeImageIdx] || FALLBACK_IMAGE} 
              alt="" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsReportModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Report Advertisement</h3>
                <p className="text-slate-500 text-xs">Help keep our platform safe and discreet</p>
              </div>
            </div>

            {reportSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Report Submitted Successfully</h4>
                <p className="text-slate-500 text-xs">Our moderation queue has logged your ticket for review.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1.5">
                    Reason for Report
                  </label>
                  <select
                    required
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select violation category...</option>
                    <option value="spam">Spam / Fraudulent Listing</option>
                    <option value="fake_photos">Fake Photos / Impersonation</option>
                    <option value="advance_fee">Demanding Advance Fee / Deposit</option>
                    <option value="underage">Safety Concern / Illegal Content</option>
                    <option value="inappropriate">Inappropriate Text / Language</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1.5">
                    Additional Context (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide relevant details or chat transcript context..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
