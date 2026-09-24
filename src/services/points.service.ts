import { apiClient, ApiResponse, ApiPaginatedResponse } from '../lib/api/client';
import { PointRequest, AdPointRequirements, WalletTransaction } from '../types/api';

/**
 * Transforms a WalletTransaction into a PointRequest shape
 */
function mapTransactionToPointRequest(tx: WalletTransaction | any): PointRequest {
  return {
    id: tx.id,
    uuid: tx.uuid,
    user_id: tx.user?.id || tx.metadata?.user_id,
    points: Number(tx.amount || 0),
    reason: tx.metadata?.reason || tx.description || '',
    status: (tx.status as any) || 'pending',
    reviewed_by: tx.metadata?.reviewed_by,
    reviewed_at: tx.metadata?.reviewed_at,
    admin_notes: tx.metadata?.admin_notes || tx.metadata?.rejection_reason,
    created_at: tx.created_at,
    user: tx.user ? {
      id: tx.user.id,
      name: tx.user.name,
      email: tx.user.email,
      current_balance: tx.balance_before ?? 0,
    } : undefined,
  };
}

export class PointsService {
  /**
   * User: Submit a new point request to existing wallet_transactions
   */
  static async submitRequest(points: number, reason?: string): Promise<PointRequest> {
    const response = await apiClient.post<ApiResponse<WalletTransaction>>('/wallet/request-points', {
      points,
      reason,
    });
    return mapTransactionToPointRequest(response.data);
  }

  /**
   * User: Get user's own submitted point requests from existing wallet_transactions
   */
  static async getMyRequests(status?: string, page: number = 1): Promise<PointRequest[]> {
    try {
      let url = `/wallet/transactions?type=point_request&page=${page}`;
      if (status && status !== 'all') {
        url += `&status=${status}`;
      }
      const response = await apiClient.get<ApiPaginatedResponse<WalletTransaction>>(url);
      const items = response.data || [];
      return items.map(mapTransactionToPointRequest);
    } catch (err) {
      console.error('Failed to fetch user point requests from wallet transactions:', err);
      return [];
    }
  }

  /**
   * User: Get advertisement point requirements and wallet balance
   */
  static async getAdPointsRequirement(): Promise<AdPointRequirements> {
    try {
      const response = await apiClient.get<ApiResponse<AdPointRequirements>>('/wallet/ad-points-requirement');
      return response.data || {
        available_points: 0,
        daily_points_required: 100,
        user_daily_burn_rate: 0,
        points_already_used: 0,
        remaining_points: 0,
        estimated_days_remaining: 0,
        active_ads_count: 0,
        total_ads_count: 0,
      };
    } catch (err) {
      return {
        available_points: 0,
        daily_points_required: 100,
        user_daily_burn_rate: 0,
        points_already_used: 0,
        remaining_points: 0,
        estimated_days_remaining: 0,
        active_ads_count: 0,
        total_ads_count: 0,
      };
    }
  }

  /**
   * Admin: List point requests from existing wallet_transactions
   */
  static async getAdminRequests(status?: string, page: number = 1, search: string = ''): Promise<{
    data: PointRequest[];
    total: number;
    current_page: number;
    last_page: number;
  }> {
    try {
      let url = `/admin/wallet/point-requests?page=${page}`;
      if (status && status !== 'all') {
        url += `&status=${status}`;
      }
      if (search) {
        url += `&q=${encodeURIComponent(search)}`;
      }
      const response = await apiClient.get<ApiPaginatedResponse<WalletTransaction>>(url);
      const items = response.data || [];
      return {
        data: items.map(mapTransactionToPointRequest),
        total: response.meta?.total || items.length,
        current_page: response.meta?.current_page || 1,
        last_page: response.meta?.last_page || 1,
      };
    } catch (err) {
      console.error('Failed to fetch admin point requests from wallet transactions:', err);
      return { data: [], total: 0, current_page: 1, last_page: 1 };
    }
  }

  /**
   * Admin: Approve point request in wallet_transactions and credit user's wallet
   */
  static async approveRequest(id: number | string, adminNotes?: string): Promise<PointRequest> {
    const response = await apiClient.post<ApiResponse<WalletTransaction>>(`/admin/wallet/point-requests/${id}/approve`, {
      admin_notes: adminNotes,
    });
    return mapTransactionToPointRequest(response.data);
  }

  /**
   * Admin: Reject point request in wallet_transactions without crediting
   */
  static async rejectRequest(id: number | string, reason?: string): Promise<PointRequest> {
    const response = await apiClient.post<ApiResponse<WalletTransaction>>(`/admin/wallet/point-requests/${id}/reject`, {
      reason,
    });
    return mapTransactionToPointRequest(response.data);
  }

  /**
   * Admin: Get daily advertisement points setting
   */
  static async getAdPointSettings(): Promise<{ points_required_per_day: number }> {
    try {
      const response = await apiClient.get<ApiResponse<{ points_required_per_day: number }>>('/admin/wallet/ad-points');
      return response.data || { points_required_per_day: 100 };
    } catch {
      return { points_required_per_day: 100 };
    }
  }

  /**
   * Admin: Update daily advertisement points required
   */
  static async updateAdPointSettings(rate: number): Promise<{ points_required_per_day: number }> {
    const response = await apiClient.patch<ApiResponse<{ points_required_per_day: number }>>('/admin/wallet/ad-points', {
      points_required_per_day: rate,
    });
    return response.data;
  }
}
