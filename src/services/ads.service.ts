import { Ad } from '../types/ad';
import { mockAds } from '../data/mock-ads';

export class AdsService {
  private static storageKey = 'marketplace_user_ads';

  /**
   * Get all ads (combines system mock ads + user created ads from localStorage)
   */
  static async getAll(): Promise<Ad[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userAdsJson = localStorage.getItem(this.storageKey);
        const userAds: Ad[] = userAdsJson ? JSON.parse(userAdsJson) : [];
        resolve([...userAds, ...mockAds]);
      }, 50);
    });
  }

  /**
   * Get featured advertisements
   */
  static async getFeatured(limit?: number): Promise<Ad[]> {
    const all = await this.getAll();
    const featured = all.filter((ad) => ad.isFeatured);
    return limit ? featured.slice(0, limit) : featured;
  }

  /**
   * Get latest advertisements
   */
  static async getLatest(limit?: number): Promise<Ad[]> {
    const all = await this.getAll();
    // In real API, we would sort by date, mock already sorted or just reverse
    const sorted = [...all].reverse();
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Get a single advertisement by slug
   */
  static async getBySlug(slug: string): Promise<Ad | null> {
    const all = await this.getAll();
    const ad = all.find((a) => a.slug === slug);
    return ad ? { ...ad } : null;
  }

  /**
   * Create / Save a new advertisement
   */
  static async createAd(newAd: Omit<Ad, 'id' | 'postedAt' | 'viewsCount'>): Promise<Ad> {
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
   * Get ads submitted by the current user
   */
  static async getMyAds(): Promise<Ad[]> {
    const userAdsJson = localStorage.getItem(this.storageKey);
    const userAds: Ad[] = userAdsJson ? JSON.parse(userAdsJson) : [];
    return Promise.resolve(userAds);
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
