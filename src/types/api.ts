export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'finance' | 'support' | 'advertiser';
  roles?: string[];
  permissions?: string[];
  status: 'active' | 'suspended' | 'banned';
  is_verified?: boolean;
  phone_verified_at?: string;
  email_verified_at?: string;
  created_at: string;
  profile?: UserProfileData;
  wallet_balance?: number;
}

export interface UserProfileData {
  avatar?: string;
  bio?: string;
  telegram?: string;
  whatsapp?: string;
  city?: string;
  country?: string;
}

export interface Category {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  cover_image?: string;
  parent_id?: number | null;
  sort_order: number;
  is_active: boolean;
  listing_count?: number;
  subcategories?: Category[];
}

export interface DynamicFilterOption {
  id: number;
  uuid: string;
  label: string;
  slug: string;
  value: string;
}

export interface DynamicFilter {
  id: number;
  uuid: string;
  key: string;
  label: string;
  type: 'single_select' | 'multi_select' | 'text' | 'boolean' | 'number' | 'range';
  searchable: boolean;
  required: boolean;
  options: DynamicFilterOption[];
}

export interface Country {
  id: number;
  uuid?: string;
  name: string;
  slug?: string;
  code?: string;
  iso2?: string;
  iso3?: string;
  phone_code?: string;
  currency_code?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface Region {
  id: number;
  uuid?: string;
  country_id: number;
  name: string;
  slug?: string;
  code?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface City {
  id: number;
  uuid?: string;
  region_id: number;
  name: string;
  slug: string;
  image?: string;
  is_featured?: boolean;
  sort_order?: number;
  ads_count?: number;
  active_ads_count?: number;
  is_active?: boolean;
  areas?: Area[];
}

export interface Area {
  id: number;
  uuid: string;
  city_id: number;
  name: string;
  slug: string;
  is_active?: boolean;
  sort_order?: number;
  city?: City & {
    region?: Region & {
      country?: Country;
    };
  };
  created_at?: string;
  updated_at?: string;
}

export interface MediaAsset {
  id: number;
  uuid: string;
  file_path: string;
  thumbnail_path?: string;
  mime_type: string;
  is_cover: boolean;
  sort_order: number;
  variants?: {
    original?: string;
    thumbnail?: string;
  };
}

export interface Advertisement {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  description: string;
  price?: number;
  status: 'draft' | 'pending' | 'pending_review' | 'approved' | 'published' | 'paused' | 'rejected' | 'expired';
  moderation_status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  user_id: number;
  category_id: number;
  country_id?: number;
  region_id?: number;
  city_id?: number;
  area_id?: number;
  view_count: number;
  favorite_count: number;
  is_featured: boolean;
  is_verified: boolean;
  contact_phone?: string;
  contact_whatsapp?: string;
  contact_email?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  expires_at?: string;
  category?: Category;
  city?: City;
  area?: Area;
  user?: User;
  media?: MediaAsset[];
  filter_values?: Record<string, any>;
}

export interface Favorite {
  id: number;
  uuid: string;
  user_id: number;
  ad_id: number;
  created_at: string;
  ad?: Advertisement;
}

export interface Wallet {
  id: number;
  uuid: string;
  user_id: number;
  currency_code: string;
  balance: number;
  updated_at: string;
  recent_transactions?: WalletTransaction[];
}

export interface WalletTransaction {
  id: number;
  uuid: string;
  wallet_id: number;
  type: string;
  direction: 'credit' | 'debit';
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  amount: number;
  balance_before?: number;
  balance_after?: number;
  reference_type?: string;
  reference_id?: string | number;
  description?: string;
  metadata?: any;
  created_by?: number;
  creator_name?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
}

export interface PointRequest {
  id: number;
  uuid: string;
  user_id: number;
  points: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: number;
  reviewed_at?: string;
  admin_notes?: string;
  wallet_transaction_id?: number;
  created_at: string;
  updated_at?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role?: string;
    current_balance?: number;
  };
  reviewer?: {
    id: number;
    name: string;
    email: string;
  };
  wallet_transaction?: WalletTransaction;
}

export interface AdPointRequirements {
  available_points: number;
  daily_points_required: number;
  user_daily_burn_rate: number;
  points_already_used: number;
  remaining_points: number;
  estimated_days_remaining: number;
  active_ads_count: number;
  total_ads_count: number;
}

export interface AdminPointStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  total_points_requested: number;
  total_points_approved: number;
  total_points_credited: number;
  total_points_debited: number;
  daily_rate: number;
  active_ads_consuming_points: number;
}

export interface ActiveAdPointUsage {
  id: number;
  uuid: string;
  title: string;
  status: string;
  paused_at?: string;
  daily_points_rate: number;
  points_consumed_total: number;
  last_point_debited_at?: string;
  points_depleted_reason?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    current_balance: number;
    days_remaining: number;
  };
}

export interface PromotionProduct {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  type: string;
  price: number;
  duration_days: number;
  is_active: boolean;
  durations?: PromotionDuration[];
}

export interface PromotionDuration {
  id: number;
  uuid: string;
  promotion_product_id: number;
  duration_days: number;
  price: number;
  label: string;
}

export interface PaymentOrder {
  id: number;
  uuid: string;
  provider: string;
  provider_order_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  metadata?: any;
}

export interface NotificationItem {
  id: number;
  uuid: string;
  type: string;
  title: string;
  message: string;
  read_at?: string | null;
  created_at: string;
}
