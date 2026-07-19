import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from './RouterContext';
import { FilterOptions } from '../types/filter';
import { AdvancedSearchState } from '../types/advanced-search';
import { SearchService } from '../services/search.service';

interface AdvancedSearchContextType {
  isOpen: boolean;
  draftState: AdvancedSearchState;
  setDraftState: React.Dispatch<React.SetStateAction<AdvancedSearchState>>;
  openSearch: (initialState?: AdvancedSearchState) => void;
  closeSearch: () => void;
  applySearch: () => void;
  clearAllFilters: () => void;
  activeFiltersCount: number;
  resultCount: number;
  isCounting: boolean;
}

const AdvancedSearchContext = createContext<AdvancedSearchContextType | undefined>(undefined);

export const AdvancedSearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { route, navigateTo } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCounting, setIsCounting] = useState(false);
  const [resultCount, setResultCount] = useState<number>(0);
  
  // Local draft state inside the modal
  const [draftState, setDraftState] = useState<AdvancedSearchState>({});

  // Calculate the count of actual selected filtering criteria consistently (excluding keyword 'q')
  const getFiltersCount = (state: AdvancedSearchState): number => {
    let count = 0;
    // Count locations if they are selected
    if (state.country) count++;
    if (state.state) count++;
    if (state.city) count++;
    if (state.area) count++;
    
    // Count arrays of advanced filters
    const listFields: (keyof AdvancedSearchState)[] = [
      'nationality', 'ethnicity', 'bodyType', 'hairColor', 
      'services', 'intendedAudience', 'placeOfService'
    ];
    listFields.forEach(field => {
      const val = state[field];
      if (Array.isArray(val) && val.length > 0) {
        count += val.length;
      }
    });
    return count;
  };

  const activeFiltersCount = getFiltersCount(draftState);

  // Sync draft state with URL/router context when modal opens or route changes
  const syncWithUrl = () => {
    const params = route.searchParams;
    const cat = route.category || undefined;
    const city = route.city || undefined;

    setDraftState({
      category: cat,
      city: city,
      q: params.q || undefined,
      area: params.area || undefined,
      nationality: params.nationality ? params.nationality.split(',') : undefined,
      ethnicity: params.ethnicity ? params.ethnicity.split(',') : undefined,
      bodyType: params.bodyType ? params.bodyType.split(',') : undefined,
      hairColor: params.hairColor ? params.hairColor.split(',') : undefined,
      services: params.services ? params.services.split(',') : undefined,
      intendedAudience: params.intendedAudience ? params.intendedAudience.split(',') : undefined,
      placeOfService: params.placeOfService ? params.placeOfService.split(',') : undefined,
    });
  };

  const openSearch = (initialState?: AdvancedSearchState) => {
    if (initialState) {
      setDraftState(initialState);
    } else {
      syncWithUrl();
    }
    setIsOpen(true);
  };

  const closeSearch = () => {
    setIsOpen(false);
  };

  // Pre-fetch result counts on draftState changes (with a small debounce)
  useEffect(() => {
    if (!isOpen) return;

    setIsCounting(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const filters: FilterOptions = {
          category: draftState.category || undefined,
          city: draftState.city || undefined,
          area: draftState.area || undefined,
          nationality: draftState.nationality,
          ethnicity: draftState.ethnicity,
          bodyType: draftState.bodyType,
          hairColor: draftState.hairColor,
          services: draftState.services,
          intendedAudience: draftState.intendedAudience,
          placeOfService: draftState.placeOfService,
        };
        const count = await SearchService.getSearchResultCount(filters, draftState.q || '');
        setResultCount(count);
      } catch (err) {
        console.error('Error prefetching count:', err);
      } finally {
        setIsCounting(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [isOpen, JSON.stringify(draftState)]);

  const clearAllFilters = () => {
    setDraftState({
      category: undefined,
      city: undefined,
      q: undefined,
      country: undefined,
      state: undefined,
      area: undefined,
      nationality: undefined,
      ethnicity: undefined,
      bodyType: undefined,
      hairColor: undefined,
      services: undefined,
      intendedAudience: undefined,
      placeOfService: undefined,
    });
  };

  const applySearch = () => {
    const qParams: Record<string, string | string[]> = {};
    if (draftState.q) qParams.q = draftState.q;
    if (draftState.area) qParams.area = draftState.area;
    
    // Convert arrays back to comma-separated lists
    const arrayFields: (keyof AdvancedSearchState)[] = [
      'nationality', 'ethnicity', 'bodyType', 'hairColor', 
      'services', 'intendedAudience', 'placeOfService'
    ];
    arrayFields.forEach(field => {
      const val = draftState[field];
      if (Array.isArray(val) && val.length > 0) {
        qParams[field as string] = val.join(',');
      }
    });

    const categorySlug = draftState.category || 'call-girls';
    const citySlug = draftState.city || 'delhi';

    navigateTo(`/${categorySlug}/${citySlug}`, qParams);
    setIsOpen(false);
  };

  return (
    <AdvancedSearchContext.Provider
      value={{
        isOpen,
        draftState,
        setDraftState,
        openSearch,
        closeSearch,
        applySearch,
        clearAllFilters,
        activeFiltersCount,
        resultCount,
        isCounting,
      }}
    >
      {children}
    </AdvancedSearchContext.Provider>
  );
};

export const useAdvancedSearch = () => {
  const context = useContext(AdvancedSearchContext);
  if (!context) {
    throw new Error('useAdvancedSearch must be used within an AdvancedSearchProvider');
  }
  return context;
};
