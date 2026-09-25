import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAdvancedSearch } from '../../context/AdvancedSearchContext';
import { SearchService } from '../../services/search.service';
import { CategoriesService } from '../../services/categories.service';
import { LocationsService } from '../../services/locations.service';
import { Ad } from '../../types/ad';
import { FilterOptions } from '../../types/filter';
import { ListingCard } from './ListingCard';
import { SidebarFilter } from '../filters/SidebarFilter';
import { ActiveChips } from '../filters/ActiveChips';
import { FilterDrawer } from '../filters/FilterDrawer';
import { 
  Grid, 
  List, 
  SlidersHorizontal, 
  Search, 
  AlertCircle, 
  ChevronRight, 
  Home, 
  Clock, 
  Sparkles,
  Sliders
} from 'lucide-react';

interface ListingGridProps {
  categorySlug?: string;
  citySlug?: string;
}

export const ListingGrid: React.FC<ListingGridProps> = ({ categorySlug, citySlug }) => {
  const { route, setQueryParams, navigateTo } = useRouter();
  const { openSearch } = useAdvancedSearch();
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recommended' | 'latest' | 'most_viewed'>('recommended');
  const [categoryName, setCategoryName] = useState('');
  const [cityName, setCityName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const adsPerPage = 6;

  // Active filter state, synchronized with route URL query parameters
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});

  // 1. Sync local filters state with URL query search parameters on load
  useEffect(() => {
    const filters: FilterOptions = {
      category: categorySlug || route.searchParams.category || undefined,
      city: citySlug || route.searchParams.city || undefined,
      area: route.searchParams.area || undefined,
      is_verified: route.searchParams.is_verified === 'true' ? true : undefined,
      is_featured: route.searchParams.is_featured === 'true' ? true : undefined,
    };

    // Include any custom query parameters
    Object.entries(route.searchParams).forEach(([key, val]) => {
      if (!['category', 'city', 'area', 'q', 'sort', 'page', 'is_verified', 'is_featured'].includes(key) && val) {
        filters[key] = typeof val === 'string' && val.includes(',') ? val.split(',') : val;
      }
    });

    setActiveFilters(filters);
    setCurrentPage(1);
  }, [categorySlug, citySlug, JSON.stringify(route.searchParams)]);

  // 2. Fetch category and city names for breadcrumbs and headings
  useEffect(() => {
    const fetchMeta = async () => {
      if (categorySlug) {
        const cat = await CategoriesService.getBySlug(categorySlug);
        setCategoryName(cat ? cat.name : categorySlug.replace(/-/g, ' '));
        setCategoryDesc(cat?.description || '');
      } else {
        setCategoryName('All Categories');
        setCategoryDesc('Explore all verified companion classified listings.');
      }

      if (citySlug) {
        const cityObj = await LocationsService.getCityBySlug(citySlug);
        setCityName(cityObj ? cityObj.name : citySlug);
      } else {
        setCityName('');
      }
    };
    fetchMeta();
  }, [categorySlug, citySlug]);

  // 3. Search and filter ads on filter/sort change
  useEffect(() => {
    const fetchFilteredAds = async () => {
      setLoading(true);
      try {
        const keyword = route.searchParams.q || '';
        const results = await SearchService.search(activeFilters, keyword, sortBy);
        setAds(results);
      } catch (err) {
        console.error('Error searching ads', err);
      } finally {
        // Slow down slightly for beautiful skeleton effect
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    };
    
    // Only search once activeFilters state is correctly aligned
    if (Object.keys(activeFilters).length > 0 || !categorySlug) {
      fetchFilteredAds();
    }
  }, [activeFilters, sortBy, route.searchParams.q]);

  // Handle active filter updates & synchronize with URL Query Params
  const handleFilterChange = (newFilters: FilterOptions) => {
    setActiveFilters(newFilters);
    
    // Create query parameter updates for URL sync
    const queryParamsUpdate: Record<string, string | string[] | null> = {
      area: newFilters.area || null,
      is_verified: newFilters.is_verified ? 'true' : null,
      is_featured: newFilters.is_featured ? 'true' : null,
    };

    // Serialize any dynamic filter fields
    Object.entries(newFilters).forEach(([key, val]) => {
      if (!['category', 'city', 'area', 'is_verified', 'is_featured'].includes(key)) {
        if (Array.isArray(val)) {
          queryParamsUpdate[key] = val.length > 0 ? val.join(',') : null;
        } else if (val) {
          queryParamsUpdate[key] = String(val);
        } else {
          queryParamsUpdate[key] = null;
        }
      }
    });

    setQueryParams(queryParamsUpdate);

    // If Category is changed in filter, navigate to the new category landing
    if (newFilters.category && newFilters.category !== categorySlug) {
      const targetCity = newFilters.city || citySlug;
      if (targetCity) {
        navigateTo(`/${newFilters.category}/${targetCity}`);
      } else {
        navigateTo(`/${newFilters.category}`);
      }
      return;
    }

    // If City is changed in filter
    if (newFilters.city && newFilters.city !== citySlug) {
      const targetCat = newFilters.category || categorySlug;
      if (targetCat) {
        navigateTo(`/${targetCat}/${newFilters.city}`);
      } else {
        navigateTo('/category-city', { city: newFilters.city });
      }
      return;
    }

    // If Category was cleared
    if (!newFilters.category && categorySlug) {
      if (citySlug) {
        navigateTo('/category-city', { city: citySlug });
      } else {
        navigateTo('/category-city');
      }
      return;
    }

    // If City was cleared
    if (!newFilters.city && citySlug) {
      if (categorySlug) {
        navigateTo(`/${categorySlug}`);
      } else {
        navigateTo('/category-city');
      }
      return;
    }
  };

  const handleRemoveFilter = (field: keyof FilterOptions, value: string) => {
    const currentVal = activeFilters[field];
    
    if (Array.isArray(currentVal)) {
      const updated = currentVal.filter((v) => v !== value);
      handleFilterChange({
        ...activeFilters,
        [field]: updated.length > 0 ? updated : undefined,
      });
    } else {
      handleFilterChange({
        ...activeFilters,
        [field]: undefined,
      });
    }
  };

  const handleClearAll = () => {
    const cleared: FilterOptions = {
      category: categorySlug || undefined,
      city: citySlug || undefined,
    };
    handleFilterChange(cleared);
  };

  // Pagination calculations
  const indexOfLastAd = currentPage * adsPerPage;
  const indexOfFirstAd = indexOfLastAd - adsPerPage;
  const currentAds = ads.slice(indexOfFirstAd, indexOfLastAd);
  const totalPages = Math.ceil(ads.length / adsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-6">
          <button onClick={() => navigateTo('/')} className="hover:text-slate-600 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <button 
            onClick={() => categorySlug ? navigateTo(`/${categorySlug}`) : navigateTo('/category-city')}
            className="hover:text-slate-600 capitalize text-slate-500"
          >
            {categoryName}
          </button>
          {citySlug && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-900 font-semibold capitalize">{cityName || citySlug}</span>
            </>
          )}
        </nav>

        {/* Dynamic Landing Banner */}
        <div className="mb-8 p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl text-white shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-full bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold font-mono text-amber-300 uppercase tracking-wider mb-3">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              {cityName ? `VERIFIED ${categoryName.toUpperCase()} IN ${cityName.toUpperCase()}` : `VERIFIED ${categoryName.toUpperCase()}`}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              {categoryName} {cityName ? `in ${cityName}` : ''}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {categoryDesc || (cityName ? `Explore verified profiles and companion services in ${cityName}.` : 'Explore verified companion profiles.')}
            </p>
          </div>
        </div>

        {/* FACETED WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden lg:block bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit sticky top-20">
            <SidebarFilter
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
            />
          </aside>

          {/* RESULTS COLUMN */}
          <main className="col-span-1 lg:col-span-3 space-y-6">
            
            {/* Filter toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Counts */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  {loading ? 'Searching...' : `${ads.length} advertisements found`}
                </span>
                {route.searchParams.q && (
                  <span className="text-xs text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    Query: "{route.searchParams.q}"
                  </span>
                )}
              </div>

              {/* View options, Sort & Mobile Filters button */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                {/* Mobile Filter Toggle */}
                <button
                  id="mobile-filter-drawer-trigger"
                  onClick={() => openSearch()}
                  className="lg:hidden flex items-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>

                {/* Desktop Advanced Search Trigger */}
                <button
                  id="desktop-advanced-search-trigger"
                  type="button"
                  onClick={() => openSearch()}
                  className="hidden lg:flex items-center gap-1.5 py-1.5 px-3 border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg transition"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Advanced Search</span>
                </button>

                {/* Sort selector */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span className="hidden sm:inline">Sort:</span>
                  <select
                    id="sort-select-dropdown"
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200/80 rounded-lg py-1.5 px-2.5 font-semibold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="latest">Latest</option>
                    <option value="most_viewed">Most Viewed</option>
                  </select>
                </div>

                {/* Grid/List layout toggle */}
                <div className="flex items-center border border-slate-200/80 rounded-lg p-0.5 bg-slate-50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Grid view"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    title="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Active chips list */}
            <ActiveChips
              activeFilters={activeFilters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAll}
            />

            {/* MAIN LISTINGS RESULTS STAGE */}
            {loading ? (
              /* LOADING SKELETON */
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6' : 'space-y-4'}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white border border-slate-100 rounded-2xl h-96 p-4 flex flex-col justify-between animate-pulse">
                    <div className="bg-slate-100 h-52 w-full rounded-xl" />
                    <div className="space-y-2 mt-4">
                      <div className="bg-slate-100 h-4 w-1/3 rounded" />
                      <div className="bg-slate-100 h-3 w-3/4 rounded" />
                      <div className="bg-slate-100 h-3 w-1/2 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : ads.length === 0 ? (
              /* EMPTY RESULTS */
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  We couldn't find any active listings matching your search selections{cityName ? ` in ${cityName}` : ''}. Try broadening your criteria or resetting filters.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleClearAll}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-5 rounded-xl shadow transition"
                  >
                    Reset Active Filters
                  </button>
                </div>
              </div>
            ) : (
              /* RESULTS GRID OR LIST */
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in duration-350' : 'space-y-4 animate-in fade-in duration-350'}>
                  {currentAds.map((ad) => (
                    <div key={ad.id} className={viewMode === 'list' ? 'bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row gap-5 items-stretch hover:shadow-md transition duration-300' : ''}>
                      {viewMode === 'list' ? (
                        <>
                          <div className="w-full md:w-56 h-48 bg-slate-50 rounded-xl overflow-hidden shrink-0 relative">
                            <img
                              src={ad.profileImage}
                              alt={ad.profileName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {ad.isVerified && (
                              <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-md">
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{categoryName}</span>
                                <span className="text-xs text-slate-400 font-mono">Views: {ad.viewsCount}</span>
                              </div>
                              <h3 onClick={() => navigateTo(`/ad/${ad.slug}`)} className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition cursor-pointer mt-1">{ad.profileName}</h3>
                              <p className="text-xs font-semibold text-slate-700 mt-0.5">{ad.title}</p>
                              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{ad.description}</p>
                            </div>
                            <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                              <span className="text-slate-400">Posted {ad.postedAt}</span>
                              <button onClick={() => navigateTo(`/ad/${ad.slug}`)} className="text-indigo-600 hover:underline font-bold">
                                View Full Profile &rarr;
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <ListingCard ad={ad} />
                      )}
                    </div>
                  ))}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 pt-6 border-t border-slate-100">
                    <button
                      onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="py-1.5 px-3 rounded-lg border border-slate-200/60 bg-white hover:bg-slate-50 text-xs font-semibold disabled:opacity-40 transition"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, idx) => (
                      <button
                        key={idx + 1}
                        onClick={() => handlePageChange(idx + 1)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${currentPage === idx + 1 ? 'bg-indigo-600 text-white shadow-sm' : 'border border-slate-200/60 bg-white hover:bg-slate-50 text-slate-700'}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="py-1.5 px-3 rounded-lg border border-slate-200/60 bg-white hover:bg-slate-50 text-xs font-semibold disabled:opacity-40 transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

          </main>
        </div>

        {/* MOBILE FILTER BOTTOM SHEET DRAWER */}
        <FilterDrawer
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAll}
          resultsCount={ads.length}
        />

      </div>
    </div>
  );
};
