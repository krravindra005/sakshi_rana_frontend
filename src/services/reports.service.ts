import { Report } from '../types/ad';

export class ReportsService {
  /**
   * Submit an abuse/content report for an ad
   */
  static async submitReport(adId: string, reason: string, description?: string): Promise<{ success: boolean; message: string; data: Report }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const report: Report = {
          id: `rep-${Date.now()}`,
          adId,
          reason,
          description,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        console.log('Report submitted successfully to Trust & Safety Desk:', report);

        resolve({
          success: true,
          message: 'Report submitted. Thank you for keeping our marketplace safe.',
          data: report
        });
      }, 100);
    });
  }
}
