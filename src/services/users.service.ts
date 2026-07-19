import { UserProfile, UserWallet, WalletTransaction } from '../types/user';

export class UsersService {
  private static userKey = 'marketplace_user_profile';
  private static walletKey = 'marketplace_user_wallet';
  private static transactionsKey = 'marketplace_user_transactions';
  private static favoritesKey = 'marketplace_user_favorites';
  private static draftAdKey = 'marketplace_user_draft_ad';

  /**
   * Get current logged in user profile
   */
  static getProfile(): UserProfile {
    const defaultProfile: UserProfile = {
      id: 'usr-101',
      name: 'Elena Vance',
      email: 'elena.v@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      phone: '+91 99999 88888',
      joinedAt: 'July 2026',
      isLoggedIn: true,
      emailVerified: true,
      phoneVerified: true,
    };

    const stored = localStorage.getItem(this.userKey);
    if (!stored) {
      localStorage.setItem(this.userKey, JSON.stringify(defaultProfile));
      return defaultProfile;
    }
    return JSON.parse(stored);
  }

  /**
   * Check if a user is logged in
   */
  static isLoggedIn(): boolean {
    const profile = this.getProfile();
    return !!profile.isLoggedIn;
  }

  /**
   * Check if a user is fully verified
   */
  static isFullyVerified(): boolean {
    const profile = this.getProfile();
    return !!profile.emailVerified && !!profile.phoneVerified;
  }

  /**
   * Perform login
   */
  static login(emailOrPhone: string, password?: string): UserProfile {
    const profile = this.getProfile();
    profile.isLoggedIn = true;
    
    // If they log in back as the default mock user, make sure they are verified
    if (emailOrPhone === 'elena.v@example.com' || emailOrPhone === '+91 99999 88888') {
      profile.emailVerified = true;
      profile.phoneVerified = true;
    }

    localStorage.setItem(this.userKey, JSON.stringify(profile));
    window.dispatchEvent(new Event('auth_state_changed'));
    return profile;
  }

  /**
   * Perform registration
   */
  static register(data: { name: string, email: string, phone: string, password?: string }): UserProfile {
    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      isLoggedIn: true,
      emailVerified: false,
      phoneVerified: false,
      password: data.password || 'password',
    };

    localStorage.setItem(this.userKey, JSON.stringify(newProfile));
    
    // Reset wallet balance and txs for new user
    const newWallet = { balance: 500, currency: 'Credits' };
    localStorage.setItem(this.walletKey, JSON.stringify(newWallet));
    localStorage.setItem(this.transactionsKey, JSON.stringify([]));

    window.dispatchEvent(new Event('auth_state_changed'));
    return newProfile;
  }

  /**
   * Verify email
   */
  static verifyEmail(): UserProfile {
    const profile = this.getProfile();
    profile.emailVerified = true;
    localStorage.setItem(this.userKey, JSON.stringify(profile));
    window.dispatchEvent(new Event('auth_state_changed'));
    return profile;
  }

  /**
   * Verify phone
   */
  static verifyPhone(): UserProfile {
    const profile = this.getProfile();
    profile.phoneVerified = true;
    localStorage.setItem(this.userKey, JSON.stringify(profile));
    window.dispatchEvent(new Event('auth_state_changed'));
    return profile;
  }

  /**
   * Perform logout
   */
  static logout(): void {
    const profile = this.getProfile();
    profile.isLoggedIn = false;
    localStorage.setItem(this.userKey, JSON.stringify(profile));
    window.dispatchEvent(new Event('auth_state_changed'));
  }

  /**
   * Update user profile
   */
  static updateProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(this.userKey, JSON.stringify(updated));
    return updated;
  }

  /**
   * Get user wallet info
   */
  static getWallet(): UserWallet {
    const defaultWallet: UserWallet = {
      balance: 1500, // credits/INR
      currency: 'Credits',
    };

    const stored = localStorage.getItem(this.walletKey);
    if (!stored) {
      localStorage.setItem(this.walletKey, JSON.stringify(defaultWallet));
      return defaultWallet;
    }
    return JSON.parse(stored);
  }

  /**
   * Top-up / spend from wallet
   */
  static updateWalletBalance(amount: number, type: 'deposit' | 'spend', description: string): UserWallet {
    const wallet = this.getWallet();
    const transactions = this.getTransactions();

    if (type === 'spend' && wallet.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    wallet.balance = type === 'deposit' ? wallet.balance + amount : wallet.balance - amount;
    localStorage.setItem(this.walletKey, JSON.stringify(wallet));

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      amount,
      type,
      description,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'completed',
    };

    localStorage.setItem(this.transactionsKey, JSON.stringify([newTx, ...transactions]));
    return wallet;
  }

  /**
   * Get wallet transaction history
   */
  static getTransactions(): WalletTransaction[] {
    const defaultTx: WalletTransaction[] = [
      { id: 'tx-1', amount: 500, type: 'spend', description: 'Promoted ad Aria Premium Companion to Featured', date: 'Jul 15, 2026', status: 'completed' },
      { id: 'tx-2', amount: 2000, type: 'deposit', description: 'Topped up via UPI Transfer', date: 'Jul 12, 2026', status: 'completed' },
      { id: 'tx-3', amount: 100, type: 'spend', description: 'Renewed advertisement listing Elena Professional', date: 'Jul 01, 2026', status: 'completed' }
    ];

    const stored = localStorage.getItem(this.transactionsKey);
    if (!stored) {
      localStorage.setItem(this.transactionsKey, JSON.stringify(defaultTx));
      return defaultTx;
    }
    return JSON.parse(stored);
  }

  /**
   * Toggle ad as favorite
   */
  static toggleFavorite(adId: string): string[] {
    const favorites = this.getFavorites();
    let updated: string[];
    if (favorites.includes(adId)) {
      updated = favorites.filter((id) => id !== adId);
    } else {
      updated = [...favorites, adId];
    }
    localStorage.setItem(this.favoritesKey, JSON.stringify(updated));
    return updated;
  }

  /**
   * Get list of favorite ad IDs
   */
  static getFavorites(): string[] {
    const stored = localStorage.getItem(this.favoritesKey);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Local autosave draft ad
   */
  static saveDraftAd(data: any): void {
    localStorage.setItem(this.draftAdKey, JSON.stringify(data));
  }

  /**
   * Retrieve local draft ad
   */
  static getDraftAd(): any | null {
    const stored = localStorage.getItem(this.draftAdKey);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Clear draft ad after submitting
   */
  static clearDraftAd(): void {
    localStorage.removeItem(this.draftAdKey);
  }
}
