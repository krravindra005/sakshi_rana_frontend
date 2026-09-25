import { apiClient, ApiResponse } from '../lib/api/client';
import { Country, Region, City, Area } from '../types/api';

export class LocationsService {
  private static countriesCache: Country[] | null = null;
  private static regionsCache: Map<string, Region[]> = new Map();
  private static citiesCache: Map<string, City[]> = new Map();
  private static areasCache: Map<string, Area[]> = new Map();

  /**
   * Clear locations cache
   */
  static clearCache(): void {
    this.countriesCache = null;
    this.regionsCache.clear();
    this.citiesCache.clear();
    this.areasCache.clear();
  }

  /**
   * Get all active countries from API V2
   */
  static async getCountries(forceRefresh = false): Promise<Country[]> {
    if (!forceRefresh && this.countriesCache !== null) {
      return this.countriesCache;
    }

    try {
      const response = await apiClient.get<ApiResponse<Country[]>>('/locations/countries', {
        forceRefresh,
        ttlMs: 300_000,
      });
      const data = response.data || [];
      this.countriesCache = data;
      return data;
    } catch {
      return this.countriesCache || [];
    }
  }

  /**
   * Get states/regions (filtered by countryId if provided) from API V2
   */
  static async getStatesByCountry(countryId?: string | number, forceRefresh = false): Promise<Region[]> {
    const cacheKey = countryId ? String(countryId) : 'all';
    if (!forceRefresh && this.regionsCache.has(cacheKey)) {
      return this.regionsCache.get(cacheKey)!;
    }

    try {
      const url = countryId ? `/locations/regions?country_id=${countryId}` : '/locations/regions';
      const response = await apiClient.get<ApiResponse<Region[]>>(url, {
        forceRefresh,
        ttlMs: 300_000,
      });
      const data = response.data || [];
      this.regionsCache.set(cacheKey, data);
      return data;
    } catch {
      return this.regionsCache.get(cacheKey) || [];
    }
  }

  /**
   * Get all active cities (or filtered by region/featured) from API V2
   */
  static async getCities(
    regionId?: string | number,
    featured?: boolean,
    countryId?: string | number,
    forceRefresh = false
  ): Promise<City[]> {
    const cacheKey = `${regionId || ''}_${featured ? 'feat' : ''}_${countryId || ''}`;
    if (!forceRefresh && this.citiesCache.has(cacheKey)) {
      return this.citiesCache.get(cacheKey)!;
    }

    try {
      let url = '/locations/cities';
      const params: string[] = [];
      if (regionId) params.push(`region_id=${regionId}`);
      if (countryId) params.push(`country_id=${countryId}`);
      if (featured) params.push(`featured=true`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response = await apiClient.get<ApiResponse<City[]>>(url, {
        forceRefresh,
        ttlMs: 300_000,
      });
      const data = response.data || [];
      this.citiesCache.set(cacheKey, data);
      return data;
    } catch {
      return this.citiesCache.get(cacheKey) || [];
    }
  }

  /**
   * Get city by its slug from API V2
   */
  static async getCityBySlug(slug: string): Promise<City | null> {
    if (!slug) return null;
    const lowerSlug = slug.toLowerCase();

    // 1. Search in any already cached city collections
    for (const cityList of Array.from(this.citiesCache.values())) {
      const match = cityList.find((c) => c.slug?.toLowerCase() === lowerSlug);
      if (match) return match;
    }

    // 2. Fetch all cities if not found in cache
    const cities = await this.getCities();
    const match = cities.find((c) => c.slug?.toLowerCase() === lowerSlug);
    return match || null;
  }

  /**
   * Get areas inside a specific city (or all active areas) from API V2
   */
  static async getAreasByCity(cityId?: string | number, forceRefresh = false): Promise<Area[]> {
    const cacheKey = cityId ? String(cityId) : 'all';
    if (!forceRefresh && this.areasCache.has(cacheKey)) {
      return this.areasCache.get(cacheKey)!;
    }

    try {
      const url = cityId ? `/locations/areas?city_id=${cityId}` : '/locations/areas';
      const response = await apiClient.get<ApiResponse<Area[]>>(url, {
        forceRefresh,
        ttlMs: 300_000,
      });
      const data = response.data || [];
      this.areasCache.set(cacheKey, data);
      return data;
    } catch {
      return this.areasCache.get(cacheKey) || [];
    }
  }
}
