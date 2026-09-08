import { apiClient, ApiResponse } from '../lib/api/client';

export class ReportsService {
  /**
   * Submit an ad report via POST /api/v2/ads/{ad}/reports
   */
  static async submitReport(adSlugOrId: string, reasonCode: string, description?: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/ads/${adSlugOrId}/reports`, {
      ad_id: adSlugOrId,
      reason_code: reasonCode,
      description: description || '',
    });
    return response.data;
  }
}
