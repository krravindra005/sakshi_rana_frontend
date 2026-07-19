import { Ad } from '../types/ad';
import { UsersService } from './users.service';
import { AdsService } from './ads.service';

export class FavoritesService {
  /**
   * Get all favorites of the current user
   */
  static async getAll(): Promise<Ad[]> {
    const favoriteIds = UsersService.getFavorites();
    const allAds = await AdsService.getAll();
    return allAds.filter((ad) => favoriteIds.includes(ad.id));
  }

  /**
   * Check if an ad is favorited
   */
  static async isFavorite(adId: string): Promise<boolean> {
    const favoriteIds = UsersService.getFavorites();
    return favoriteIds.includes(adId);
  }

  /**
   * Toggle advertisement as favorite
   */
  static async toggle(adId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updated = UsersService.toggleFavorite(adId);
        resolve(updated.includes(adId));
      }, 50);
    });
  }
}
