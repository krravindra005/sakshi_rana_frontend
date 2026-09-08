import { apiClient, ApiResponse } from '../lib/api/client';
import { Category } from '../types/api';

export class CategoriesService {
  /**
   * Fetch all active categories from API V2
   */
  static async getAll(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data || [];
  }

  /**
   * Fetch a single category by slug from API V2
   */
  static async getBySlug(slug: string): Promise<Category | null> {
    try {
      const response = await apiClient.get<ApiResponse<Category>>(`/categories/${slug}`);
      return response.data;
    } catch {
      return null;
    }
  }
}
