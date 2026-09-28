import React, { useState, useEffect, useRef } from 'react';
import { AdsService } from '../../services/ads.service';
import { Ad } from '../../types/ad';
import { ListingCard } from '../listings/ListingCard';
import { Sparkles, Award } from 'lucide-react';

export const FeaturedAds: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    let isMounted = true;
    const fetchFeatured = async () => {
      try {
        const featured = await AdsService.getFeatured(4);
        if (isMounted) {
          setAds(featured);
        }
      } catch (err) {
        console.error('Error fetching featured ads', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchFeatured();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-slate-100 animate-pulse rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (ads.length === 0) return null;

  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Featured Active Advertisements
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Verified independent companions and premium spa operators holding featured promotion slots.
            </p>
          </div>
        </div>

        {/* Listing Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ads.map((ad) => (
            <ListingCard key={ad.id} ad={ad} />
          ))}
        </div>

      </div>
    </section>
  );
};
