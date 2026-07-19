import { Wallet, WalletTransaction } from '../types/user';
import { UsersService } from './users.service';

export class WalletService {
  /**
   * Get user wallet info
   */
  static async getWallet(): Promise<Wallet> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(UsersService.getWallet());
      }, 50);
    });
  }

  /**
   * Get transaction history logs
   */
  static async getTransactions(): Promise<WalletTransaction[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(UsersService.getTransactions());
      }, 50);
    });
  }

  /**
   * Deposit credits into wallet (or spend/refund)
   */
  static async updateBalance(amount: number, type: 'deposit' | 'spend' | 'credit' | 'debit' | 'refund', description: string): Promise<Wallet> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const legacyType = (type === 'spend' || type === 'debit') ? 'spend' : 'deposit';
        const wallet = UsersService.updateWalletBalance(amount, legacyType, description);
        resolve(wallet);
      }, 100);
    });
  }
}
