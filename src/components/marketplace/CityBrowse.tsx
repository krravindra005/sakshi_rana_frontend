import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from '../../context/RouterContext';
import { LocationsService } from '../../services/locations.service';
import { Country, Region, City, Area } from '../../types/api';
import { 
  MapPin, 
  ArrowRight, 
  Globe, 
  Navigation, 
  ChevronDown, 
  Check, 
  Building2, 
  Search,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const FALLBACK_CITY_IMAGE = 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&q=80&w=600';

export const CityBrowse: React.FC = () => {
  const { navigateTo } = useRouter();

  // 1. Countries
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // 2. Regions
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null); // null = All Regions
  const [loadingRegions, setLoadingRegions] = useState(false);

  // 3. Cities
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [loadingCities, setLoadingCities] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showAllCities, setShowAllCities] = useState(false);

  // 4. Areas
  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);

  // Get active country object
  const selectedCountry = useMemo(() => {
    return countries.find((c) => c.id === selectedCountryId) || null;
  }, [countries, selectedCountryId]);

  // Step 1: Fetch Countries on mount
  useEffect(() => {
    let isMounted = true;
    setLoadingCountries(true);

    LocationsService.getCountries()
      .then((data) => {
        if (!isMounted) return;
        setCountries(data);
        if (data.length > 0) {
          setSelectedCountryId(data[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load countries:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingCountries(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Step 2: Fetch Regions whenever selectedCountryId changes
  useEffect(() => {
    if (!selectedCountryId) {
      setRegions([]);
      setSelectedRegionId(null);
      return;
    }

    let isMounted = true;
    setLoadingRegions(true);
    setSelectedRegionId(null); // Reset to "All Regions" on country change
    setCitySearch('');
    setShowAllCities(false);

    LocationsService.getStatesByCountry(selectedCountryId)
      .then((data) => {
        if (!isMounted) return;
        setRegions(data);
      })
      .catch((err) => {
        console.error('Failed to load regions:', err);
        if (isMounted) setRegions([]);
      })
      .finally(() => {
        if (isMounted) setLoadingRegions(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCountryId]);

  // Step 3: Fetch Cities whenever selectedCountryId or selectedRegionId changes
  useEffect(() => {
    if (!selectedCountryId) {
      setCities([]);
      setSelectedCity(null);
      setAreas([]);
      return;
    }

    let isMounted = true;
    setLoadingCities(true);
    setSelectedCity(null);
    setAreas([]);

    // Fetch cities for specific region or for country
    const fetchPromise = selectedRegionId
      ? LocationsService.getCities(selectedRegionId)
      : LocationsService.getCities(undefined, undefined, selectedCountryId);

    fetchPromise
      .then((data) => {
        if (!isMounted) return;
        setCities(data);
        // Automatically select the first city so areas load immediately
        if (data.length > 0) {
          setSelectedCity(data[0]);
        }
      })
      .catch((err) => {
        console.error('Failed to load cities:', err);
        if (isMounted) setCities([]);
      })
      .finally(() => {
        if (isMounted) setLoadingCities(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCountryId, selectedRegionId]);

  // Step 4: Fetch Areas whenever selectedCity changes
  useEffect(() => {
    if (!selectedCity) {
      setAreas([]);
      return;
    }

    let isMounted = true;
    setLoadingAreas(true);

    LocationsService.getAreasByCity(selectedCity.id)
      .then((data) => {
        if (!isMounted) return;
        setAreas(data);
      })
      .catch((err) => {
        console.error('Failed to load areas for city:', err);
        if (isMounted) setAreas([]);
      })
      .finally(() => {
        if (isMounted) setLoadingAreas(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCity?.id]);

  // Navigation handlers
  const handleCityNavigate = (city: City) => {
    navigateTo(`/call-girls/${city.slug}`);
  };

  const handleAreaNavigate = (city: City, area: Area) => {
    navigateTo(`/call-girls/${city.slug}`, { area: area.slug });
  };

  const handleViewAll = () => {
    if (selectedCity) {
      navigateTo(`/call-girls/${selectedCity.slug}`);
    } else {
      navigateTo('/category-city');
    }
  };

  // Filtered cities list
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    const term = citySearch.toLowerCase();
    return cities.filter((c) => c.name.toLowerCase().includes(term));
  }, [cities, citySearch]);

  const visibleCities = showAllCities ? filteredCities : filteredCities.slice(0, 10);

  return (
    <section className="py-16 bg-slate-50/50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Browse Companions By City
              </h2>
              
              {/* Dynamic Country Selector */}
              {countries.length > 0 && (
                <div className="relative inline-flex items-center">
                  <Globe className="w-3.5 h-3.5 text-indigo-500 absolute left-3 pointer-events-none" />
                  <select
                    value={selectedCountryId ?? ''}
                    onChange={(e) => setSelectedCountryId(Number(e.target.value))}
                    disabled={loadingCountries}
                    className="appearance-none pl-8 pr-7 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-sm transition"
                  >
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 pointer-events-none" />
                </div>
              )}
            </div>
            <p className="text-slate-500 text-sm max-w-xl">
              Connect with premium independent companions, masseuses, and verified profiles in {selectedCountry?.name || 'top'} hubs. Find in-call areas or out-call companion travel.
            </p>
          </div>
          
          <button 
            onClick={handleViewAll}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline transition self-start md:self-end shrink-0"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Region Filter Bar & Search */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Region Tabs / Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none max-w-full">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mr-1 shrink-0 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-indigo-500" />
              Region:
            </span>

            <button
              onClick={() => setSelectedRegionId(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedRegionId === null
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              All Regions {regions.length > 0 && `(${regions.length})`}
            </button>

            {loadingRegions ? (
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-7 w-20 bg-slate-200/60 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegionId(region.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedRegionId === region.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {region.name}
                </button>
              ))
            )}
          </div>

          {/* Optional Quick Filter by City Name */}
          {cities.length > 5 && (
            <div className="relative shrink-0 w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="Filter city..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>
          )}
        </div>

        {/* Cities Grid */}
        {loadingCities ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <div key={n} className="h-48 bg-slate-200/60 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : visibleCities.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {visibleCities.map((city) => {
                const isSelected = selectedCity?.id === city.id;
                const imgUrl = city.image || FALLBACK_CITY_IMAGE;
                const activeAds = city.active_ads_count ?? city.ads_count ?? 0;

                return (
                  <div
                    key={city.id}
                    onClick={() => setSelectedCity(city)}
                    className={`group cursor-pointer overflow-hidden bg-white rounded-2xl border transition duration-300 flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md -translate-y-1'
                        : 'border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Cover Image */}
                    <div className="h-40 relative overflow-hidden bg-slate-100">
                      <img
                        src={imgUrl}
                        alt={city.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_CITY_IMAGE;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent" />
                      
                      {/* Active Ads Counter */}
                      <div className="absolute top-3 right-3 bg-slate-950/50 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10">
                        <span className="text-[10px] font-bold font-mono text-white tracking-wide">
                          {activeAds} ADS
                        </span>
                      </div>

                      {/* Active Selection Badge */}
                      {isSelected && (
                        <div className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                          <Check className="w-2.5 h-2.5" />
                          <span>Selected</span>
                        </div>
                      )}

                      {/* City Name */}
                      <div className="absolute bottom-3 left-4 right-4 flex items-center gap-1.5 text-white">
                        <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-bold text-base tracking-tight truncate">{city.name}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCityNavigate(city);
                      }}
                      className={`px-4 py-2.5 border-t transition flex items-center justify-between ${
                        isSelected 
                          ? 'bg-indigo-50/70 border-indigo-100' 
                          : 'bg-slate-50 border-slate-100 group-hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="text-[11px] font-bold text-slate-500 group-hover:text-indigo-600 font-mono tracking-wider truncate mr-1">
                        EXPLORE {city.name.toUpperCase()}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 transition" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show All / Show Fewer Toggle */}
            {filteredCities.length > 10 && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowAllCities(!showAllCities)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-indigo-600 rounded-full shadow-sm transition"
                >
                  <span>
                    {showAllCities 
                      ? 'Show Fewer Cities' 
                      : `Show All ${filteredCities.length} Cities in ${selectedRegionId ? 'Region' : selectedCountry?.name || 'Country'}`
                    }
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAllCities ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/70 p-10 text-center max-w-md mx-auto">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">No Cities Found</h3>
            <p className="text-xs text-slate-500 mb-4">
              There are no cities available for the selected filters. Please select another region or country.
            </p>
            {selectedRegionId !== null && (
              <button
                onClick={() => setSelectedRegionId(null)}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold rounded-xl transition"
              >
                Reset to All Regions
              </button>
            )}
          </div>
        )}

        {/* Dependent Flow: City → Areas Panel */}
        {selectedCity && (
          <div className="mt-10 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      Popular Local Areas in {selectedCity.name}
                    </h3>
                    {areas.length > 0 && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                        {areas.length} {areas.length === 1 ? 'Area' : 'Areas'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select a locality in {selectedCity.name} to view independent companions and services near you
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCityNavigate(selectedCity)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition shadow-sm self-start sm:self-auto shrink-0"
              >
                <span>View All in {selectedCity.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Areas Chips / Badges */}
            {loadingAreas ? (
              <div className="flex flex-wrap gap-2.5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-9 w-32 bg-slate-100 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : areas.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {areas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => handleAreaNavigate(selectedCity, area)}
                    className="group inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200/70 hover:border-indigo-200 rounded-xl text-xs font-medium text-slate-700 hover:text-indigo-600 transition"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition" />
                    <span>{area.name}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 -ml-0.5 transition" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <p>No specific sub-areas listed for {selectedCity.name} yet.</p>
                <button
                  onClick={() => handleCityNavigate(selectedCity)}
                  className="mt-2 text-indigo-600 hover:underline font-semibold"
                >
                  Explore all listings in {selectedCity.name} →
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
