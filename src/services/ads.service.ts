import { Ad } from '../types/ad';
import { apiClient, ApiResponse, ApiPaginatedResponse } from '../lib/api/client';
import { mapApiAdToFrontendAd } from '../lib/mappers';

export class AdsService {
  private static allAdsCache: Ad[] | null = null;
  private static featuredAdsCache: Ad[] | null = null;
  private static inFlightAll: Promise<Ad[]> | null = null;
  private static inFlightFeatured: Promise<Ad[]> | null = null;

  /**
   * Clear in-memory static cache
   */
  static clearCache(): void {
    this.allAdsCache = null;
    this.featuredAdsCache = null;
    this.inFlightAll = null;
    this.inFlightFeatured = null;
  }

  /**
   * Get all published ads via API V2 (cached and deduplicated)
   */
  static async getAll(forceRefresh = false): Promise<Ad[]> {
    if (!forceRefresh && this.allAdsCache !== null) {
      return this.allAdsCache;
    }

    if (!forceRefresh && this.inFlightAll !== null) {
      return this.inFlightAll;
    }

    this.inFlightAll = (async () => {
      try {
        const response = await apiClient.get<ApiPaginatedResponse<any>>('/ads', {
          forceRefresh,
          ttlMs: 60_000,
        });
        const items = response.data || [];
        const mapped = items.map(mapApiAdToFrontendAd);
        this.allAdsCache = mapped;
        return mapped;
      } catch {
        return this.allAdsCache || [];
      } finally {
        this.inFlightAll = null;
      }
    })();

    return this.inFlightAll;
  }

  /**
   * Get featured advertisements via API V2 (cached and deduplicated)
   */
  static async getFeatured(limit?: number, forceRefresh = false): Promise<Ad[]> {
    if (!forceRefresh && this.featuredAdsCache !== null) {
      return limit ? this.featuredAdsCache.slice(0, limit) : this.featuredAdsCache;
    }

    if (!forceRefresh && this.inFlightFeatured !== null) {
      const items = await this.inFlightFeatured;
      return limit ? items.slice(0, limit) : items;
    }

    this.inFlightFeatured = (async () => {
      try {
        const response = await apiClient.get<ApiPaginatedResponse<any>>('/ads?featured=true', {
          forceRefresh,
          ttlMs: 60_000,
        });
        const items = (response.data || []).map(mapApiAdToFrontendAd);
        this.featuredAdsCache = items;
        return items;
      } catch {
        return this.featuredAdsCache || [];
      } finally {
        this.inFlightFeatured = null;
      }
    })();

    const result = await this.inFlightFeatured;
    return limit ? result.slice(0, limit) : result;
  }

  /**
   * Get latest advertisements
   */
  static async getLatest(limit?: number, forceRefresh = false): Promise<Ad[]> {
    const all = await this.getAll(forceRefresh);
    return limit ? all.slice(0, limit) : all;
  }

  /**
   * Get a single advertisement by slug or ID via API V2
   */
  static async getBySlug(slug: string): Promise<Ad | null> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`/ads/${slug}`);
      if (response.data) {
        return mapApiAdToFrontendAd(response.data);
      }
    } catch {
      return null;
    }
    return null;
  }

  /**
   * Create / Save a new draft advertisement via API V2
   */
  static async createAd(newAd: any): Promise<Ad> {
    const payload = {
      title: newAd.title,
      description: newAd.description,
      category_id: newAd.category_id || newAd.categoryId || 1,
      city_id: newAd.city_id || newAd.cityId || 1,
      area_id: newAd.area_id || newAd.areaId || null,
      price: newAd.price || 1500,
      profile_name: newAd.profile_name || newAd.title || null,
      profile_image: newAd.profile_image || (newAd.images && newAd.images.length > 0 ? newAd.images[0] : null),
      images: newAd.images || [],
      contact_phone: newAd.contact?.phone || newAd.contact_phone || '+919876543210',
      contact_whatsapp: newAd.contact?.whatsapp || newAd.contact_whatsapp || '+919876543210',
      contact_email: newAd.contact?.email || newAd.contact_email || 'advertiser@example.com',
      filters: newAd.attributes || newAd.filters || {},
    };

    const response = await apiClient.post<ApiResponse<any>>('/ads', payload);
    this.clearCache();
    return mapApiAdToFrontendAd(response.data);
  }

  /**
   * Submit ad for moderation review via API V2
   */
  static async submitAd(id: string | number): Promise<Ad> {
    const response = await apiClient.post<ApiResponse<any>>(`/ads/${id}/submit`);
    this.clearCache();
    return mapApiAdToFrontendAd(response.data);
  }

  /**
   * Get ads submitted by current user via API V2
   */
  static async getMyAds(): Promise<Ad[]> {
    try {
      const response = await apiClient.get<ApiPaginatedResponse<any>>('/me/ads');
      const items = response.data || [];
      return items.map(mapApiAdToFrontendAd);
    } catch {
      return [];
    }
  }

  /**
   * Pause advertisement via API V2
   */
  static async pauseAd(id: string | number): Promise<Ad> {
    const response = await apiClient.post<ApiResponse<any>>(`/ads/${id}/pause`);
    this.clearCache();
    return mapApiAdToFrontendAd(response.data);
  }

  /**
   * Republish advertisement via API V2
   */
  static async republishAd(id: string | number): Promise<Ad> {
    const response = await apiClient.post<ApiResponse<any>>(`/ads/${id}/republish`);
    this.clearCache();
    return mapApiAdToFrontendAd(response.data);
  }

  /**
   * Delete user ad via API V2
   */
  static async deleteAd(id: string | number): Promise<boolean> {
    try {
      await apiClient.delete(`/ads/${id}`);
      this.clearCache();
      return true;
    } catch {
      return false;
    }
  }
}
