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
  role?: string;
  roles?: string[];
  permissions?: string[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  profile: UserProfile;
  role: 'advertiser' | 'admin' | 'moderator' | 'user' | string;
  status: 'active' | 'suspended' | 'banned' | string;
  createdAt: string;
  [key: string]: any;
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
  type: string;
  direction?: 'credit' | 'debit';
  description: string;
  date?: string;
  created_at?: string;
  status: 'completed' | 'pending' | 'failed';
  balance_before?: number;
  balance_after?: number;
  reference_id?: string;
  created_by?: string | number;
  user?: {
    id: number | string;
    name: string;
    email: string;
  };
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

