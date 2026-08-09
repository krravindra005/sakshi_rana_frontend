import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { Ad } from '../../types/ad';
import { UsersService } from '../../services/users.service';
import { mockCategories } from '../../data/mock-categories';
import { ShieldCheck, Heart, Eye, ArrowUpRight, Award, MapPin } from 'lucide-react';

interface ListingCardProps {
  ad: Ad;
  onFavoriteToggle?: (adId: string) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ ad, onFavoriteToggle }) => {
  const { navigateTo } = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const favorites = UsersService.getFavorites();
    setIsFavorited(favorites.includes(ad.id));
  }, [ad.id]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!UsersService.isLoggedIn()) {
      const currentUrl = window.location.pathname + window.location.search;
      navigateTo(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }
    UsersService.toggleFavorite(ad.id);
    setIsFavorited(!isFavorited);
    if (onFavoriteToggle) {
      onFavoriteToggle(ad.id);
    }
  };

  const getCategoryName = (slug: string) => {
    return mockCategories.find((c) => c.slug === slug)?.name || slug;
  };

  return (
    <div
      onClick={() => navigateTo(`/ad/${ad.slug}`)}
      className={`group cursor-pointer bg-white overflow-hidden rounded-2xl border transition duration-300 relative flex flex-col justify-between ${
        ad.isFeatured 
          ? 'border-amber-200 ring-2 ring-amber-400/10 shadow-md hover:shadow-lg' 
          : 'border-slate-100 hover:border-slate-200/80 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Profile Photo Stage */}
      <div className="relative h-64 bg-slate-100 overflow-hidden">
        <img
          src={ad.profileImage}
          alt={ad.profileName}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />

        {/* Favorite heart overlay */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full border backdrop-blur-md transition-colors ${
            isFavorited
              ? 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600'
              : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200'
          }`}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current animate-ping-once' : ''}`} />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {ad.isVerified && (
            <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg shadow-sm border border-emerald-400/20">
              <ShieldCheck className="w-3.5 h-3.5 fill-current" />
              Verified
            </span>
          )}
          {ad.isFeatured && (
            <span className="inline-flex items-center gap-1 bg-slate-900 text-amber-400 text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg shadow-sm border border-amber-500/20">
              <Award className="w-3.5 h-3.5" />
              Featured
            </span>
          )}
        </div>

        {/* Category & Location indicators */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
          <span className="text-[11px] font-bold uppercase font-mono tracking-wider text-indigo-300">
            {getCategoryName(ad.categorySlug)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-200">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="capitalize">{ad.citySlug}</span>
            {ad.areaSlug && <span className="text-slate-400 text-[10px]">&bull; {ad.areaSlug.replace('-', ' ')}</span>}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-indigo-600 transition">
              {ad.profileName}
            </h3>
            <span className="text-xs text-slate-400 font-mono font-medium flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {ad.viewsCount ?? (ad as any).view_count ?? (ad as any).viewCount ?? 0}
            </span>
          </div>

          <h4 className="text-xs font-semibold text-slate-700 leading-tight mb-2 truncate">
            {ad.title}
          </h4>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {ad.description}
          </p>
        </div>

        {/* Attributes summary grids */}
        <div className="pt-3.5 border-t border-slate-50">
          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 font-mono text-center">
            <div className="bg-slate-50 rounded-lg py-1 border border-slate-100/50">
              <span className="block text-slate-400 text-[9px] uppercase font-bold">Body Type</span>
              <span className="font-semibold text-slate-700 truncate block mt-0.5">{ad.attributes?.bodyType || 'Slim'}</span>
            </div>
            <div className="bg-slate-50 rounded-lg py-1 border border-slate-100/50">
              <span className="block text-slate-400 text-[9px] uppercase font-bold">Hair</span>
              <span className="font-semibold text-slate-700 truncate block mt-0.5">{ad.attributes?.hairColor || 'Dark'}</span>
            </div>
            <div className="bg-slate-50 rounded-lg py-1 border border-slate-100/50">
              <span className="block text-slate-400 text-[9px] uppercase font-bold">Origins</span>
              <span className="font-semibold text-slate-700 truncate block mt-0.5">{ad.attributes?.nationality || 'Indian'}</span>
            </div>
          </div>
        </div>

        {/* Bottom footer bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Posted {ad.postedAt || (ad as any).published_at ? new Date((ad as any).published_at).toLocaleDateString() : 'Recently'}</span>
          <span className="font-semibold text-indigo-600 group-hover:underline flex items-center gap-0.5">
            View Profile
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
