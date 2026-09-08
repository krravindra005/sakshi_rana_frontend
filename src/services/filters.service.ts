import { apiClient, ApiResponse } from '../lib/api/client';
import { DynamicFilter } from '../types/api';

export class FiltersService {
  /**
   * Get dynamic filters assigned to a specific category from API V2
   */
  static async getByCategory(categorySlug?: string): Promise<DynamicFilter[]> {
    if (!categorySlug) {
      return [];
    }

    try {
      const response = await apiClient.get<ApiResponse<DynamicFilter[]>>(`/categories/${categorySlug}/filters`);
      return response.data || [];
    } catch {
      return [];
    }
  }

  /**
   * Get filter options for a filter ID from API V2
   */
  static async getOptions(filterId: string | number): Promise<any[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(`/filters/${filterId}/options`);
      return response.data || [];
    } catch {
      return [];
    }
  }
}
