import { apiClient, ApiResponse } from '../lib/api/client';
import { User } from '../types/api';
import { UserProfile, UserWallet, WalletTransaction } from '../types/user';
import { AuthService } from './auth.service';
import { WalletService } from './wallet.service';
import { FavoritesService } from './favorites.service';

export class UsersService {
  private static userKey = 'marketplace_user_profile';
  private static favoritesKey = 'marketplace_user_favorites';
  private static draftAdKey = 'marketplace_user_draft_ad';

  static getProfile(): UserProfile {
    const defaultProfile: UserProfile = {
      id: 'usr-101',
      name: 'Verified Advertiser',
      email: 'advertiser@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      phone: '+91 98765 43210',
      joinedAt: 'July 2026',
      isLoggedIn: typeof window !== 'undefined' && !!localStorage.getItem('auth_token'),
      emailVerified: true,
      phoneVerified: true,
    };

    const stored = typeof window !== 'undefined' ? localStorage.getItem(this.userKey) : null;
    if (!stored) {
      return defaultProfile;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return defaultProfile;
    }
  }

  static isLoggedIn(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('auth_token');
  }

  static isFullyVerified(): boolean {
    return true;
  }

  static async login(emailOrPhone: string, password?: string): Promise<UserProfile> {
    const user = await AuthService.login(emailOrPhone, password);
    const profile: UserProfile = {
      id: String(user.id || user.uuid),
      name: user.name,
      email: user.email,
      phone: user.phone || '+91 98765 43210',
      avatar: user.profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      joinedAt: 'Recently',
      isLoggedIn: true,
      emailVerified: !!user.email_verified_at,
      phoneVerified: !!user.phone_verified_at,
      role: user.role || (user.roles && user.roles[0]) || 'advertiser',
      roles: user.roles || (user.role ? [user.role] : ['advertiser']),
      permissions: user.permissions || [],
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(profile));
      window.dispatchEvent(new Event('auth_state_changed'));
    }
    return profile;
  }

  static async register(data: { name: string; email: string; phone: string; password?: string }): Promise<UserProfile> {
    const user = await AuthService.register(data);
    const profile: UserProfile = {
      id: String(user.id || user.uuid),
      name: user.name,
      email: user.email,
      phone: user.phone || data.phone,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      joinedAt: 'Just now',
      isLoggedIn: true,
      emailVerified: false,
      phoneVerified: false,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(profile));
      window.dispatchEvent(new Event('auth_state_changed'));
    }
    return profile;
  }

  static async forgotPassword(email: string): Promise<string> {
    return await AuthService.forgotPassword(email);
  }

  static async resetPassword(data: { email: string; token: string; password: string; password_confirmation?: string }): Promise<string> {
    return await AuthService.resetPassword(data);
  }


  static async verifyEmail(): Promise<UserProfile> {
    const profile = this.getProfile();
    profile.emailVerified = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(profile));
      window.dispatchEvent(new Event('auth_state_changed'));
    }
    return profile;
  }

  static async verifyPhone(): Promise<UserProfile> {
    const profile = this.getProfile();
    profile.phoneVerified = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(profile));
      window.dispatchEvent(new Event('auth_state_changed'));
    }
    return profile;
  }

  static async logout(): Promise<void> {
    await AuthService.logout();
    FavoritesService.clearCache();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.userKey);
      localStorage.removeItem('auth_token');
      window.dispatchEvent(new Event('auth_state_changed'));
    }
  }

  static async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const current = this.getProfile();
    const updated = { ...current, ...profile };
    try {
      await apiClient.patch('/user/profile', profile);
    } catch {
      // Ignored
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(updated));
    }
    return updated;
  }

  static getWallet(): UserWallet {
    return {
      balance: 1500,
      currency: 'Credits',
    };
  }

  static async updateWalletBalance(amount: number, type: 'deposit' | 'spend', description: string): Promise<UserWallet> {
    if (type === 'deposit') {
      await apiClient.post('/payments/orders', { amount, currency: 'INR', provider: 'razorpay' });
    }
    const wallet = await WalletService.getWallet();
    return {
      balance: wallet.balance || 1500,
      currency: wallet.currency_code || 'Credits',
    };
  }

  static getTransactions(): WalletTransaction[] {
    return [
      { id: 'tx-1', amount: 500, type: 'spend', description: 'Promoted ad to Featured slider', date: 'Jul 15, 2026', status: 'completed' },
      { id: 'tx-2', amount: 2000, type: 'deposit', description: 'Topped up via Razorpay Transfer', date: 'Jul 12, 2026', status: 'completed' },
    ];
  }

  static toggleFavorite(adId: string): string[] {
    FavoritesService.toggle(adId);
    const favorites = this.getFavorites();
    const updated = favorites.includes(adId) ? favorites.filter((id) => id !== adId) : [...favorites, adId];
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.favoritesKey, JSON.stringify(updated));
    }
    return updated;
  }

  static getFavorites(): string[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.favoritesKey);
    return stored ? JSON.parse(stored) : [];
  }

  static saveDraftAd(data: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.draftAdKey, JSON.stringify(data));
    }
  }

  static getDraftAd(): any | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(this.draftAdKey);
    return stored ? JSON.parse(stored) : null;
  }

  static clearDraftAd(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.draftAdKey);
    }
  }
}
