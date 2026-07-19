import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { mockCategories } from '../../data/mock-categories';
import { mockCities } from '../../data/mock-locations';
import { Network, ArrowUpRight } from 'lucide-react';

export const PopularSeoLinks: React.FC = () => {
  const { navigateTo } = useRouter();

  // Selected SEO target cities as specified
  const seoCities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune'];

  return (
    <section className="py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Popular Localized Classifications
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Discover rapid, high-density local classified shortcuts grouped by companion categories and metropolitan areas.
            </p>
          </div>
        </div>

        {/* SEO Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {mockCategories.map((cat) => (
            <div 
              key={cat.id} 
              className="p-5 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-slate-100/30 transition duration-200"
            >
              <h3 className="font-bold text-slate-900 text-sm mb-3 pb-2 border-b border-slate-200/50 flex items-center justify-between">
                <span>{cat.name}</span>
                <span className="text-[10px] font-mono text-slate-400 font-semibold">{cat.listingCount} active</span>
              </h3>
              
              <ul className="space-y-2">
                {seoCities.map((cityName) => {
                  const citySlug = cityName.toLowerCase();
                  const targetPath = `/${cat.slug}/${citySlug}`;
                  
                  return (
                    <li key={cityName}>
                      <button
                        onClick={() => navigateTo(targetPath)}
                        className="text-xs text-slate-500 hover:text-indigo-600 font-medium transition flex items-center justify-between w-full group/link"
                      >
                        <span className="group-hover/link:underline">{cat.name} in {cityName}</span>
                        <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover/link:text-indigo-600 transition" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Internal Links note */}
        <div className="mt-8 p-4 rounded-xl bg-indigo-50/20 border border-indigo-100/30 text-center text-xs text-slate-500 leading-relaxed">
          <strong>SEO Routing & Integration Note:</strong> The routing architecture maps directly to the slug pattern of <code className="bg-white px-1.5 py-0.5 rounded border border-slate-100 font-mono font-medium text-[11px]">/[category]/[city]</code>. This supports future Laravel SEO payload dynamic injections, unique local meta descriptions, custom breadcrumbs, and localized title-tag overrides.
        </div>

      </div>
    </section>
  );
};
