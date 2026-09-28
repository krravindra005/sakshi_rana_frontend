import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../../context/RouterContext';
import { CategoriesService } from '../../services/categories.service';
import { Category } from '../../types/api';
import { Sparkles, Flower, User, Heart, Users, ArrowUpRight, ChevronLeft, ChevronRight, RefreshCw, Folder } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  const { navigateTo } = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CategoriesService.getAll();
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories in CategoryGrid:', err);
      setError('Unable to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchCategories().then(() => {
      if (!mounted) return;
    });
    return () => { mounted = false; };
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'flower':
        return <Flower className="w-5 h-5 text-emerald-500" />;
      case 'user':
        return <User className="w-5 h-5 text-sky-500" />;
      case 'heart':
        return <Heart className="w-5 h-5 text-rose-500" />;
      case 'users':
        return <Users className="w-5 h-5 text-purple-500" />;
      default:
        return <Folder className="w-5 h-5 text-indigo-500" />;
    }
  };

  const defaultPopularCities = ['Delhi', 'Mumbai', 'Bangalore'];

  return (
    <section className="py-16 bg-white border-b border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section with slider controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Explore Top Categories</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-3">
              Premium Classified Directory
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Select an executive service category below. All listings feature non-explicit, fully consenting adult profiles representing independent providers.
            </p>
          </div>

          {/* Carousel Scroll Controls */}
          {categories.length > 0 && !loading && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="p-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 shadow-sm transition active:scale-95"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="p-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 shadow-sm transition active:scale-95"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Categories Carousel Slider */}
        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-4 pt-1 [&::-webkit-scrollbar]:none [-ms-overflow-style:none] [scrollbar-width:none]">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="min-w-[280px] sm:min-w-[320px] md:min-w-[340px] max-w-[360px] h-80 bg-slate-100 animate-pulse rounded-2xl shrink-0"
              />
            ))}
          </div>
        ) : error ? (
          <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500 mb-3">{error}</p>
            <button
              onClick={fetchCategories}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Retry Loading</span>
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No categories available at the moment.
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto snap-x scroll-smooth pb-4 pt-1 [&::-webkit-scrollbar]:none [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {categories.map((cat) => {
              const coverImage = cat.cover_image || (cat as any).image_path || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600';
              const activeCount = cat.listing_count ?? (cat as any).ads_count ?? (cat as any).active_ads_count ?? 0;
              const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;

              return (
                <div
                  key={cat.id}
                  className="snap-start shrink-0 min-w-[280px] sm:min-w-[320px] md:min-w-[340px] max-w-[360px] flex flex-col justify-between overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300 group"
                >
                  {/* Cover Image & Header Badge */}
                  <div
                    onClick={() => navigateTo(`/${cat.slug}`)}
                    className="h-44 relative overflow-hidden bg-slate-100 cursor-pointer"
                  >
                    <img
                      src={coverImage}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                    
                    {/* Floating Category Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md p-2 rounded-xl flex items-center justify-center shadow-sm">
                      {getCategoryIcon(cat.icon)}
                    </div>

                    {/* Listing Count Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-bold font-mono tracking-wide text-amber-300 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10 uppercase">
                        {activeCount} {activeCount === 1 ? 'active ad' : 'active ads'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        onClick={() => navigateTo(`/${cat.slug}`)}
                        className="text-lg font-bold text-slate-950 mb-1.5 group-hover:text-indigo-600 transition cursor-pointer flex items-center gap-1.5"
                      >
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                        {cat.description || `Browse executive ${cat.name} listings across top metro regions.`}
                      </p>
                    </div>

                    {/* Subcategories or Popular Cities list */}
                    <div className="pt-3 border-t border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                        {hasSubcategories ? 'Subcategories' : 'Popular In'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {hasSubcategories ? (
                          cat.subcategories!.slice(0, 3).map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => navigateTo(`/${sub.slug}`)}
                              className="text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 px-2.5 py-1 rounded-lg border border-slate-100 transition"
                            >
                              {sub.name}
                            </button>
                          ))
                        ) : (
                          defaultPopularCities.map((city) => (
                            <button
                              key={city}
                              onClick={() => navigateTo(`/${cat.slug}/${city.toLowerCase()}`)}
                              className="text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-100 transition"
                            >
                              {city}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom interactive action button */}
                  <button
                    onClick={() => navigateTo(`/${cat.slug}`)}
                    className="w-full py-3 px-4 bg-slate-50 hover:bg-indigo-50 border-t border-slate-100 hover:border-indigo-100 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition flex items-center justify-center gap-1.5"
                  >
                    <span>Explore {cat.name}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

