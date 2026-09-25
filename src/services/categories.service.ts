import { apiClient, ApiResponse } from '../lib/api/client';
import { Category } from '../types/api';

export class CategoriesService {
  private static categoriesCache: Category[] | null = null;

  /**
   * Clear category cache
   */
  static clearCache(): void {
    this.categoriesCache = null;
  }

  /**
   * Fetch all active categories from API V2 (/categories)
   */
  static async getAll(forceRefresh = false): Promise<Category[]> {
    if (!forceRefresh && this.categoriesCache !== null) {
      return this.categoriesCache;
    }

    try {
      const response = await apiClient.get<ApiResponse<Category[]>>('/categories', {
        forceRefresh,
        ttlMs: 300_000 // 5 minutes cache
      });
      const data = response.data || [];
      this.categoriesCache = data;
      return data;
    } catch (err) {
      console.error('Failed to fetch categories from /categories API:', err);
      return this.categoriesCache || [];
    }
  }

  /**
   * Fetch a single category by slug from API V2
   */
  static async getBySlug(slug: string): Promise<Category | null> {
    if (!slug) return null;

    // Check if category is already in in-memory categoriesCache
    if (this.categoriesCache !== null) {
      const found = this.categoriesCache.find(
        (c) => c.slug?.toLowerCase() === slug.toLowerCase() || String(c.id) === String(slug)
      );
      if (found) return found;
    }

    try {
      const response = await apiClient.get<ApiResponse<Category>>(`/categories/${slug}`, {
        ttlMs: 300_000
      });
      return response.data || null;
    } catch {
      return null;
    }
  }
}
