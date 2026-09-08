import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAdvancedSearch } from '../../context/AdvancedSearchContext';
import { CategoriesService } from '../../services/categories.service';
import { LocationsService } from '../../services/locations.service';
import { Category, City } from '../../types/api';
import { Search, MapPin, Grid, Flame, Compass, SlidersHorizontal } from 'lucide-react';

export const HeroSearch: React.FC = () => {
  const { navigateTo } = useRouter();
  const { openSearch } = useAdvancedSearch();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    let mounted = true;
    CategoriesService.getAll().then((res) => { if (mounted) setCategories(res); });
    LocationsService.getCities().then((res) => { if (mounted) setCities(res); });
    return () => { mounted = false; };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams: Record<string, string> = {};
    if (keyword.trim()) queryParams.q = keyword.trim();
    
    // Determine route path
    const targetCategory = category || 'call-girls';
    const targetCity = city || 'delhi';
    
    navigateTo(`/${targetCategory}/${targetCity}`, queryParams);
  };

  const popularSearches = [
    { label: 'Deep Tissue', query: 'Deep Tissue' },
    { label: 'Dinner companion', query: 'VIP Dinner' },
    { label: 'Independent Russian', query: 'Russian' },
    { label: 'Discreet In-call', query: 'In-call' },
    { label: 'Bandra area', query: 'Bandra' }
  ];

  return (
    <div className="relative bg-slate-950 text-white overflow-hidden py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
      {/* Decorative premium background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Visual abstract grid decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      <div className="relative max-w-4xl mx-auto text-center z-10">
        
        {/* Anti-AI Slop Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700/50 rounded-full text-xs font-semibold text-amber-400 mb-6 font-mono tracking-wider">
          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          PREMIUM VERIFIED CLASSIFIEDS DIRECTORY
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-sans tracking-tight leading-tight text-white mb-6">
          Find Elite Companions & <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-indigo-200">Discreet Relaxations</span>
        </h1>
        
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
          Discover vetted independent escorts, masseuses, male companions, and casual adult encounters. Search by location, attributes, and private service options with complete privacy.
        </p>

        {/* Search faceting form */}
        <form 
          id="hero-search-form"
          onSubmit={handleSearch}
          className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2.5 items-stretch text-slate-800"
        >
          {/* Keyword search input */}
          <div className="flex-1 flex items-center relative border border-slate-100 rounded-xl bg-slate-50 py-1 px-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              id="hero-search-keyword"
              type="text"
              placeholder="What are you looking for? (Aria, Russian, Spa...)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onClick={() => openSearch({ q: keyword || undefined, category: category || undefined, city: city || undefined })}
              className="w-full pl-7 py-2.5 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800 cursor-pointer"
              readOnly
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-52 flex items-center relative border border-slate-100 rounded-xl bg-slate-50 py-1 px-3">
            <Grid className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <select
              id="hero-search-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-7 py-2.5 text-sm bg-transparent border-0 focus:outline-none appearance-none cursor-pointer text-slate-700"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
            <div className="absolute right-3 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-400 w-0 h-0" />
          </div>

          {/* City Selector */}
          <div className="w-full md:w-52 flex items-center relative border border-slate-100 rounded-xl bg-slate-50 py-1 px-3">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <select
              id="hero-search-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-7 py-2.5 text-sm bg-transparent border-0 focus:outline-none appearance-none cursor-pointer text-slate-700"
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <div className="absolute right-3 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-400 w-0 h-0" />
          </div>

          {/* Submit Search button & Advanced filter trigger */}
          <div className="flex gap-2 shrink-0">
            <button
              id="hero-search-submit"
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-3 px-5 sm:px-6 rounded-xl transition duration-200 shadow-md flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            <button
              id="hero-search-advanced"
              type="button"
              onClick={() => openSearch({ q: keyword || undefined, category: category || undefined, city: city || undefined })}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm py-3 px-4 rounded-xl transition duration-200 border border-slate-200/80 flex items-center justify-center gap-1.5"
              title="Advanced Filters"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span className="md:hidden lg:inline">Filters</span>
            </button>
          </div>
        </form>

        {/* Popular Searches */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Popular Searches:
          </span>
          {popularSearches.map((ps) => (
            <button
              key={ps.label}
              onClick={() => {
                setKeyword(ps.query);
                navigateTo('/category-city', { q: ps.query });
              }}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 py-1 px-2.5 rounded-lg border border-slate-800/80 transition"
            >
              {ps.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
