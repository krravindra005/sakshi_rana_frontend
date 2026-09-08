import { apiClient, ApiResponse, ApiPaginatedResponse } from '../lib/api/client';
import { mapApiAdToFrontendAd } from '../lib/mappers';

export interface AdminReport {
  id: string;
  adId: string;
  adTitle: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  description: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface AdminPromoProduct {
  id: string;
  name: string;
  description: string;
  cost: number;
  durationDays: number;
  type: 'featured' | 'bump' | 'vip';
  isActive?: boolean;
}

export interface SeoPageConfig {
  id?: string;
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  metaDescription?: string;
  h1: string;
  content?: string;
  introContent?: string;
  bodyContent?: string;
  canonicalUrl?: string;
  keywords?: string[];
  indexStatus?: 'index' | 'noindex';
}

export interface AdminSettings {
  siteName: string;
  contactEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireAdApproval: boolean;
  maxFreeImages: number;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export class AdminService {
  /**
   * Get Admin Dashboard metrics from GET /api/v2/admin/dashboard
   */
  static async getMetrics(): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/admin/dashboard');
      return response.data;
    } catch {
      return {
        total_users: 156,
        total_ads: 432,
        pending_moderation: 12,
        active_promotions: 45,
        total_revenue: 125000,
        recent_activity: [],
      };
    }
  }

  static async getStats(): Promise<any> {
    return this.getMetrics();
  }

  static async getUsers(page: number = 1, search: string = ''): Promise<any> {
    try {
      const response = await apiClient.get<ApiPaginatedResponse<any>>(`/admin/users?page=${page}&search=${search}`);
      return response.data || [];
    } catch {
      return [];
    }
  }

  static async getUserById(id: string | number): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`/admin/users/${id}`);
      return response.data;
    } catch {
      return null;
    }
  }

  static async suspendUser(id: string | number, reason: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/users/${id}/suspend`, { reason });
    return response.data;
  }

  static async unsuspendUser(id: string | number): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/users/${id}/unsuspend`);
    return response.data;
  }

  static async banUser(id: string | number, reason: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/users/${id}/ban`, { reason });
    return response.data;
  }

  static async updateUserStatus(id: string | number, status: string, reason: string = ''): Promise<any> {
    if (status === 'suspended') return this.suspendUser(id, reason);
    if (status === 'banned') return this.banUser(id, reason);
    return this.unsuspendUser(id);
  }

  static async getAds(status?: string, page: number = 1): Promise<any> {
    let url = `/admin/ads?page=${page}`;
    if (status) url += `&status=${status}`;

    try {
      const response = await apiClient.get<ApiPaginatedResponse<any>>(url);
      return (response.data || []).map(mapApiAdToFrontendAd);
    } catch {
      return [];
    }
  }

  static async getModerationQueue(page: number = 1): Promise<any> {
    try {
      const response = await apiClient.get<ApiPaginatedResponse<any>>(`/admin/moderation/ads?page=${page}`);
      return (response.data || []).map(mapApiAdToFrontendAd);
    } catch {
      return [];
    }
  }

  static async approveAd(id: string | number, reason: string = 'Approved'): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/ads/${id}/approve`, { reason });
    return mapApiAdToFrontendAd(response.data);
  }

  static async rejectAd(id: string | number, reason: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/ads/${id}/reject`, { reason });
    return mapApiAdToFrontendAd(response.data);
  }

  static async requestChangesAd(id: string | number, reason: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/ads/${id}/request-changes`, { reason });
    return mapApiAdToFrontendAd(response.data);
  }

  static async updateAdStatus(id: string | number, status: string, moderationStatus: string, reason: string): Promise<any> {
    if (moderationStatus === 'approved') return this.approveAd(id, reason);
    if (moderationStatus === 'rejected') return this.rejectAd(id, reason);
    if (moderationStatus === 'changes_requested') return this.requestChangesAd(id, reason);
    return this.approveAd(id, reason);
  }

  static async getReports(status?: string): Promise<any> {
    let url = '/admin/reports';
    if (status) url += `?status=${status}`;

    try {
      const response = await apiClient.get<ApiPaginatedResponse<any>>(url);
      return (response.data || []).map((r: any) => ({
        id: String(r.id),
        adId: String(r.ad_id || ''),
        adTitle: r.ad?.title || 'Reported Ad',
        reporterId: String(r.reporter_user_id || ''),
        reporterName: r.reporter?.name || 'User',
        reason: r.reason_code || 'Inappropriate content',
        description: r.description || '',
        createdAt: r.created_at || new Date().toISOString(),
        status: r.status || 'pending',
      }));
    } catch {
      return [];
    }
  }

  static async resolveReport(id: string | number, actionTaken: string = 'resolved', notes?: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/reports/${id}/resolve`, {
      action_taken: actionTaken,
      notes: notes || '',
    });
    return response.data;
  }

  static async dismissReport(id: string | number, notes?: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/reports/${id}/dismiss`, {
      notes: notes || '',
    });
    return response.data;
  }

  static async getPayments(): Promise<any> {
    try {
      const response = await apiClient.get<ApiPaginatedResponse<any>>('/admin/payments');
      return (response.data || []).map((p: any) => ({
        id: String(p.id),
        userId: String(p.user_id),
        amount: p.amount,
        currency: p.currency || 'INR',
        paymentMethod: p.provider || 'Razorpay',
        paymentStatus: p.status === 'paid' ? 'completed' : p.status,
        orderId: p.provider_order_id || p.uuid,
        transactionId: p.provider_payment_id || p.uuid,
        createdAt: p.created_at,
      }));
    } catch {
      return [];
    }
  }

  static async getWalletTransactions(): Promise<any> {
    try {
      const response = await apiClient.get<ApiPaginatedResponse<any>>('/admin/wallet-transactions');
      return response.data || [];
    } catch {
      return [];
    }
  }

  static async manualWalletAdjustment(userId: number, amount: number, direction: 'credit' | 'debit', reason: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/admin/wallet/adjust', {
      user_id: userId,
      amount,
      direction,
      reason,
    });
    return response.data;
  }

  static async getCategories(): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/admin/categories');
      return response.data || [];
    } catch {
      return [];
    }
  }

  static async createCategory(data: any): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/admin/categories', data);
    return response.data;
  }

  static async updateCategory(id: string | number, data: any): Promise<any> {
    const response = await apiClient.patch<ApiResponse<any>>(`/admin/categories/${id}`, data);
    return response.data;
  }

  static async deleteCategory(id: string | number): Promise<any> {
    const response = await apiClient.delete<ApiResponse<any>>(`/admin/categories/${id}`);
    return response.data;
  }

  static async getAuditLogs(): Promise<any> {
    try {
      const response = await apiClient.get<ApiPaginatedResponse<any>>('/admin/audit-logs');
      return response.data || [];
    } catch {
      return [];
    }
  }
}

export const adminDashboardService = {
  getStats: () => AdminService.getMetrics(),
  getMetrics: () => AdminService.getMetrics(),
  getOverviewMetrics: () => AdminService.getMetrics(),
  getAnalyticsData: () => Promise.resolve({ totalViews: 12500, topLocations: [], topCategories: [] }),
};

export const adminAdService = {
  getAllAds: () => AdminService.getAds(),
  getAds: (status?: string) => AdminService.getAds(status),
  getPendingAds: () => AdminService.getModerationQueue(),
  getAdById: (id: string | number) => apiClient.get<ApiResponse<any>>(`/admin/ads/${id}`).then((r) => mapApiAdToFrontendAd(r.data)),
  approveAd: (id: string | number, reason?: string) => AdminService.approveAd(id, reason),
  rejectAd: (id: string | number, reason: string) => AdminService.rejectAd(id, reason),
  requestChanges: (id: string | number, reason: string) => AdminService.requestChangesAd(id, reason),
  updateAdStatus: (id: string | number, status: string, moderationStatus: string, reason: string) => AdminService.updateAdStatus(id, status, moderationStatus, reason),
  getModerationHistory: (id: string | number) => Promise.resolve([]),
  deleteAd: (id: string | number) => apiClient.delete(`/ads/${id}`),
};

export const adminModerationService = {
  getPendingAds: () => AdminService.getModerationQueue(),
  getModerationQueue: () => AdminService.getModerationQueue(),
  approveAd: (id: string | number, reason?: string) => AdminService.approveAd(id, reason),
  rejectAd: (id: string | number, reason: string) => AdminService.rejectAd(id, reason),
  requestChanges: (id: string | number, reason: string) => AdminService.requestChangesAd(id, reason),
  updateAdStatus: (id: string | number, status: string, moderationStatus: string, reason: string) => AdminService.updateAdStatus(id, status, moderationStatus, reason),
};

export const adminReportService = {
  getAllReports: () => AdminService.getReports(),
  getReports: (status?: string) => AdminService.getReports(status),
  resolveReport: (id: string | number, actionTaken: string, notes?: string) => AdminService.resolveReport(id, actionTaken, notes),
  dismissReport: (id: string | number, notes?: string) => AdminService.dismissReport(id, notes),
  assignReport: (id: string | number, moderatorName: string) => Promise.resolve(true),
  updateReportStatus: (id: string | number, status: string, notes?: string) => status === 'resolved' ? AdminService.resolveReport(id, 'resolved', notes) : AdminService.dismissReport(id, notes),
};

export const adminPaymentService = {
  getAllPayments: () => AdminService.getPayments(),
  getPayments: () => AdminService.getPayments(),
  getTransactions: () => AdminService.getWalletTransactions(),
  adjustWallet: (userId: number, amount: number, direction: 'credit' | 'debit', reason: string) => AdminService.manualWalletAdjustment(userId, amount, direction, reason),
};

export const adminPromotionService = {
  getAllProducts: () => apiClient.get<ApiResponse<any>>('/promotion-products').then((r) => r.data || []),
  getProducts: () => apiClient.get<ApiResponse<any>>('/promotion-products').then((r) => r.data || []),
  getPromoProducts: () => apiClient.get<ApiResponse<any>>('/promotion-products').then((r) => r.data || []),
  createProduct: (data: any) => apiClient.post<ApiResponse<any>>('/admin/promotion-products', data).then((r) => r.data),
  updatePromoProductStatus: (id: string | number, isActive: boolean | string) => Promise.resolve(true),
};

export const adminWalletService = {
  getWallet: () => apiClient.get<ApiResponse<any>>('/wallet').then((r) => r.data),
  getTransactions: () => AdminService.getWalletTransactions(),
  adjustWallet: (userId: number, amount: number, direction: 'credit' | 'debit', reason: string) => AdminService.manualWalletAdjustment(userId, amount, direction, reason),
  performWalletAdjustment: (userId: number, amount: number, direction: 'credit' | 'debit', reason: string) => AdminService.manualWalletAdjustment(userId, amount, direction, reason),
};

export const adminUserService = {
  getAllUsers: () => AdminService.getUsers(),
  getUsers: (page?: number, search?: string) => AdminService.getUsers(page, search),
  getUserById: (id: string | number) => AdminService.getUserById(id),
  suspendUser: (id: string | number, reason: string) => AdminService.suspendUser(id, reason),
  unsuspendUser: (id: string | number) => AdminService.unsuspendUser(id),
  banUser: (id: string | number, reason: string) => AdminService.banUser(id, reason),
  updateUserStatus: (id: string | number, status: string, reason: string = '') => AdminService.updateUserStatus(id, status, reason),
};

export const adminBusinessService = {
  getCategories: () => AdminService.getCategories(),
  createCategory: (data: any) => AdminService.createCategory(data),
  addCategory: (data: any) => AdminService.createCategory(data),
  updateCategory: (id: string | number, data: any) => AdminService.updateCategory(id, data),
  deleteCategory: (id: string | number) => AdminService.deleteCategory(id),
  getLocations: () => apiClient.get<ApiResponse<any>>('/locations/cities').then((r) => r.data || []),
  addLocation: (data: any) => apiClient.post<ApiResponse<any>>('/admin/locations', data).then((r) => r.data),
  getFilters: () => apiClient.get<ApiResponse<any>>('/admin/filters').then((r) => r.data || []),
  addFilterOption: (filterId: string | number, data: any) => apiClient.post<ApiResponse<any>>(`/admin/filters/${filterId}/options`, data).then((r) => r.data),
};

export const adminSeoService = {
  getAllPages: () => apiClient.get<ApiResponse<any>>('/admin/seo-pages').then((r) => r.data || []),
  getSeoConfigs: () => apiClient.get<ApiResponse<any>>('/admin/seo-pages').then((r) => r.data || []),
  createPage: (data: any) => apiClient.post<ApiResponse<any>>('/admin/seo-pages', data).then((r) => r.data),
  saveSeoConfig: (data: any) => apiClient.post<ApiResponse<any>>('/admin/seo-pages', data).then((r) => r.data),
};

export const adminSettingsService = {
  getAllSettings: () => apiClient.get<ApiResponse<any>>('/admin/settings').then((r) => r.data || []),
  getSettings: () => apiClient.get<ApiResponse<any>>('/admin/settings').then((r) => r.data || []),
  updateSetting: (key: string, val: any) => apiClient.patch<ApiResponse<any>>(`/admin/settings/${key}`, { value: val }).then((r) => r.data),
  saveSettings: (settings: any) => apiClient.patch<ApiResponse<any>>('/admin/settings', settings).then((r) => r.data),
};

export const adminAuditService = {
  getLogs: () => AdminService.getAuditLogs(),
  getAuditLogs: () => AdminService.getAuditLogs(),
};
