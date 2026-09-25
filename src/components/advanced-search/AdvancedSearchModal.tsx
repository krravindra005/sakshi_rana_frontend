import React, { useEffect, useState } from 'react';
import { useAdvancedSearch } from '../../context/AdvancedSearchContext';
import { FiltersService } from '../../services/filters.service';
import { DynamicFilter } from '../../types/api';
import { KeywordSearch } from './KeywordSearch';
import { CategorySelect } from './CategorySelect';
import { LocationFilters } from './LocationFilters';
import { FilterAccordion } from './FilterAccordion';
import { SearchableMultiSelect } from './SearchableMultiSelect';
import { SelectedFilterChips } from './SelectedFilterChips';
import { AdvancedSearchActions } from './AdvancedSearchActions';
import { 
  X, 
  SlidersHorizontal,
  Layers
} from 'lucide-react';

export const AdvancedSearchModal: React.FC = () => {
  const { isOpen, closeSearch, draftState, setDraftState } = useAdvancedSearch();
  const [dynamicFilters, setDynamicFilters] = useState<DynamicFilter[]>([]);

  // 1. Prevent background page scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 2. Listen to Esc key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // 3. Dynamic filter fields loading based on category selection
  useEffect(() => {
    const loadFields = async () => {
      if (draftState.category) {
        try {
          const filters = await FiltersService.getByCategory(draftState.category);
          setDynamicFilters(filters);
        } catch {
          setDynamicFilters([]);
        }
      } else {
        setDynamicFilters([]);
      }
    };
    loadFields();
  }, [draftState.category]);

  if (!isOpen) return null;

  // Helpers to generate summaries for collapsed accordions
  const getSummary = (values: string[] | undefined, options: { label: string; value: string }[]) => {
    if (!values || values.length === 0) return '';
    return values
      .map((v) => options.find((o) => o.value === v)?.label || v)
      .join(', ');
  };

  const handleFilterArrayChange = (field: string, values: string[]) => {
    setDraftState((prev) => ({
      ...prev,
      [field]: values.length > 0 ? values : undefined,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      
      {/* Backdrop overlay Closer */}
      <div className="absolute inset-0 cursor-default" onClick={closeSearch} />

      {/* Responsive Content Container */}
      <div 
        id="advanced-search-modal-container"
        className="w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-4xl lg:max-w-5xl bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-250 z-10"
      >
        
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 py-4 px-5 sm:px-6 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight flex items-center gap-2">
                Advanced Search
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Find verified classified listings that match your specific preferences
              </p>
            </div>
          </div>
          
          <button
            onClick={closeSearch}
            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg border border-slate-100 transition"
            title="Close Advanced Search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filters Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-thin">
          
          {/* Primary & Category Search fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KeywordSearch />
            <CategorySelect />
          </div>

          {/* Hierarchical Location Dropdowns */}
          <LocationFilters />

          {/* Dynamic Category Attributes Panels from API */}
          {dynamicFilters.length > 0 && (
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-800">Category Attributes & Services</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {dynamicFilters.map((filter) => {
                  const options = (filter.options || []).map((opt) => ({
                    label: opt.label,
                    value: opt.slug || opt.value,
                  }));
                  const selectedValues = (draftState[filter.key] as string[]) || [];

                  return (
                    <FilterAccordion
                      key={filter.id}
                      id={filter.key}
                      title={filter.label}
                      icon={<Layers className="w-4.5 h-4.5" />}
                      summary={getSummary(selectedValues, options)}
                      count={selectedValues.length}
                    >
                      <SearchableMultiSelect
                        id={filter.key}
                        options={options}
                        selectedValues={selectedValues}
                        onChange={(vals) => handleFilterArrayChange(filter.key, vals)}
                        isSearchable={options.length > 6}
                        searchPlaceholder={`Search ${filter.label.toLowerCase()}...`}
                        layout={options.length > 8 ? 'grid' : 'chips'}
                      />
                    </FilterAccordion>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active drafted Filter chips list */}
          <SelectedFilterChips />

        </div>

        {/* Sticky Actions Footer bar */}
        <AdvancedSearchActions />

      </div>
    </div>
  );
};
