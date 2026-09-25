import { Ad } from '../types/ad';
import { apiClient, ApiPaginatedResponse } from '../lib/api/client';
import { mapApiAdToFrontendAd } from '../lib/mappers';

export class FavoritesService {
  private static cachedFavoriteIds: Set<string> | null = null;
  private static cachedFavorites: Ad[] | null = null;
  private static inFlightRequest: Promise<Ad[]> | null = null;

  /**
   * Clear memory cache (e.g. on user logout)
   */
  static clearCache(): void {
    this.cachedFavoriteIds = null;
    this.cachedFavorites = null;
    this.inFlightRequest = null;
  }

  /**
   * Check if current user is authenticated
   */
  private static isAuthenticated(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('auth_token');
  }

  /**
   * Get all favorites of the current user via GET /api/v2/favorites
   */
  static async getAll(forceRefresh = false): Promise<Ad[]> {
    if (!this.isAuthenticated()) {
      return [];
    }

    if (!forceRefresh && this.cachedFavorites !== null) {
      return this.cachedFavorites;
    }

    if (this.inFlightRequest && !forceRefresh) {
      return this.inFlightRequest;
    }

    this.inFlightRequest = (async () => {
      try {
        const response = await apiClient.get<ApiPaginatedResponse<any>>('/favorites', { forceRefresh });
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
        this.cachedFavorites = validAds;
        return validAds;
      } catch (err) {
        console.error('Failed to load favorites:', err);
        return this.cachedFavorites || [];
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
    if (!this.isAuthenticated()) return false;
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
  static async addFavorite(adSlugOrId: string, adObj?: Ad): Promise<boolean> {
    try {
      await apiClient.post(`/favorites/${adSlugOrId}`);
      if (!this.cachedFavoriteIds) {
        this.cachedFavoriteIds = new Set<string>();
      }
      this.cachedFavoriteIds.add(String(adSlugOrId));
      if (adObj && this.cachedFavorites) {
        if (!this.cachedFavorites.some((a) => String(a.id) === String(adObj.id))) {
          this.cachedFavorites.push(adObj);
        }
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('favorites_updated', {
          detail: { adId: String(adSlugOrId), isFavorite: true, ad: adObj }
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
      if (this.cachedFavorites) {
        this.cachedFavorites = this.cachedFavorites.filter(
          (a) => String(a.id) !== String(adSlugOrId) && String(a.slug) !== String(adSlugOrId)
        );
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
