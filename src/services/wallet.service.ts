import { Wallet, WalletTransaction } from '../types/user';
import { apiClient, ApiResponse } from '../lib/api/client';
import { UsersService } from './users.service';

export class WalletService {
  /**
   * Get user wallet info from API V2
   */
  static async getWallet(): Promise<Wallet> {
    try {
      const response = await apiClient.get<ApiResponse<Wallet>>('/wallet');
      if (response.data) return response.data;
    } catch {
      // Fallback
    }
    return UsersService.getWallet();
  }

  /**
   * Get transaction history logs from API V2
   */
  static async getTransactions(): Promise<WalletTransaction[]> {
    try {
      const response = await apiClient.get<ApiResponse<WalletTransaction[]>>('/wallet/transactions');
      if (response.data) return response.data;
    } catch {
      // Fallback
    }
    return UsersService.getTransactions();
  }

  /**
   * Deposit credits into wallet via API V2
   */
  static async updateBalance(amount: number, type: 'deposit' | 'spend' | 'credit' | 'debit' | 'refund', description: string): Promise<Wallet> {
    try {
      const response = await apiClient.post<ApiResponse<{ balance: number; currency?: string }>>('/wallet/deposit', {
        amount,
        description,
      });

      if (response.data) {
        return {
          balance: response.data.balance,
          currency: response.data.currency || 'Credits',
        };
      }
    } catch {
      // Fallback
    }

    const legacyType = (type === 'spend' || type === 'debit') ? 'spend' : 'deposit';
    return UsersService.updateWalletBalance(amount, legacyType, description);
  }
}
