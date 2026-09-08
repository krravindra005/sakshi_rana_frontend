import { apiClient, ApiResponse, ApiPaginatedResponse } from '../lib/api/client';
import { NotificationItem } from '../types/api';

export class NotificationsService {
  /**
   * Fetch all notifications for current user from GET /api/v2/notifications
   */
  static async getAll(): Promise<NotificationItem[]> {
    try {
      const response = await apiClient.get<ApiPaginatedResponse<NotificationItem>>('/notifications');
      return response.data || [];
    } catch {
      return [];
    }
  }

  /**
   * Mark single notification as read via POST /api/v2/notifications/{id}/read
   */
  static async markAsRead(id: string | number): Promise<boolean> {
    try {
      await apiClient.post(`/notifications/${id}/read`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Mark all notifications as read via POST /api/v2/notifications/read-all
   */
  static async markAllAsRead(): Promise<boolean> {
    try {
      await apiClient.post('/notifications/read-all');
      return true;
    } catch {
      return false;
    }
  }
}
