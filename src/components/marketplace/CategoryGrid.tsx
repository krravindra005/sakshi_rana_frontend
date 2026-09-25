import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { CategoriesService } from '../../services/categories.service';
import { Category } from '../../types/api';
import { Sparkles, Flower, User, Heart, Users, ArrowUpRight } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  const { navigateTo } = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    CategoriesService.getAll().then((data) => {
      if (mounted) {
        setCategories(data);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'Flower':
        return <Flower className="w-5 h-5 text-emerald-500" />;
      case 'User':
        return <User className="w-5 h-5 text-sky-500" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-rose-500" />;
      case 'Users':
        return <Users className="w-5 h-5 text-purple-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-500" />;
    }
  };

  const defaultPopularCities = ['Delhi', 'Mumbai', 'Bangalore'];

  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-3">
            Premium Classifieds Directory
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            Select an executive service category below. All listings feature non-explicit, fully consenting adult profiles representing independent providers in major municipal cities.
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-72 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.map((cat) => {
              const coverImage = cat.cover_image || (cat as any).image_path || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600';
              const activeCount = cat.listing_count ?? (cat as any).ads_count ?? (cat as any).active_ads_count ?? 0;
              return (
                <div
                  key={cat.id}
                  className="group flex flex-col justify-between overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300 relative"
                >
                  {/* Cover Image */}
                  <div className="h-44 relative overflow-hidden bg-slate-100">
                    <img
                      src={coverImage}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                    
                    {/* Floating Category Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md p-1.5 rounded-lg flex items-center justify-center shadow-sm">
                      {getCategoryIcon(cat.icon)}
                    </div>

                    {/* Listing Count */}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-bold font-mono tracking-wide text-amber-300 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10 uppercase">
                        {activeCount} active ads
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950 mb-1.5 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                        {cat.description || `Browse executive ${cat.name} listings across top metro regions.`}
                      </p>
                    </div>

                    {/* Popular Cities list */}
                    <div className="pt-4 border-t border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Popular In</span>
                      <div className="flex flex-wrap gap-1.5">
                        {defaultPopularCities.map((city) => (
                          <button
                            key={city}
                            onClick={() => navigateTo(`/${cat.slug}/${city.toLowerCase()}`)}
                            className="text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded transition"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom interactive action */}
                  <button
                    onClick={() => navigateTo(`/${cat.slug}/delhi`)}
                    className="w-full py-3 px-4 bg-slate-50 hover:bg-indigo-50 border-t border-slate-50 hover:border-indigo-100 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition flex items-center justify-center gap-1.5"
                  >
                    <span>Explore Listings</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
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
