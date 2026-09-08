import { apiClient, ApiResponse } from '../lib/api/client';
import { PromotionProduct } from '../types/api';

export class PromotionsService {
  /**
   * Fetch all active promotion products from GET /api/v2/promotion-products
   */
  static async getAll(): Promise<PromotionProduct[]> {
    try {
      const response = await apiClient.get<ApiResponse<PromotionProduct[]>>('/promotion-products');
      return response.data || [];
    } catch {
      return [];
    }
  }

  /**
   * Purchase promotion for advertisement via POST /api/v2/ads/{ad}/promotions
   */
  static async applyToAd(adSlugOrId: string, promotionDurationId: number, autoRenew: boolean = false): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/ads/${adSlugOrId}/promotions`, {
      ad_id: adSlugOrId,
      promotion_duration_id: promotionDurationId,
      payment_method: 'wallet',
      auto_renew: autoRenew,
    });
    return response.data;
  }
}
