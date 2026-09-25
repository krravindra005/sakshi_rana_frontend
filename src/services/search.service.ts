import { Ad } from '../types/ad';
import { FilterOptions } from '../types/filter';
import { apiClient, ApiResponse, ApiPaginatedResponse } from '../lib/api/client';
import { mapApiAdToFrontendAd } from '../lib/mappers';
import { CategoriesService } from './categories.service';
import { LocationsService } from './locations.service';
import { FiltersService } from './filters.service';

export class SearchService {
  static async getCategories() {
    return CategoriesService.getAll();
  }

  static async getCountries() {
    return LocationsService.getCountries();
  }

  static async getRegions(countryId: string | number) {
    return LocationsService.getStatesByCountry(countryId);
  }

  static async getCities(regionId?: string | number) {
    return LocationsService.getCities(regionId);
  }

  static async getAreas(cityId: string | number) {
    return LocationsService.getAreasByCity(cityId);
  }

  static async getFilters(categorySlug?: string) {
    const filters = await FiltersService.getByCategory(categorySlug);
    return filters.map((f) => f.key);
  }

  static async getFilterOptions(filterId: string | number) {
    return FiltersService.getOptions(filterId);
  }

  private static buildSearchQuery(filters: FilterOptions, searchTerm: string = '', sortBy: string = 'recommended'): string {
    const params = new URLSearchParams();

    if (searchTerm) {
      params.append('query', searchTerm);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.city) {
      params.append('city', filters.city);
    }
    if (filters.area) {
      params.append('area', filters.area);
    }
    if (filters.is_verified) {
      params.append('is_verified', 'true');
    }
    if (filters.is_featured) {
      params.append('is_featured', 'true');
    }
    if (sortBy) {
      params.append('sort', sortBy);
    }

    // Dynamic Filter attributes mapping
    Object.entries(filters).forEach(([key, values]) => {
      if (['category', 'country', 'state', 'city', 'area', 'is_verified', 'is_featured'].includes(key)) {
        return;
      }
      if (Array.isArray(values)) {
        values.forEach((v) => {
          if (v) params.append(`filters[${key}][]`, String(v));
        });
      } else if (values !== undefined && values !== null && values !== '') {
        params.append(`filters[${key}][]`, String(values));
      }
    });

    return params.toString();
  }

  /**
   * Get search result count from GET /api/v2/search/ads/count
   */
  static async getSearchResultCount(filters: FilterOptions, searchTerm: string = ''): Promise<number> {
    try {
      const queryStr = this.buildSearchQuery(filters, searchTerm);
      const response = await apiClient.get<ApiResponse<{ count: number }>>(`/search/ads/count?${queryStr}`);
      return response.data?.count ?? 0;
    } catch {
      return 0;
    }
  }

  static async searchListings(
    filters: FilterOptions,
    searchTerm: string = '',
    sortBy: 'recommended' | 'latest' | 'most_viewed' = 'recommended'
  ): Promise<Ad[]> {
    return this.search(filters, searchTerm, sortBy);
  }

  /**
   * Search advertisements via GET /api/v2/search/ads
   */
  static async search(
    filters: FilterOptions,
    searchTerm: string = '',
    sortBy: 'recommended' | 'latest' | 'most_viewed' = 'recommended'
  ): Promise<Ad[]> {
    try {
      const queryStr = this.buildSearchQuery(filters, searchTerm, sortBy);
      const response = await apiClient.get<ApiPaginatedResponse<any>>(`/search/ads?${queryStr}`);
      const items = response.data || [];
      return items.map(mapApiAdToFrontendAd);
    } catch (err) {
      console.error('Error searching advertisements:', err);
      return [];
    }
  }
}
