import { Ad } from '../types/ad';
import { mockAds } from '../data/mock-ads';
import { apiClient, ApiResponse, ApiPaginatedResponse } from '../lib/api/client';

export class AdsService {
  private static storageKey = 'marketplace_user_ads';

  /**
   * Get all ads via API V2
   */
  static async getAll(): Promise<Ad[]> {
    try {
      const response = await apiClient.get<ApiPaginatedResponse<Ad>>('/ads');
      return response.data && response.data.length > 0 ? response.data : this.getLocalAll();
    } catch {
      return this.getLocalAll();
    }
  }

  private static getLocalAll(): Ad[] {
    const userAdsJson = localStorage.getItem(this.storageKey);
    const userAds: Ad[] = userAdsJson ? JSON.parse(userAdsJson) : [];
    return [...userAds, ...mockAds];
  }

  /**
   * Get featured advertisements via API V2
   */
  static async getFeatured(limit?: number): Promise<Ad[]> {
    try {
      const response = await apiClient.get<ApiPaginatedResponse<Ad>>('/ads?featured=true');
      if (response.data && response.data.length > 0) {
        return limit ? response.data.slice(0, limit) : response.data;
      }
    } catch {
      // Fallback
    }
    const all = await this.getAll();
    const featured = all.filter((ad) => ad.isFeatured);
    return limit ? featured.slice(0, limit) : featured;
  }

  /**
   * Get latest advertisements
   */
  static async getLatest(limit?: number): Promise<Ad[]> {
    const all = await this.getAll();
    const sorted = [...all].reverse();
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Get a single advertisement by slug via API V2
   */
  static async getBySlug(slug: string): Promise<Ad | null> {
    try {
      const response = await apiClient.get<ApiResponse<Ad>>(`/ads/${slug}`);
      if (response.data) return response.data;
    } catch {
      // Fallback
    }
    const all = await this.getAll();
    const ad = all.find((a) => a.slug === slug);
    return ad ? { ...ad } : null;
  }

  /**
   * Create / Save a new advertisement via API V2
   */
  static async createAd(newAd: Omit<Ad, 'id' | 'postedAt' | 'viewsCount'>): Promise<Ad> {
    try {
      const response = await apiClient.post<ApiResponse<Ad>>('/ads', {
        title: newAd.title,
        description: newAd.description,
        category_id: 1,
        city_id: 1,
        profile_name: newAd.profileName || 'Advertiser',
        profile_image: newAd.profileImage,
        contact_phone: newAd.contact?.phone || '+91 99999 88888',
        contact_whatsapp: newAd.contact?.whatsapp || '+91 99999 88888',
        attributes: newAd.attributes,
        services: newAd.services,
      });

      if (response.data) return response.data;
    } catch {
      // Fallback to local storage creation
    }

    const allUserAdsJson = localStorage.getItem(this.storageKey);
    const userAds: Ad[] = allUserAdsJson ? JSON.parse(allUserAdsJson) : [];
    
    const ad: Ad = {
      ...newAd,
      id: `user-ad-${Date.now()}`,
      postedAt: 'Just now',
      viewsCount: 0,
    };

    userAds.push(ad);
    localStorage.setItem(this.storageKey, JSON.stringify(userAds));
    
    return Promise.resolve(ad);
  }

  /**
   * Get ads submitted by current user via API V2
   */
  static async getMyAds(): Promise<Ad[]> {
    try {
      const response = await apiClient.get<ApiResponse<Ad[]>>('/me/ads');
      if (response.data) return response.data;
    } catch {
      // Fallback
    }

    const userAdsJson = localStorage.getItem(this.storageKey);
    return userAdsJson ? JSON.parse(userAdsJson) : [];
  }

  /**
   * Delete user ad
   */
  static async deleteAd(id: string): Promise<boolean> {
    const userAdsJson = localStorage.getItem(this.storageKey);
    if (!userAdsJson) return false;
    let userAds: Ad[] = JSON.parse(userAdsJson);
    const lengthBefore = userAds.length;
    userAds = userAds.filter((ad) => ad.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(userAds));
    return lengthBefore !== userAds.length;
  }
}
