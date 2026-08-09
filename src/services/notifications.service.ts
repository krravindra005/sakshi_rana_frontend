import { Notification } from '../types/user';
import { apiClient, ApiResponse } from '../lib/api/client';

export class NotificationsService {
  private static storageKey = 'marketplace_user_notifications';

  /**
   * Fetch all notifications for current user from API V2
   */
  static async getAll(): Promise<Notification[]> {
    try {
      const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications');
      if (response.data && response.data.length > 0) return response.data;
    } catch {
      // Fallback
    }

    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Mark notification as read via API V2
   */
  static async markAsRead(id: string): Promise<Notification[]> {
    try {
      await apiClient.post(`/notifications/${id}/read`);
    } catch {
      // Ignored
    }

    const notifications = await this.getAll();
    const updated = notifications.map((n) => n.id === id ? { ...n, isRead: true } : n);
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
    return updated;
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<Notification[]> {
    const notifications = await this.getAll();
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
    return updated;
  }
}
