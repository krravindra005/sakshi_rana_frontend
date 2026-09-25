import { Ad } from '../types/ad';
import { apiClient, ApiPaginatedResponse } from '../lib/api/client';
import { mapApiAdToFrontendAd } from '../lib/mappers';

export class FavoritesService {
  private static cachedFavoriteIds: Set<string> | null = null;
  private static inFlightRequest: Promise<Ad[]> | null = null;

  /**
   * Clear memory cache (e.g. on user logout)
   */
  static clearCache(): void {
    this.cachedFavoriteIds = null;
    this.inFlightRequest = null;
  }

  /**
   * Get all favorites of the current user via GET /api/v2/favorites
   */
  static async getAll(forceRefresh = false): Promise<Ad[]> {
    if (this.inFlightRequest && !forceRefresh) {
      return this.inFlightRequest;
    }

    this.inFlightRequest = (async () => {
      try {
        const response = await apiClient.get<ApiPaginatedResponse<any>>('/favorites');
        const items = response.data || [];
        const validAds: Ad[] = [];
        const ids = new Set<string>();

        items.forEach((fav: any) => {
          const rawAd = fav?.ad || (fav?.title ? fav : null);
          if (rawAd) {
            const mapped = mapApiAdToFrontendAd(rawAd);
            validAds.push(mapped);
            if (mapped.id) ids.add(String(mapped.id));
            if (mapped.slug) ids.add(String(mapped.slug));
            if (rawAd.id) ids.add(String(rawAd.id));
            if (rawAd.uuid) ids.add(String(rawAd.uuid));
            if (fav.ad_id) ids.add(String(fav.ad_id));
          }
        });

        this.cachedFavoriteIds = ids;
        return validAds;
      } catch (err) {
        console.error('Failed to load favorites:', err);
        return [];
      } finally {
        this.inFlightRequest = null;
      }
    })();

    return this.inFlightRequest;
  }

  /**
   * Check if an ad is favorited
   */
  static async isFavorite(adSlugOrId: string): Promise<boolean> {
    if (!adSlugOrId) return false;
    const strId = String(adSlugOrId);

    if (this.cachedFavoriteIds !== null) {
      return this.cachedFavoriteIds.has(strId);
    }

    await this.getAll();
    return this.cachedFavoriteIds ? this.cachedFavoriteIds.has(strId) : false;
  }

  /**
   * Fast synchronous favorite check if cache is primed
   */
  static isFavoriteSync(adSlugOrId: string): boolean {
    if (!adSlugOrId || !this.cachedFavoriteIds) return false;
    return this.cachedFavoriteIds.has(String(adSlugOrId));
  }

  /**
   * Add favorite via POST /api/v2/favorites/{ad}
   */
  static async addFavorite(adSlugOrId: string): Promise<boolean> {
    try {
      await apiClient.post(`/favorites/${adSlugOrId}`);
      if (!this.cachedFavoriteIds) {
        this.cachedFavoriteIds = new Set<string>();
      }
      this.cachedFavoriteIds.add(String(adSlugOrId));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('favorites_updated', {
          detail: { adId: String(adSlugOrId), isFavorite: true }
        }));
      }
      return true;
    } catch (err) {
      console.error('Failed to add favorite:', err);
      return false;
    }
  }

  /**
   * Remove favorite via DELETE /api/v2/favorites/{ad}
   */
  static async removeFavorite(adSlugOrId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/favorites/${adSlugOrId}`);
      if (this.cachedFavoriteIds) {
        this.cachedFavoriteIds.delete(String(adSlugOrId));
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('favorites_updated', {
          detail: { adId: String(adSlugOrId), isFavorite: false }
        }));
      }
      return true;
    } catch (err) {
      console.error('Failed to remove favorite:', err);
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
