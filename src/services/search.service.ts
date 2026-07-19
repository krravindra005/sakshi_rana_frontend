import { Ad } from '../types/ad';
import { FilterOptions } from '../types/filter';
import { AdsService } from './ads.service';
import { mockCategories } from '../data/mock-categories';
import { mockCountries, mockStates, mockCities, mockAreas } from '../data/mock-locations';
import { mockFilterConfig } from '../data/mock-filters';
import { Category } from '../types/category';
import { Country, LocationState, City, Area } from '../types/location';

export class SearchService {
  /**
   * Mock service methods for advanced filters (Laravel integration ready)
   */
  static async getCategories(): Promise<Category[]> {
    return Promise.resolve([...mockCategories]);
  }

  static async getCountries(): Promise<Country[]> {
    return Promise.resolve([...mockCountries]);
  }

  static async getRegions(countryId: string): Promise<LocationState[]> {
    return Promise.resolve(mockStates.filter((s) => s.countryId === countryId));
  }

  static async getCities(regionId: string): Promise<City[]> {
    const region = mockStates.find((s) => s.id === regionId);
    if (!region) return Promise.resolve([]);
    return Promise.resolve(mockCities.filter((c) => c.state.toLowerCase() === region.name.toLowerCase()));
  }

  static async getAreas(cityId: string): Promise<Area[]> {
    return Promise.resolve(mockAreas.filter((a) => a.cityId === cityId));
  }

  static async getFilters(categorySlug?: string): Promise<string[]> {
    const defaultFilters = [
      'ethnicity',
      'nationality',
      'bodyType',
      'hairColor',
      'services',
      'intendedAudience',
      'placeOfService'
    ];
    if (!categorySlug) return Promise.resolve(defaultFilters);
    
    const mapping: Record<string, string[]> = {
      'call-girls': ['ethnicity', 'nationality', 'bodyType', 'hairColor', 'services', 'intendedAudience', 'placeOfService'],
      'massage': ['nationality', 'services', 'intendedAudience', 'placeOfService'],
      'male-escorts': ['ethnicity', 'nationality', 'bodyType', 'hairColor', 'services', 'intendedAudience', 'placeOfService'],
      'transsexual': ['ethnicity', 'nationality', 'bodyType', 'hairColor', 'services', 'intendedAudience', 'placeOfService'],
      'adult-meetings': ['ethnicity', 'nationality', 'bodyType', 'hairColor', 'intendedAudience', 'placeOfService']
    };
    
    return Promise.resolve(mapping[categorySlug.toLowerCase()] || defaultFilters);
  }

  static async getFilterOptions(filterId: string): Promise<{ label: string; value: string }[]> {
    const filterOptionsMap: Record<string, { label: string; value: string }[]> = {
      ethnicity: mockFilterConfig.ethnicities,
      nationality: mockFilterConfig.nationalities,
      bodyType: mockFilterConfig.bodyTypes,
      hairColor: mockFilterConfig.hairColors,
      services: mockFilterConfig.services,
      intendedAudience: mockFilterConfig.intendedAudiences,
      placeOfService: mockFilterConfig.placesOfService
    };
    return Promise.resolve(filterOptionsMap[filterId] || []);
  }

  static async getSearchResultCount(filters: FilterOptions, searchTerm: string = ''): Promise<number> {
    const results = await this.search(filters, searchTerm);
    return results.length;
  }

  static async searchListings(
    filters: FilterOptions,
    searchTerm: string = '',
    sortBy: 'recommended' | 'latest' | 'most_viewed' = 'recommended'
  ): Promise<Ad[]> {
    return this.search(filters, searchTerm, sortBy);
  }
  /**
   * Search and filter advertisements based on user filters, search term, and sorting criteria
   */
  static async search(
    filters: FilterOptions,
    searchTerm: string = '',
    sortBy: 'recommended' | 'latest' | 'most_viewed' = 'recommended'
  ): Promise<Ad[]> {
    const allAds = await AdsService.getAll();
    
    let results = allAds.filter((ad) => {
      // 1. Category Filter
      if (filters.category && ad.categorySlug.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }

      // 2. City Filter
      if (filters.city && ad.citySlug.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }

      // 3. Area Filter (e.g. connaught-place, juhu, bandra)
      if (filters.area && ad.areaSlug?.toLowerCase() !== filters.area.toLowerCase()) {
        return false;
      }

      // 4. Search Term Filter (checks title, profileName, description, services, city name, area name)
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = ad.title.toLowerCase().includes(query);
        const matchesDesc = ad.description.toLowerCase().includes(query);
        const matchesName = ad.profileName.toLowerCase().includes(query);
        const matchesService = ad.services.some((s) => s.toLowerCase().includes(query));
        const matchesCity = ad.citySlug.toLowerCase().includes(query);
        
        if (!matchesTitle && !matchesDesc && !matchesName && !matchesService && !matchesCity) {
          return false;
        }
      }

      // 5. Nationality Filter (Multi-select)
      if (filters.nationality && filters.nationality.length > 0) {
        if (!filters.nationality.includes(ad.attributes.nationality)) {
          return false;
        }
      }

      // 6. Ethnicity Filter (Multi-select)
      if (filters.ethnicity && filters.ethnicity.length > 0) {
        if (!filters.ethnicity.includes(ad.attributes.ethnicity)) {
          return false;
        }
      }

      // 7. Body Type Filter (Multi-select)
      if (filters.bodyType && filters.bodyType.length > 0) {
        if (!filters.bodyType.includes(ad.attributes.bodyType)) {
          return false;
        }
      }

      // 8. Hair Color Filter (Multi-select)
      if (filters.hairColor && filters.hairColor.length > 0) {
        if (!filters.hairColor.includes(ad.attributes.hairColor)) {
          return false;
        }
      }

      // 9. Intended Audience Filter (Multi-select)
      if (filters.intendedAudience && filters.intendedAudience.length > 0) {
        if (!filters.intendedAudience.includes(ad.attributes.intendedAudience)) {
          return false;
        }
      }

      // 10. Place of Service Filter (Multi-select - checks if overlaps with array)
      if (filters.placeOfService && filters.placeOfService.length > 0) {
        const hasMatch = ad.attributes.placeOfService.some((p) => 
          filters.placeOfService!.includes(p)
        );
        if (!hasMatch) {
          return false;
        }
      }

      // 11. Services Filter (Multi-select - checks if overlaps with array)
      if (filters.services && filters.services.length > 0) {
        const hasMatch = ad.services.some((s) => 
          filters.services!.includes(s)
        );
        if (!hasMatch) {
          return false;
        }
      }

      return true;
    });

    // Apply Sorting
    if (sortBy === 'latest') {
      // For mock purposes, user-created ads (higher ids or newer ones) go first
      results = results.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortBy === 'most_viewed') {
      results = results.sort((a, b) => b.viewsCount - a.viewsCount);
    } else {
      // 'recommended' - Featured items first, then by viewsCount
      results = results.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.viewsCount - a.viewsCount;
      });
    }

    return results;
  }
}
