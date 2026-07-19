import { City, Area, Country, LocationState } from '../types/location';
import { mockCities, mockAreas, mockCountries, mockStates } from '../data/mock-locations';

export class LocationsService {
  /**
   * Get all countries
   */
  static async getCountries(): Promise<Country[]> {
    return Promise.resolve([...mockCountries]);
  }

  /**
   * Get states by countryId
   */
  static async getStatesByCountry(countryId: string): Promise<LocationState[]> {
    return Promise.resolve(mockStates.filter((s) => s.countryId === countryId));
  }

  /**
   * Get all active cities
   */
  static async getCities(): Promise<City[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockCities]);
      }, 50);
    });
  }

  /**
   * Get city by its slug
   */
  static async getCityBySlug(slug: string): Promise<City | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const city = mockCities.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
        resolve(city ? { ...city } : null);
      }, 30);
    });
  }

  /**
   * Get areas inside a specific city
   */
  static async getAreasByCity(cityId: string): Promise<Area[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockAreas.filter((a) => a.cityId === cityId));
      }, 20);
    });
  }
}
