import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAdvancedSearch } from '../../context/AdvancedSearchContext';
import { SearchService } from '../../services/search.service';
import { CategoriesService } from '../../services/categories.service';
import { LocationsService } from '../../services/locations.service';
import { mockFilterConfig } from '../../data/mock-filters';
import { FilterOptions } from '../../types/filter';
import { 
  X, 
  MapPin, 
  SlidersHorizontal, 
  Sparkles, 
  Briefcase, 
  UserCheck, 
  HelpCircle,
  RefreshCw,
  Globe,
  UserCircle,
  Activity,
  Palette,
  Users
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
  const [activeFilterFields, setActiveFilterFields] = useState<string[]>([]);

  // 1. Load active filter fields dynamically based on current category select
  useEffect(() => {
    const loadFields = async () => {
      const fields = await SearchService.getFilters(activeFilters.category);
      setActiveFilterFields(fields);
    };
    loadFields();
  }, [activeFilters.category]);

  // Handle multi-select checkboxes
  const handleCheckboxChange = (
    field: keyof Omit<FilterOptions, 'category' | 'country' | 'state' | 'city' | 'area'>,
    value: string
  ) => {
    const currentValues = (activeFilters[field] as string[]) || [];
    let updatedValues: string[];

    if (currentValues.includes(value)) {
      updatedValues = currentValues.filter((v) => v !== value);
    } else {
      updatedValues = [...currentValues, value];
    }

    onFilterChange({
      ...activeFilters,
      [field]: updatedValues,
    });
  };

  const handleSingleSelectChange = (field: keyof FilterOptions, value: string) => {
    onFilterChange({
      ...activeFilters,
      [field]: value || undefined,
    });
  };

  // Fetch categories, cities, and areas dynamically from API
  const [categories, setCategories] = useState<any[]>([]);
  const [availableAreas, setAvailableAreas] = useState<any[]>([]);
  const [currentCityName, setCurrentCityName] = useState<string>('');

  useEffect(() => {
    CategoriesService.getAll().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (route.city) {
      LocationsService.getCityBySlug(route.city).then((c) => {
        if (c) {
          setCurrentCityName(c.name);
          LocationsService.getAreasByCity(c.id).then(setAvailableAreas).catch(() => {});
        }
      });
    }
  }, [route.city]);

  return (
    <div className="space-y-6">
      
      {/* Filters Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-900">
          <SlidersHorizontal className="w-4.5 h-4.5 text-slate-500" />
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
          <Sparkles className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
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
          value={activeFilters.category || ''}
          onChange={(e) => handleSingleSelectChange('category', e.target.value)}
          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
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
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none"
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

      {/* FILTER: NATIONALITY (Multi-select Checkboxes) */}
      {activeFilterFields.includes('nationality') && (
        <div className="space-y-2.5 border-t border-slate-50 pt-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Nationality
          </label>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-2">
            {mockFilterConfig.nationalities.map((item) => (
              <label key={item.value} className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
                <input
                  id={`filter-nationality-${item.value}`}
                  type="checkbox"
                  checked={(activeFilters.nationality || []).includes(item.value)}
                  onChange={() => handleCheckboxChange('nationality', item.value)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* FILTER: ETHNICITY */}
      {activeFilterFields.includes('ethnicity') && (
        <div className="space-y-2.5 border-t border-slate-50 pt-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Ethnicity
          </label>
          <div className="space-y-1.5">
            {mockFilterConfig.ethnicities.map((item) => (
              <label key={item.value} className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
                <input
                  id={`filter-ethnicity-${item.value}`}
                  type="checkbox"
                  checked={(activeFilters.ethnicity || []).includes(item.value)}
                  onChange={() => handleCheckboxChange('ethnicity', item.value)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* FILTER: BODY TYPE */}
      {activeFilterFields.includes('bodyType') && (
        <div className="space-y-2.5 border-t border-slate-50 pt-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Body Build
          </label>
          <div className="space-y-1.5">
            {mockFilterConfig.bodyTypes.map((item) => (
              <label key={item.value} className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
                <input
                  id={`filter-body-${item.value}`}
                  type="checkbox"
                  checked={(activeFilters.bodyType || []).includes(item.value)}
                  onChange={() => handleCheckboxChange('bodyType', item.value)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* FILTER: SERVICES (Discreet Checkboxes) */}
      {activeFilterFields.includes('services') && (
        <div className="space-y-2.5 border-t border-slate-50 pt-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Services Offered
          </label>
          <div className="max-h-44 overflow-y-auto space-y-1.5 pr-2">
            {mockFilterConfig.services.map((item) => (
              <label key={item.value} className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
                <input
                  id={`filter-service-${item.value}`}
                  type="checkbox"
                  checked={(activeFilters.services || []).includes(item.value)}
                  onChange={() => handleCheckboxChange('services', item.value)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span className="truncate">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* FILTER: HAIR COLOR */}
      {activeFilterFields.includes('hairColor') && (
        <div className="space-y-2.5 border-t border-slate-50 pt-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Hair Color
          </label>
          <div className="space-y-1.5">
            {mockFilterConfig.hairColors.map((item) => (
              <label key={item.value} className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
                <input
                  id={`filter-hair-${item.value}`}
                  type="checkbox"
                  checked={(activeFilters.hairColor || []).includes(item.value)}
                  onChange={() => handleCheckboxChange('hairColor', item.value)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* FILTER: INTENDED AUDIENCE */}
      {activeFilterFields.includes('intendedAudience') && (
        <div className="space-y-2.5 border-t border-slate-50 pt-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Intended Audience
          </label>
          <div className="space-y-1.5">
            {mockFilterConfig.intendedAudiences.map((item) => (
              <label key={item.value} className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
                <input
                  id={`filter-audience-${item.value}`}
                  type="checkbox"
                  checked={(activeFilters.intendedAudience || []).includes(item.value)}
                  onChange={() => handleCheckboxChange('intendedAudience', item.value)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* FILTER: PLACE OF SERVICE */}
      {activeFilterFields.includes('placeOfService') && (
        <div className="space-y-2.5 border-t border-slate-50 pt-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Place of Service
          </label>
          <div className="space-y-1.5">
            {mockFilterConfig.placesOfService.map((item) => (
              <label key={item.value} className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
                <input
                  id={`filter-place-${item.value}`}
                  type="checkbox"
                  checked={(activeFilters.placeOfService || []).includes(item.value)}
                  onChange={() => handleCheckboxChange('placeOfService', item.value)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span className="truncate">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
