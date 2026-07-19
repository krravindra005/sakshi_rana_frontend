import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { AdsService } from '../../services/ads.service';
import { Ad } from '../../types/ad';
import { ListingCard } from '../listings/ListingCard';
import { Sparkles, ArrowRight } from 'lucide-react';

export const LatestAds: React.FC = () => {
  const { navigateTo } = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const latest = await AdsService.getLatest(8);
        setAds(latest);
      } catch (err) {
        console.error('Error fetching latest ads', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  const handleViewAll = () => {
    // Navigate to empty filters search page, displaying all ads
    navigateTo('/category-city');
  };

  if (loading) {
    return (
      <div className="py-12 bg-slate-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-slate-100 animate-pulse rounded mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-slate-50/20">
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

        {/* Responsive Listing Grid (Desktop, Tablet, Mobile lists) */}
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
            <span>Load More Advertisements</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

      </div>
    </section>
  );
};
