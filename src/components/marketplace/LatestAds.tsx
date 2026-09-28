import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { AdsService } from '../../services/ads.service';
import { Ad } from '../../types/ad';
import { ListingCard } from '../listings/ListingCard';
import { Sparkles, ArrowRight, AlertCircle, RefreshCw, PlusCircle, Layers } from 'lucide-react';

export const LatestAds: React.FC = () => {
  const { navigateTo } = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestAds = async () => {
    setLoading(true);
    setError(null);
    try {
      const latest = await AdsService.getLatest(8);
      setAds(latest);
    } catch (err: any) {
      console.error('Error fetching latest ads:', err);
      setError(err?.message || 'Failed to load latest advertisements.');
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
        const latest = await AdsService.getLatest(8);
        if (isMounted) {
          setAds(latest);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error fetching latest ads:', err);
          setError(err?.message || 'Failed to load latest advertisements.');
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

  const handleViewAll = () => {
    navigateTo('/category-city');
  };

  return (
    <section className="py-12 sm:py-16 bg-slate-50/20 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              Latest Directory Publications
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Freshly verified listings, individual companion postings, and relaxation services updated minutes ago.
            </p>
          </div>
          
          <button
            onClick={handleViewAll}
            className="mt-4 sm:mt-0 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition flex items-center gap-1 self-start"
          >
            <span>View All Advertisements</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loading Skeleton State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">Unable to Load Latest Ads</h3>
            <p className="text-xs text-slate-600 mb-4">{error}</p>
            <button
              onClick={fetchLatestAds}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Request</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && ads.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/70 p-10 text-center max-w-md mx-auto my-4">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">No Listings Found</h3>
            <p className="text-xs text-slate-500 mb-4">
              There are currently no active directory publications available.
            </p>
            <button
              onClick={() => navigateTo('/post-ad')}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post First Ad</span>
            </button>
          </div>
        )}

        {/* Responsive Listing Grid */}
        {!loading && !error && ads.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {ads.map((ad) => (
                <ListingCard key={ad.id} ad={ad} />
              ))}
            </div>

            {/* Bottom Call to Action for viewing all */}
            <div className="mt-12 text-center">
              <button
                id="view-all-ads-button-footer"
                onClick={handleViewAll}
                className="inline-flex items-center gap-2 px-8 py-3.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition shadow-sm"
              >
                <span>Browse All Advertisements</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </>
        )}

      </div>
    </section>
  );
};
