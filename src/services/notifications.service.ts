import { Notification } from '../types/user';

export class NotificationsService {
  private static storageKey = 'marketplace_user_notifications';

  private static defaultNotifications: Notification[] = [
    { id: 'notif-1', userId: 'usr-101', title: 'Ad Approved', message: 'Your advertisement listing has been successfully approved by the moderation team and is now published.', type: 'moderation', isRead: false, createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 'notif-2', userId: 'usr-101', title: 'Wallet Top-up Successful', message: 'You have topped up 2,000 Credits successfully. Keep companion listings highlighted!', type: 'wallet', isRead: true, createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
    { id: 'notif-3', userId: 'usr-101', title: 'Welcome to Discreet Marketplace', message: 'Set up your companion profiles, verify with our trust desk, and receive high exposure.', type: 'system', isRead: true, createdAt: new Date(Date.now() - 3600000 * 72).toISOString() }
  ];

  /**
   * Fetch all notifications for the current user
   */
  static async getAll(): Promise<Notification[]> {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.defaultNotifications));
      return [...this.defaultNotifications];
    }
    return JSON.parse(stored);
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(id: string): Promise<Notification[]> {
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
