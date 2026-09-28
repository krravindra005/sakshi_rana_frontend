import { apiClient, ApiResponse } from '../lib/api/client';
import { Country, Region, City, Area } from '../types/api';

const DEFAULT_INDIAN_CITIES: City[] = [
  { id: 1, uuid: 'city-delhi', region_id: 1, name: 'Delhi', slug: 'delhi', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=600', is_featured: true, active_ads_count: 45, ads_count: 45, is_active: true },
  { id: 2, uuid: 'city-mumbai', region_id: 2, name: 'Mumbai', slug: 'mumbai', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=600', is_featured: true, active_ads_count: 52, ads_count: 52, is_active: true },
  { id: 3, uuid: 'city-pune', region_id: 2, name: 'Pune', slug: 'pune', image: 'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?auto=format&fit=crop&q=80&w=600', is_featured: true, active_ads_count: 34, ads_count: 34, is_active: true },
  { id: 4, uuid: 'city-hyderabad', region_id: 3, name: 'Hyderabad', slug: 'hyderabad', image: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&q=80&w=600', is_featured: true, active_ads_count: 29, ads_count: 29, is_active: true },
  { id: 5, uuid: 'city-bengaluru', region_id: 4, name: 'Bengaluru', slug: 'bengaluru', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80&w=600', is_featured: true, active_ads_count: 48, ads_count: 48, is_active: true },
  { id: 6, uuid: 'city-chennai', region_id: 5, name: 'Chennai', slug: 'chennai', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=600', is_featured: true, active_ads_count: 26, ads_count: 26, is_active: true },
  { id: 7, uuid: 'city-kolkata', region_id: 6, name: 'Kolkata', slug: 'kolkata', image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&q=80&w=600', is_featured: true, active_ads_count: 31, ads_count: 31, is_active: true },
  { id: 8, uuid: 'city-ahmedabad', region_id: 7, name: 'Ahmedabad', slug: 'ahmedabad', image: 'https://images.unsplash.com/photo-1609949279531-cf48d64bed89?auto=format&fit=crop&q=80&w=600', is_featured: true, active_ads_count: 22, ads_count: 22, is_active: true },
  { id: 9, uuid: 'city-jaipur', region_id: 8, name: 'Jaipur', slug: 'jaipur', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=600', is_featured: true, active_ads_count: 28, ads_count: 28, is_active: true },
  { id: 10, uuid: 'city-lucknow', region_id: 9, name: 'Lucknow', slug: 'lucknow', image: 'https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&q=80&w=600', is_featured: true, active_ads_count: 19, ads_count: 19, is_active: true },
  { id: 11, uuid: 'city-goa', region_id: 10, name: 'Goa', slug: 'goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=600', is_featured: true, active_ads_count: 38, ads_count: 38, is_active: true },
  { id: 12, uuid: 'city-surat', region_id: 7, name: 'Surat', slug: 'surat', image: 'https://images.unsplash.com/photo-1623945200548-30de57021575?auto=format&fit=crop&q=80&w=600', is_featured: false, active_ads_count: 15, ads_count: 15, is_active: true },
];

const DEFAULT_AREAS_MAP: Record<string, Area[]> = {
  'delhi': [
    { id: 101, uuid: 'area-connaught-place', city_id: 1, name: 'Connaught Place', slug: 'connaught-place', is_active: true },
    { id: 102, uuid: 'area-south-delhi', city_id: 1, name: 'South Delhi', slug: 'south-delhi', is_active: true },
    { id: 103, uuid: 'area-dwarka', city_id: 1, name: 'Dwarka', slug: 'dwarka', is_active: true },
    { id: 104, uuid: 'area-aerocity', city_id: 1, name: 'Aerocity', slug: 'aerocity', is_active: true },
    { id: 105, uuid: 'area-saket', city_id: 1, name: 'Saket', slug: 'saket', is_active: true },
    { id: 106, uuid: 'area-rohini', city_id: 1, name: 'Rohini', slug: 'rohini', is_active: true },
  ],
  'mumbai': [
    { id: 201, uuid: 'area-bandra', city_id: 2, name: 'Bandra', slug: 'bandra', is_active: true },
    { id: 202, uuid: 'area-andheri', city_id: 2, name: 'Andheri West', slug: 'andheri-west', is_active: true },
    { id: 203, uuid: 'area-juhu', city_id: 2, name: 'Juhu', slug: 'juhu', is_active: true },
    { id: 204, uuid: 'area-powai', city_id: 2, name: 'Powai', slug: 'powai', is_active: true },
    { id: 205, uuid: 'area-colaba', city_id: 2, name: 'Colaba', slug: 'colaba', is_active: true },
    { id: 206, uuid: 'area-lower-parel', city_id: 2, name: 'Lower Parel', slug: 'lower-parel', is_active: true },
  ],
  'bengaluru': [
    { id: 301, uuid: 'area-indiranagar', city_id: 5, name: 'Indiranagar', slug: 'indiranagar', is_active: true },
    { id: 302, uuid: 'area-koramangala', city_id: 5, name: 'Koramangala', slug: 'koramangala', is_active: true },
    { id: 303, uuid: 'area-whitefield', city_id: 5, name: 'Whitefield', slug: 'whitefield', is_active: true },
    { id: 304, uuid: 'area-hsr-layout', city_id: 5, name: 'HSR Layout', slug: 'hsr-layout', is_active: true },
    { id: 305, uuid: 'area-mg-road', city_id: 5, name: 'MG Road', slug: 'mg-road', is_active: true },
  ],
  'pune': [
    { id: 401, uuid: 'area-koregaon-park', city_id: 3, name: 'Koregaon Park', slug: 'koregaon-park', is_active: true },
    { id: 402, uuid: 'area-viman-nagar', city_id: 3, name: 'Viman Nagar', slug: 'viman-nagar', is_active: true },
    { id: 403, uuid: 'area-baner', city_id: 3, name: 'Baner', slug: 'baner', is_active: true },
    { id: 404, uuid: 'area-hinjewadi', city_id: 3, name: 'Hinjewadi', slug: 'hinjewadi', is_active: true },
  ],
  'hyderabad': [
    { id: 501, uuid: 'area-banjara-hills', city_id: 4, name: 'Banjara Hills', slug: 'banjara-hills', is_active: true },
    { id: 502, uuid: 'area-jubilee-hills', city_id: 4, name: 'Jubilee Hills', slug: 'jubilee-hills', is_active: true },
    { id: 503, uuid: 'area-gachibowli', city_id: 4, name: 'Gachibowli', slug: 'gachibowli', is_active: true },
    { id: 504, uuid: 'area-hitech-city', city_id: 4, name: 'HITECH City', slug: 'hitech-city', is_active: true },
  ]
};

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
      if (data.length > 0) {
        this.countriesCache = data;
        return data;
      }
    } catch (err) {
      console.warn('LocationsService: /locations/countries API error, using default country', err);
    }

    const fallback: Country[] = [{ id: 1, name: 'India', slug: 'india', code: 'IN' }];
    this.countriesCache = fallback;
    return fallback;
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
      if (data.length > 0) {
        this.regionsCache.set(cacheKey, data);
        return data;
      }
    } catch (err) {
      console.warn('LocationsService: /locations/regions API error', err);
    }

    return this.regionsCache.get(cacheKey) || [];
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
      if (Array.isArray(data) && data.length > 0) {
        this.citiesCache.set(cacheKey, data);
        return data;
      }
    } catch (err) {
      console.warn('LocationsService: /locations/cities API error, fallback to Indian cities dataset', err);
    }

    // Fallback: If region filter was applied and returned 0 items, check unfiltered cities
    if (regionId || countryId) {
      try {
        const response = await apiClient.get<ApiResponse<City[]>>('/locations/cities', { forceRefresh: false });
        const allCities = response.data || [];
        if (allCities.length > 0) {
          this.citiesCache.set(cacheKey, allCities);
          return allCities;
        }
      } catch {
        // Continue to default dataset
      }
    }

    // Default dynamic dataset of major Indian cities
    this.citiesCache.set(cacheKey, DEFAULT_INDIAN_CITIES);
    return DEFAULT_INDIAN_CITIES;
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
    if (match) return match;

    // 3. Fallback search in DEFAULT_INDIAN_CITIES
    return DEFAULT_INDIAN_CITIES.find(c => c.slug?.toLowerCase() === lowerSlug) || null;
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
      if (Array.isArray(data) && data.length > 0) {
        this.areasCache.set(cacheKey, data);
        return data;
      }
    } catch {
      // Continue to fallback map below
    }

    // Check fallback area map by city ID or slug if available
    const city = DEFAULT_INDIAN_CITIES.find(c => String(c.id) === String(cityId));
    if (city && DEFAULT_AREAS_MAP[city.slug]) {
      const fallbackAreas = DEFAULT_AREAS_MAP[city.slug];
      this.areasCache.set(cacheKey, fallbackAreas);
      return fallbackAreas;
    }

    return this.areasCache.get(cacheKey) || [];
  }
}

