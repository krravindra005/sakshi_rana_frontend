import { apiClient, ApiResponse } from '../lib/api/client';
import { Country, Region, City, Area } from '../types/api';

export class LocationsService {
  /**
   * Get all active countries from API V2
   */
  static async getCountries(): Promise<Country[]> {
    const response = await apiClient.get<ApiResponse<Country[]>>('/locations/countries');
    return response.data || [];
  }

  /**
   * Get states/regions by countryId from API V2
   */
  static async getStatesByCountry(countryId: string | number): Promise<Region[]> {
    const response = await apiClient.get<ApiResponse<Region[]>>(`/locations/regions?country_id=${countryId}`);
    return response.data || [];
  }

  /**
   * Get all active cities (or filtered by region/featured) from API V2
   */
  static async getCities(regionId?: string | number, featured?: boolean): Promise<City[]> {
    let url = '/locations/cities';
    const params: string[] = [];
    if (regionId) params.push(`region_id=${regionId}`);
    if (featured) params.push(`featured=true`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const response = await apiClient.get<ApiResponse<City[]>>(url);
    return response.data || [];
  }

  /**
   * Get city by its slug from API V2
   */
  static async getCityBySlug(slug: string): Promise<City | null> {
    const cities = await this.getCities();
    const match = cities.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
    return match || null;
  }

  /**
   * Get areas inside a specific city from API V2
   */
  static async getAreasByCity(cityId: string | number): Promise<Area[]> {
    const response = await apiClient.get<ApiResponse<Area[]>>(`/locations/areas?city_id=${cityId}`);
    return response.data || [];
  }
}
