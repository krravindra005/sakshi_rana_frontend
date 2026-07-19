import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { mockCities } from '../../data/mock-locations';
import { MapPin, ArrowRight } from 'lucide-react';

export const CityBrowse: React.FC = () => {
  const { navigateTo } = useRouter();

  const handleCityClick = (citySlug: string) => {
    // Default to 'call-girls' category when entering from a city card
    navigateTo(`/call-girls/${citySlug}`);
  };

  return (
    <section className="py-16 bg-slate-50/50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              Browse Companions By City
            </h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Connect with premium independent escorts, masseuses, and adult dating profiles in India\'s major hubs. Find in-call areas or out-call companion travel.
            </p>
          </div>
          <button 
            onClick={() => handleCityClick('delhi')}
            className="mt-4 md:mt-0 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline transition self-start"
          >
            <span>View All Cities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {mockCities.map((city) => (
            <div
              key={city.id}
              onClick={() => handleCityClick(city.slug)}
              className="group cursor-pointer overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-300 flex flex-col justify-between"
            >
              {/* Cover Image */}
              <div className="h-40 relative overflow-hidden bg-slate-100">
                <img
                  src={city.image}
                  alt={city.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                
                {/* Active Ads Counter */}
                <div className="absolute top-3 right-3 bg-slate-950/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10">
                  <span className="text-[10px] font-bold font-mono text-white tracking-wide">
                    {city.activeAdsCount} ADS
                  </span>
                </div>

                {/* City name */}
                <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-white">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-base tracking-tight">{city.name}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 group-hover:bg-indigo-50/50 transition flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 group-hover:text-indigo-600 font-mono tracking-wider">
                  EXPLORE {city.name.toUpperCase()}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
