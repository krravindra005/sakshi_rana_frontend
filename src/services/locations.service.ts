import { City, Area, Country, LocationState } from '../types/location';
import { apiClient, ApiResponse } from '../lib/api/client';
import { mockCities, mockAreas, mockCountries, mockStates } from '../data/mock-locations';

export class LocationsService {
  /**
   * Get all countries from API V2
   */
  static async getCountries(): Promise<Country[]> {
    try {
      const response = await apiClient.get<ApiResponse<Country[]>>('/locations/countries');
      if (response.data && response.data.length > 0) return response.data;
    } catch {
      // Fallback
    }
    return [...mockCountries];
  }

  /**
   * Get states by countryId from API V2
   */
  static async getStatesByCountry(countryId: string): Promise<LocationState[]> {
    try {
      const response = await apiClient.get<ApiResponse<LocationState[]>>(`/locations/regions?country_id=${countryId}`);
      if (response.data && response.data.length > 0) return response.data;
    } catch {
      // Fallback
    }
    return mockStates.filter((s) => s.countryId === countryId);
  }

  /**
   * Get all active cities from API V2
   */
  static async getCities(): Promise<City[]> {
    try {
      const response = await apiClient.get<ApiResponse<City[]>>('/locations/cities');
      if (response.data && response.data.length > 0) return response.data;
    } catch {
      // Fallback
    }
    return [...mockCities];
  }

  /**
   * Get city by its slug from API V2
   */
  static async getCityBySlug(slug: string): Promise<City | null> {
    try {
      const cities = await this.getCities();
      const match = cities.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
      if (match) return match;
    } catch {
      // Fallback
    }
    const city = mockCities.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
    return city ? { ...city } : null;
  }

  /**
   * Get areas inside a specific city from API V2
   */
  static async getAreasByCity(cityId: string): Promise<Area[]> {
    try {
      const response = await apiClient.get<ApiResponse<Area[]>>(`/locations/areas?city_id=${cityId}`);
      if (response.data && response.data.length > 0) return response.data;
    } catch {
      // Fallback
    }
    return mockAreas.filter((a) => a.cityId === cityId);
  }
}
