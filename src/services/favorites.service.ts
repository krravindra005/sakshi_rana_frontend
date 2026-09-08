import { Ad } from '../types/ad';
import { apiClient, ApiResponse, ApiPaginatedResponse } from '../lib/api/client';
import { mapApiAdToFrontendAd } from '../lib/mappers';

export class FavoritesService {
  /**
   * Get all favorites of the current user via GET /api/v2/favorites
   */
  static async getAll(): Promise<Ad[]> {
    try {
      const response = await apiClient.get<ApiPaginatedResponse<any>>('/favorites');
      const items = response.data || [];
      return items.map((fav: any) => mapApiAdToFrontendAd(fav.ad || fav));
    } catch {
      return [];
    }
  }

  /**
   * Check if an ad is favorited
   */
  static async isFavorite(adSlugOrId: string): Promise<boolean> {
    const favorites = await this.getAll();
    return favorites.some((fav) => fav.id === adSlugOrId || fav.slug === adSlugOrId);
  }

  /**
   * Add favorite via POST /api/v2/favorites/{ad}
   */
  static async addFavorite(adSlugOrId: string): Promise<boolean> {
    try {
      await apiClient.post(`/favorites/${adSlugOrId}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Remove favorite via DELETE /api/v2/favorites/{ad}
   */
  static async removeFavorite(adSlugOrId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/favorites/${adSlugOrId}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Toggle advertisement as favorite
   */
  static async toggle(adSlugOrId: string): Promise<boolean> {
    const isFav = await this.isFavorite(adSlugOrId);
    if (isFav) {
      await this.removeFavorite(adSlugOrId);
      return false;
    } else {
      await this.addFavorite(adSlugOrId);
      return true;
    }
  }
}
