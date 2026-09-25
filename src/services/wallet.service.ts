import { apiClient, ApiResponse, ApiPaginatedResponse } from '../lib/api/client';
import { Wallet, WalletTransaction } from '../types/api';

export class WalletService {
  /**
   * Get user wallet balance from GET /api/v2/wallet
   */
  static async getWallet(forceRefresh = false): Promise<Wallet> {
    try {
      const response = await apiClient.get<ApiResponse<Wallet>>('/wallet', {
        forceRefresh,
        ttlMs: 30_000,
      });
      return response.data || { id: 0, uuid: '', user_id: 0, currency_code: 'INR', balance: 0, updated_at: '' };
    } catch {
      return { id: 0, uuid: '', user_id: 0, currency_code: 'INR', balance: 0, updated_at: '' };
    }
  }

  /**
   * Get transaction history logs from GET /api/v2/wallet/transactions
   */
  static async getTransactions(forceRefresh = false): Promise<WalletTransaction[]> {
    try {
      const response = await apiClient.get<ApiPaginatedResponse<WalletTransaction>>('/wallet/transactions', {
        forceRefresh,
        ttlMs: 30_000,
      });
      return response.data || [];
    } catch {
      return [];
    }
  }
}
