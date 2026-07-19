import React, { useEffect, useState } from 'react';
import { useAdvancedSearch } from '../../context/AdvancedSearchContext';
import { SearchService } from '../../services/search.service';
import { mockFilterConfig } from '../../data/mock-filters';
import { KeywordSearch } from './KeywordSearch';
import { CategorySelect } from './CategorySelect';
import { LocationFilters } from './LocationFilters';
import { FilterAccordion } from './FilterAccordion';
import { SearchableMultiSelect } from './SearchableMultiSelect';
import { SelectedFilterChips } from './SelectedFilterChips';
import { AdvancedSearchActions } from './AdvancedSearchActions';
import { 
  X, 
  Search, 
  Globe, 
  UserCircle, 
  Activity, 
  Palette, 
  Briefcase, 
  Users, 
  MapPin,
  SlidersHorizontal
} from 'lucide-react';

export const AdvancedSearchModal: React.FC = () => {
  const { isOpen, closeSearch, draftState, setDraftState } = useAdvancedSearch();
  const [activeFilterFields, setActiveFilterFields] = useState<string[]>([]);

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
      const fields = await SearchService.getFilters(draftState.category);
      setActiveFilterFields(fields);
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

  const handleFilterArrayChange = (field: keyof typeof draftState, values: string[]) => {
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
                Find premium independent listings that match your specific lifestyle preferences
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

          {/* Collapsible Advanced Attribute Panels */}
          {activeFilterFields.length > 0 && (
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-800">Advanced Physical Attributes & Services</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                
                {/* NATIONALITY */}
                {activeFilterFields.includes('nationality') && (
                  <FilterAccordion
                    id="nationality"
                    title="Nationality"
                    icon={<Globe className="w-4.5 h-4.5" />}
                    summary={getSummary(draftState.nationality, mockFilterConfig.nationalities)}
                    count={draftState.nationality?.length || 0}
                  >
                    <SearchableMultiSelect
                      id="nationality"
                      options={mockFilterConfig.nationalities}
                      selectedValues={draftState.nationality || []}
                      onChange={(vals) => handleFilterArrayChange('nationality', vals)}
                      isSearchable={true}
                      searchPlaceholder="Search nationalities..."
                      layout="grid"
                    />
                  </FilterAccordion>
                )}

                {/* ETHNICITY */}
                {activeFilterFields.includes('ethnicity') && (
                  <FilterAccordion
                    id="ethnicity"
                    title="Ethnicity"
                    icon={<UserCircle className="w-4.5 h-4.5" />}
                    summary={getSummary(draftState.ethnicity, mockFilterConfig.ethnicities)}
                    count={draftState.ethnicity?.length || 0}
                  >
                    <SearchableMultiSelect
                      id="ethnicity"
                      options={mockFilterConfig.ethnicities}
                      selectedValues={draftState.ethnicity || []}
                      onChange={(vals) => handleFilterArrayChange('ethnicity', vals)}
                      layout="chips"
                    />
                  </FilterAccordion>
                )}

                {/* BODY BUILD */}
                {activeFilterFields.includes('bodyType') && (
                  <FilterAccordion
                    id="bodyType"
                    title="Body Build / Type"
                    icon={<Activity className="w-4.5 h-4.5" />}
                    summary={getSummary(draftState.bodyType, mockFilterConfig.bodyTypes)}
                    count={draftState.bodyType?.length || 0}
                  >
                    <SearchableMultiSelect
                      id="bodyType"
                      options={mockFilterConfig.bodyTypes}
                      selectedValues={draftState.bodyType || []}
                      onChange={(vals) => handleFilterArrayChange('bodyType', vals)}
                      layout="chips"
                    />
                  </FilterAccordion>
                )}

                {/* HAIR COLOR */}
                {activeFilterFields.includes('hairColor') && (
                  <FilterAccordion
                    id="hairColor"
                    title="Hair Color"
                    icon={<Palette className="w-4.5 h-4.5" />}
                    summary={getSummary(draftState.hairColor, mockFilterConfig.hairColors)}
                    count={draftState.hairColor?.length || 0}
                  >
                    <SearchableMultiSelect
                      id="hairColor"
                      options={mockFilterConfig.hairColors}
                      selectedValues={draftState.hairColor || []}
                      onChange={(vals) => handleFilterArrayChange('hairColor', vals)}
                      layout="chips"
                    />
                  </FilterAccordion>
                )}

                {/* SERVICES OFFERED */}
                {activeFilterFields.includes('services') && (
                  <FilterAccordion
                    id="services"
                    title="Services Offered"
                    icon={<Briefcase className="w-4.5 h-4.5" />}
                    summary={getSummary(draftState.services, mockFilterConfig.services)}
                    count={draftState.services?.length || 0}
                  >
                    <SearchableMultiSelect
                      id="services"
                      options={mockFilterConfig.services}
                      selectedValues={draftState.services || []}
                      onChange={(vals) => handleFilterArrayChange('services', vals)}
                      isSearchable={true}
                      searchPlaceholder="Search private service options..."
                      layout="grid"
                    />
                  </FilterAccordion>
                )}

                {/* INTENDED AUDIENCE */}
                {activeFilterFields.includes('intendedAudience') && (
                  <FilterAccordion
                    id="intendedAudience"
                    title="Intended Audience"
                    icon={<Users className="w-4.5 h-4.5" />}
                    summary={getSummary(draftState.intendedAudience, mockFilterConfig.intendedAudiences)}
                    count={draftState.intendedAudience?.length || 0}
                  >
                    <SearchableMultiSelect
                      id="intendedAudience"
                      options={mockFilterConfig.intendedAudiences}
                      selectedValues={draftState.intendedAudience || []}
                      onChange={(vals) => handleFilterArrayChange('intendedAudience', vals)}
                      layout="chips"
                    />
                  </FilterAccordion>
                )}

                {/* PLACE OF SERVICE */}
                {activeFilterFields.includes('placeOfService') && (
                  <FilterAccordion
                    id="placeOfService"
                    title="Place of Service"
                    icon={<MapPin className="w-4.5 h-4.5" />}
                    summary={getSummary(draftState.placeOfService, mockFilterConfig.placesOfService)}
                    count={draftState.placeOfService?.length || 0}
                  >
                    <SearchableMultiSelect
                      id="placeOfService"
                      options={mockFilterConfig.placesOfService}
                      selectedValues={draftState.placeOfService || []}
                      onChange={(vals) => handleFilterArrayChange('placeOfService', vals)}
                      layout="chips"
                    />
                  </FilterAccordion>
                )}

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
