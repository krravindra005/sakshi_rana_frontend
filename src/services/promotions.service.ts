import { Promotion } from '../types/ad';
import { UsersService } from './users.service';

export class PromotionsService {
  private static promotions: Promotion[] = [
    { id: 'promo-featured-7', name: 'Featured Companion (7 Days)', description: 'Display profile in the homepage featured slider for 7 days', cost: 500, durationDays: 7, type: 'featured' },
    { id: 'promo-featured-30', name: 'Featured Companion (30 Days)', description: 'Display profile in the homepage featured slider for 30 days', cost: 1500, durationDays: 30, type: 'featured' },
    { id: 'promo-bump-daily', name: 'Daily Auto-Bump', description: 'Automatically move listing to the top of results once per day', cost: 200, durationDays: 7, type: 'bump' },
    { id: 'promo-vip-highlight', name: 'VIP Badge & Highlights', description: 'Custom gold ribbon borders on lists and VIP badge on profile', cost: 300, durationDays: 14, type: 'vip' }
  ];

  /**
   * Fetch all available promotions
   */
  static async getAll(): Promise<Promotion[]> {
    return Promise.resolve([...this.promotions]);
  }

  /**
   * Apply a promotion to a companion advertisement, deducting balance from user's wallet
   */
  static async applyToAd(adId: string, promotionId: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const promo = this.promotions.find((p) => p.id === promotionId);
        if (!promo) {
          return reject(new Error('Promotion package not found'));
        }

        try {
          // Deduct credits from user wallet
          UsersService.updateWalletBalance(promo.cost, 'spend', `Promoted ad ${adId} using package ${promo.name}`);
          
          // In real implementation we would call API to set promotion on the Ad.
          // For mock, we log it and return success
          console.log(`Promotion ${promotionId} applied to advertisement ${adId}`);
          
          resolve({
            success: true,
            message: `Promotion applied successfully. ${promo.cost} Credits deducted.`
          });
        } catch (err: any) {
          reject(err);
        }
      }, 150);
    });
  }
}
