import React, { useState, useEffect } from 'react';
import { AdsService } from '../../services/ads.service';
import { Ad } from '../../types/ad';
import { ListingCard } from '../listings/ListingCard';
import { Award, AlertCircle, RefreshCw, PlusCircle } from 'lucide-react';
import { useRouter } from '../../context/RouterContext';

export const FeaturedAds: React.FC = () => {
  const { navigateTo } = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedAds = async () => {
    setLoading(true);
    setError(null);
    try {
      let featured = await AdsService.getFeatured(4);
      if (featured.length === 0) {
        const all = await AdsService.getAll();
        featured = all.slice(0, 4);
      }
      setAds(featured);
    } catch (err: any) {
      console.error('Error fetching featured ads:', err);
      setError(err?.message || 'Failed to load featured advertisements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        let featured = await AdsService.getFeatured(4);
        if (featured.length === 0) {
          const all = await AdsService.getAll();
          featured = all.slice(0, 4);
        }
        if (isMounted) {
          setAds(featured);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error fetching featured ads:', err);
          setError(err?.message || 'Failed to load featured advertisements.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-2xl shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Featured Advertisements
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Verified independent companions and premium spa operators holding featured promotion slots.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => navigateTo('/category-city')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0"
          >
            <span>Explore All Listings &rarr;</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-slate-100/70 animate-pulse rounded-2xl border border-slate-100 flex flex-col justify-between p-4">
                <div className="h-48 bg-slate-200/80 rounded-xl" />
                <div className="space-y-3 mt-4">
                  <div className="h-4 bg-slate-200/80 rounded w-3/4" />
                  <div className="h-3 bg-slate-200/60 rounded w-1/2" />
                  <div className="h-3 bg-slate-200/60 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-8 text-center max-w-md mx-auto my-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3 animate-bounce" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">Unable to Load Featured Ads</h3>
            <p className="text-xs text-slate-600 mb-4">{error}</p>
            <button
              onClick={fetchFeaturedAds}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Request</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && ads.length === 0 && (
          <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-10 text-center max-w-md mx-auto my-4">
            <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">No Featured Ads Available</h3>
            <p className="text-xs text-slate-500 mb-4">
              Be the first to feature your advertisement in top directory positions.
            </p>
            <button
              onClick={() => navigateTo('/post-ad')}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Featured Ad</span>
            </button>
          </div>
        )}

        {/* Listing Cards Grid */}
        {!loading && !error && ads.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ads.map((ad) => (
              <ListingCard key={ad.id} ad={ad} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
