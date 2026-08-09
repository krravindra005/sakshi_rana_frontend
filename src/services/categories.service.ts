import { Category } from '../types/category';
import { apiClient, ApiResponse } from '../lib/api/client';
import { mockCategories } from '../data/mock-categories';

export class CategoriesService {
  /**
   * Fetch all categories from API V2
   */
  static async getAll(): Promise<Category[]> {
    try {
      const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
      if (response.data && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // Fallback if API server is restarting
    }
    return [...mockCategories];
  }

  /**
   * Fetch a single category by its slug from API V2
   */
  static async getBySlug(slug: string): Promise<Category | null> {
    try {
      const response = await apiClient.get<ApiResponse<Category>>(`/categories/${slug}`);
      if (response.data) return response.data;
    } catch {
      // Fallback
    }
    const cat = mockCategories.find((c) => c.slug === slug);
    return cat ? { ...cat } : null;
  }
}
