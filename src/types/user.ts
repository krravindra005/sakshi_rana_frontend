export type TransactionType = 'credit' | 'debit' | 'promotion' | 'refund' | 'deposit' | 'spend';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  joinedAt: string;
  isLoggedIn?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  password?: string;
}

// User model containing profile and meta-information
export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  role: 'advertiser' | 'admin' | 'moderator' | 'user';
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Wallet {
  balance: number;
  currency: string;
  userId?: string;
}

// For backwards compatibility
export type UserWallet = Wallet;

export interface WalletTransaction {
  id: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Favorite {
  id: string;
  userId: string;
  adId: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  orderId?: string;
  transactionId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'system' | 'wallet' | 'promotion' | 'moderation' | 'alert';
  isRead: boolean;
  createdAt: string;
}

