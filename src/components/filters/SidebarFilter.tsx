import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAdvancedSearch } from '../../context/AdvancedSearchContext';
import { CategoriesService } from '../../services/categories.service';
import { LocationsService } from '../../services/locations.service';
import { FiltersService } from '../../services/filters.service';
import { Category, City, Area, DynamicFilter } from '../../types/api';
import { FilterOptions } from '../../types/filter';
import { 
  MapPin, 
  SlidersHorizontal, 
  Sparkles, 
  RefreshCw,
  ShieldCheck,
  Award,
  Globe
} from 'lucide-react';

interface SidebarFilterProps {
  activeFilters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearAll: () => void;
}

export const SidebarFilter: React.FC<SidebarFilterProps> = ({
  activeFilters,
  onFilterChange,
  onClearAll,
}) => {
  const { route } = useRouter();
  const { openSearch } = useAdvancedSearch();

  // State populated completely from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [availableAreas, setAvailableAreas] = useState<Area[]>([]);
  const [currentCityName, setCurrentCityName] = useState<string>('');
  const [dynamicFilters, setDynamicFilters] = useState<DynamicFilter[]>([]);

  // 1. Fetch Categories and Cities from API
  useEffect(() => {
    CategoriesService.getAll().then(setCategories).catch(() => {});
    LocationsService.getCities().then(setCities).catch(() => {});
  }, []);

  // 2. Fetch Areas dynamically when city changes
  useEffect(() => {
    const targetCitySlug = activeFilters.city || route.city;
    if (targetCitySlug) {
      LocationsService.getCityBySlug(targetCitySlug).then((c) => {
        if (c) {
          setCurrentCityName(c.name);
          LocationsService.getAreasByCity(c.id).then(setAvailableAreas).catch(() => {});
        } else {
          setCurrentCityName(targetCitySlug);
          setAvailableAreas([]);
        }
      });
    } else {
      setCurrentCityName('');
      setAvailableAreas([]);
    }
  }, [activeFilters.city, route.city]);

  // 3. Load dynamic filters for current category from API
  useEffect(() => {
    const categorySlug = activeFilters.category || route.category;
    if (categorySlug) {
      FiltersService.getByCategory(categorySlug).then((filters) => {
        setDynamicFilters(filters);
      }).catch(() => {
        setDynamicFilters([]);
      });
    } else {
      setDynamicFilters([]);
    }
  }, [activeFilters.category, route.category]);

  const handleSingleSelectChange = (field: string, value: string) => {
    onFilterChange({
      ...activeFilters,
      [field]: value || undefined,
    });
  };

  const handleBooleanToggle = (field: 'is_verified' | 'is_featured') => {
    onFilterChange({
      ...activeFilters,
      [field]: activeFilters[field] ? undefined : true,
    });
  };

  const handleDynamicCheckboxChange = (filterKey: string, optionValue: string) => {
    const currentValues = (activeFilters[filterKey] as string[]) || [];
    let updatedValues: string[];

    if (currentValues.includes(optionValue)) {
      updatedValues = currentValues.filter((v) => v !== optionValue);
    } else {
      updatedValues = [...currentValues, optionValue];
    }

    onFilterChange({
      ...activeFilters,
      [filterKey]: updatedValues.length > 0 ? updatedValues : undefined,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Filters Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-900">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <h2 className="text-base font-bold tracking-tight">Search Filters</h2>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 transition"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Advanced Search Promo Card */}
      <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100/80 flex flex-col gap-2.5 shadow-sm">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-indigo-950">Try Advanced Filters</h4>
            <p className="text-[10px] text-indigo-700 leading-tight">
              Filter by specific area, physical attributes, and private service checkboxes.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => openSearch()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] py-2 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>Open Advanced Search</span>
        </button>
      </div>

      {/* FILTER: CATEGORY */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
          Category Classified
        </label>
        <select
          id="filter-category"
          value={activeFilters.category || route.category || ''}
          onChange={(e) => handleSingleSelectChange('category', e.target.value)}
          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* FILTER: CITY */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          City
        </label>
        <select
          id="filter-city"
          value={activeFilters.city || route.city || ''}
          onChange={(e) => handleSingleSelectChange('city', e.target.value)}
          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition cursor-pointer"
        >
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city.id} value={city.slug}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {/* FILTER: AREA (Within Current City) */}
      {availableAreas.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            Specific Area in {currentCityName || 'City'}
          </label>
          <select
            id="filter-area"
            value={activeFilters.area || ''}
            onChange={(e) => handleSingleSelectChange('area', e.target.value)}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="">All Areas</option>
            {availableAreas.map((area) => (
              <option key={area.id} value={area.slug}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* FILTER: QUALITY & TRUST BADGES */}
      <div className="space-y-2.5 border-t border-slate-100 pt-4">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
          Listing Trust & Status
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 cursor-pointer">
            <input
              type="checkbox"
              checked={!!activeFilters.is_verified}
              onChange={() => handleBooleanToggle('is_verified')}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
            />
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Verified Profiles Only
            </span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 cursor-pointer">
            <input
              type="checkbox"
              checked={!!activeFilters.is_featured}
              onChange={() => handleBooleanToggle('is_featured')}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
            />
            <span className="flex items-center gap-1 font-medium">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Featured Listings Only
            </span>
          </label>
        </div>
      </div>

      {/* DYNAMIC CATEGORY FILTERS (100% FROM API) */}
      {dynamicFilters.map((filter) => {
        if (!filter.options || filter.options.length === 0) return null;

        if (filter.type === 'single_select') {
          return (
            <div key={filter.id} className="space-y-2 border-t border-slate-100 pt-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                {filter.label}
              </label>
              <select
                value={activeFilters[filter.key] || ''}
                onChange={(e) => handleSingleSelectChange(filter.key, e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="">All {filter.label}</option>
                {filter.options.map((opt) => (
                  <option key={opt.id} value={opt.slug || opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return (
          <div key={filter.id} className="space-y-2.5 border-t border-slate-100 pt-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              {filter.label}
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2 scrollbar-thin">
              {filter.options.map((opt) => {
                const optVal = opt.slug || opt.value;
                const isChecked = ((activeFilters[filter.key] as string[]) || []).includes(optVal);

                return (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleDynamicCheckboxChange(filter.key, optVal)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                    />
                    <span className="truncate">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

    </div>
  );
};
