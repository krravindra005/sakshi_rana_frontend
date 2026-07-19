import { Ad, AdvertisementStatus, ModerationStatus, VerificationStatus } from '../types/ad';
import { User, WalletTransaction, TransactionType, Payment } from '../types/user';
import { Category, Subcategory } from '../types/category';
import { City, Region, Country } from '../types/location';
import { Filter } from '../types/filter';
import { mockAds } from '../data/mock-ads';

// -------------------------------------------------------------
// Helper to initialize LocalStorage with rich mock databases
// -------------------------------------------------------------
const getLocalStorage = <T>(key: string, defaultVal: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(data);
};

const setLocalStorage = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// 1. Users Database
const initialUsers: User[] = [
  {
    id: 'usr-101',
    email: 'elena.v@example.com',
    profile: {
      id: 'usr-101',
      name: 'Elena Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      email: 'elena.v@example.com',
      phone: '+91 99999 88888',
      joinedAt: 'July 2026',
      emailVerified: true,
      phoneVerified: true,
    },
    role: 'advertiser',
    status: 'active',
    createdAt: '2026-07-01T12:00:00Z',
  },
  {
    id: 'usr-102',
    email: 'marcus.brody@example.com',
    profile: {
      id: 'usr-102',
      name: 'Marcus Brody',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      email: 'marcus.brody@example.com',
      phone: '+91 91111 22222',
      joinedAt: 'June 2026',
      emailVerified: true,
      phoneVerified: false,
    },
    role: 'moderator',
    status: 'active',
    createdAt: '2026-06-15T09:30:00Z',
  },
  {
    id: 'usr-103',
    email: 'serena.gomez@example.com',
    profile: {
      id: 'usr-103',
      name: 'Serena Gomez',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      email: 'serena.gomez@example.com',
      phone: '+91 92222 33333',
      joinedAt: 'May 2026',
      emailVerified: true,
      phoneVerified: true,
    },
    role: 'advertiser',
    status: 'suspended',
    createdAt: '2026-05-10T14:45:00Z',
  },
  {
    id: 'usr-104',
    email: 'financial.admin@example.com',
    profile: {
      id: 'usr-104',
      name: 'Devon Keats',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      email: 'financial.admin@example.com',
      phone: '+91 93333 44444',
      joinedAt: 'January 2026',
      emailVerified: true,
      phoneVerified: true,
    },
    role: 'admin',
    status: 'active',
    createdAt: '2026-01-05T08:00:00Z',
  }
];

// 2. Initial Audit Logs
export interface AuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  role: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  details: string;
  previousValues?: any;
  newValues?: any;
}

const initialAuditLogs: AuditLog[] = [
  {
    id: 'aud-1',
    timestamp: '2026-07-19T10:15:00Z',
    adminName: 'Marcus Brody',
    role: 'Moderator',
    action: 'AD_APPROVE',
    entityType: 'ADVERTISEMENT',
    entityId: 'ad-1',
    ipAddress: '192.168.1.102',
    details: 'Approved listing "Elite Social & Dinner Companion" after full visual verification.',
    previousValues: { moderationStatus: 'pending' },
    newValues: { moderationStatus: 'approved' }
  },
  {
    id: 'aud-2',
    timestamp: '2026-07-18T16:30:00Z',
    adminName: 'Devon Keats',
    role: 'Finance',
    action: 'WALLET_ADJUST',
    entityType: 'WALLET',
    entityId: 'usr-101',
    ipAddress: '192.168.1.104',
    details: 'Credited 500 promotional credits for bug bounty rewards.',
    previousValues: { balance: 1000 },
    newValues: { balance: 1500 }
  }
];

// 3. Initial Reports Database
export interface AdminReport {
  id: string;
  reportedEntityId: string;
  entityType: 'AD' | 'USER';
  reason: string;
  description: string;
  reporter: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
  assignedModerator?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

const initialReports: AdminReport[] = [
  {
    id: 'rep-101',
    reportedEntityId: 'ad-1',
    entityType: 'AD',
    reason: 'Incorrect location representation',
    description: 'This provider specifies Delhi, but services are located outside Connaught Place boundary.',
    reporter: 'DiscreetUser220',
    createdAt: '2026-07-18T11:00:00Z',
    status: 'pending',
    assignedModerator: 'Marcus Brody',
    priority: 'medium'
  },
  {
    id: 'rep-102',
    reportedEntityId: 'usr-103',
    entityType: 'USER',
    reason: 'Profile impersonation suspected',
    description: 'The advertiser serial numbers do not match public identification.',
    reporter: 'AnonymousTrustWatch',
    createdAt: '2026-07-17T15:20:00Z',
    status: 'pending',
    priority: 'high'
  }
];

// 4. Initial Payments Database
const initialPayments: Payment[] = [
  {
    id: 'pay-501',
    userId: 'usr-101',
    amount: 1500,
    currency: 'INR',
    paymentMethod: 'UPI',
    paymentStatus: 'completed',
    orderId: 'pay_ord_33412',
    transactionId: 'txn-88129302',
    createdAt: '2026-07-18T14:10:00Z'
  },
  {
    id: 'pay-502',
    userId: 'usr-103',
    amount: 500,
    currency: 'INR',
    paymentMethod: 'Card',
    paymentStatus: 'failed',
    orderId: 'pay_ord_99012',
    transactionId: 'txn-failed-901',
    createdAt: '2026-07-16T10:05:00Z'
  }
];

// 5. Initial Ledger Wallet Transactions
const initialTransactions: WalletTransaction[] = [
  {
    id: 'tx-201',
    amount: 1500,
    type: 'credit',
    description: 'Deposit via UPI (Order #pay_ord_33412)',
    date: '2026-07-18T14:15:00Z',
    status: 'completed'
  },
  {
    id: 'tx-202',
    amount: 500,
    type: 'spend',
    description: 'Deduction for Featured companion (7 Days) - Ad #ad-1',
    date: '2026-07-18T15:00:00Z',
    status: 'completed'
  }
];

// 6. Initial SEO configs
export interface SeoPageConfig {
  id: string;
  pageType: 'category' | 'category-city' | 'custom';
  category: string;
  city?: string;
  url: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  introContent: string;
  bodyContent: string;
  canonicalUrl: string;
  indexStatus: 'index' | 'noindex';
  updatedAt: string;
}

const initialSeoConfigs: SeoPageConfig[] = [
  {
    id: 'seo-1',
    pageType: 'category',
    category: 'call-girls',
    url: '/call-girls',
    seoTitle: 'Premium Call Girls & Independent Escorts - Discreet Directory',
    metaDescription: 'Browse the leading independent call girls directory. verified companion listings, elite social dating, and discreet VIP services.',
    h1: 'Discreet Call Girl Companions',
    introContent: 'Welcome to our verified marketplace for premium call girls. Discover independent adult companions committed to excellence, safe meetings, and absolute discretion.',
    bodyContent: 'All our listings undergo rigorous identification and safety vetting. Filter companions by city, ethnicity, nationality, and service terms.',
    canonicalUrl: 'https://discreet-marketplace.example.com/call-girls',
    indexStatus: 'index',
    updatedAt: '2026-07-15T12:00:00Z'
  },
  {
    id: 'seo-2',
    pageType: 'category-city',
    category: 'call-girls',
    city: 'delhi',
    url: '/call-girls/delhi',
    seoTitle: 'Elite Call Girls in Delhi - Independent Delhi Escorts Vetted',
    metaDescription: 'Find verified call girls in Delhi. Elite independent companions, VIP social escorts, and therapeutic massage services in Delhi.',
    h1: ' Delhi Call Girls & Escorts',
    introContent: 'Discover the ultimate roster of independent Delhi companions and premium call girls. Elegant, educated, and completely private.',
    bodyContent: 'Connecting you to elite companions in Connaught Place, Karol Bagh, Vasant Kunj, and Greater Kailash.',
    canonicalUrl: 'https://discreet-marketplace.example.com/call-girls/delhi',
    indexStatus: 'index',
    updatedAt: '2026-07-18T09:30:00Z'
  }
];

// 7. Initial Settings
export interface AdminSettings {
  siteName: string;
  defaultCountry: string;
  currency: string;
  defaultExpirationDays: number;
  maxImages: number;
  maxImageSizeMb: number;
  requireApprovalBeforePublishing: boolean;
  requireReModerationAfterMajorEdit: boolean;
}

const defaultSettings: AdminSettings = {
  siteName: 'Discreet Marketplace',
  defaultCountry: 'India',
  currency: 'Credits',
  defaultExpirationDays: 30,
  maxImages: 10,
  maxImageSizeMb: 5,
  requireApprovalBeforePublishing: true,
  requireReModerationAfterMajorEdit: true
};

// 8. Promotions Catalog
export interface AdminPromoProduct {
  id: string;
  name: string;
  slug: string;
  placementType: string;
  priorityWeight: number;
  status: 'active' | 'inactive';
  durations: { days: number; price: number }[];
}

const initialPromoProducts: AdminPromoProduct[] = [
  {
    id: 'p-1',
    name: 'Homepage Featured Slider',
    slug: 'featured-homepage',
    placementType: 'Featured Carousel',
    priorityWeight: 10,
    status: 'active',
    durations: [
      { days: 1, price: 100 },
      { days: 7, price: 500 },
      { days: 30, price: 1500 }
    ]
  },
  {
    id: 'p-2',
    name: 'VIP Category Spotlight',
    slug: 'vip-category',
    placementType: 'Top Placements Banner',
    priorityWeight: 8,
    status: 'active',
    durations: [
      { days: 3, price: 250 },
      { days: 7, price: 500 },
      { days: 14, price: 900 }
    ]
  },
  {
    id: 'p-3',
    name: 'Daily Auto-Bump Boost',
    slug: 'daily-bump',
    placementType: 'Rank Priority Injection',
    priorityWeight: 5,
    status: 'active',
    durations: [
      { days: 7, price: 200 },
      { days: 30, price: 700 }
    ]
  }
];

// -------------------------------------------------------------
// Admin Service Abstractions
// -------------------------------------------------------------

// Active state logs
const logAdminAction = (action: string, entityType: string, entityId: string, details: string, previous?: any, newVals?: any) => {
  const logs = getLocalStorage<AuditLog[]>('admin_db_audit_logs', initialAuditLogs);
  const newLog: AuditLog = {
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    adminName: 'Marcus Brody', // Hardcoded active session mock admin
    role: 'Super Admin',
    action,
    entityType,
    entityId,
    ipAddress: '103.88.22.41',
    details,
    previousValues: previous,
    newValues: newVals
  };
  setLocalStorage('admin_db_audit_logs', [newLog, ...logs]);
};

// 1. Dashboard Service
export class adminDashboardService {
  static async getOverviewMetrics() {
    const users = getLocalStorage<User[]>('admin_db_users', initialUsers);
    const ads = await adminAdService.getAllAds();
    const reports = getLocalStorage<AdminReport[]>('admin_db_reports', initialReports);
    const payments = getLocalStorage<Payment[]>('admin_db_payments', initialPayments);

    const pendingMod = ads.filter(a => a.moderationStatus === 'pending').length;
    const openReports = reports.filter(r => r.status === 'pending').length;
    const activePromos = ads.filter(a => a.promotion?.status === 'active').length;
    const totalRev = payments
      .filter(p => p.paymentStatus === 'completed')
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      totalUsers: users.length,
      newUsers: users.filter(u => new Date(u.createdAt) > new Date('2026-07-01')).length,
      totalAds: ads.length,
      publishedAds: ads.filter(a => a.status === 'published').length,
      pendingModeration: pendingMod,
      openReports: openReports,
      activePromotions: activePromos,
      totalRevenue: totalRev,
    };
  }

  static async getAnalyticsData() {
    return {
      adGrowth: [
        { name: 'July 14', count: 18 },
        { name: 'July 15', count: 24 },
        { name: 'July 16', count: 32 },
        { name: 'July 17', count: 30 },
        { name: 'July 18', count: 42 },
        { name: 'July 19', count: 45 },
      ],
      userGrowth: [
        { name: 'July 14', advertisers: 4, moderators: 0 },
        { name: 'July 15', advertisers: 6, moderators: 0 },
        { name: 'July 16', advertisers: 8, moderators: 1 },
        { name: 'July 17', advertisers: 11, moderators: 0 },
        { name: 'July 18', advertisers: 15, moderators: 0 },
        { name: 'July 19', advertisers: 21, moderators: 0 },
      ],
      categoriesShare: [
        { name: 'Call Girls', value: 45 },
        { name: 'Massage', value: 30 },
        { name: 'Male Escorts', value: 15 },
        { name: 'Transsexual', value: 10 },
      ],
      cityDemographics: [
        { name: 'Delhi', ads: 55 },
        { name: 'Mumbai', ads: 42 },
        { name: 'Bangalore', ads: 28 },
        { name: 'Kolkata', ads: 12 },
        { name: 'Goa', ads: 20 },
      ],
      revenueLedger: [
        { name: 'July 14', revenue: 1000 },
        { name: 'July 15', revenue: 2500 },
        { name: 'July 16', revenue: 1500 },
        { name: 'July 17', revenue: 3200 },
        { name: 'July 18', revenue: 4500 },
        { name: 'July 19', revenue: 5000 },
      ]
    };
  }
}

// 2. Users Service
export class adminUserService {
  static async getUsers(): Promise<User[]> {
    return getLocalStorage<User[]>('admin_db_users', initialUsers);
  }

  static async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  static async updateUserStatus(id: string, status: 'active' | 'suspended', reason: string): Promise<User> {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    const previous = { ...users[index] };
    users[index].status = status;
    setLocalStorage('admin_db_users', users);

    logAdminAction(
      status === 'suspended' ? 'USER_SUSPEND' : 'USER_UNSUSPEND',
      'USER',
      id,
      `User ${status} due to: "${reason}"`,
      { status: previous.status },
      { status }
    );

    return users[index];
  }

  static async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const users = await this.getUsers();
    const newUser: User = {
      ...user,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    setLocalStorage('admin_db_users', users);
    return newUser;
  }
}

// 3. Advertisement Service
export class adminAdService {
  static async getAllAds(): Promise<Ad[]> {
    const userAdsJson = localStorage.getItem('marketplace_user_ads');
    const userAds: Ad[] = userAdsJson ? JSON.parse(userAdsJson) : [];
    
    // We combine mock ads and user ads. To make sure they have admin values, map defaults if not present
    const combined = [...userAds, ...mockAds].map(ad => ({
      ...ad,
      userId: ad.userId || 'usr-101',
      category: ad.category || ad.categorySlug,
      coverImage: ad.coverImage || ad.profileImage || ad.images[0] || '',
      status: ad.status || 'published',
      moderationStatus: ad.moderationStatus || 'approved',
      verification: ad.verification || { status: ad.isVerified ? 'verified' : 'unverified' },
      createdAt: ad.createdAt || new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: ad.updatedAt || new Date().toISOString()
    }));
    return combined;
  }

  static async getAdById(id: string): Promise<Ad | null> {
    const ads = await this.getAllAds();
    return ads.find(a => a.id === id) || null;
  }

  static async updateAdStatus(
    id: string, 
    status: AdvertisementStatus, 
    modStatus: ModerationStatus, 
    reason?: string
  ): Promise<Ad> {
    const ads = await this.getAllAds();
    // Since mockAds is imported from another module, we must save user updates to the user override key or update local override structure
    const localOverrideKey = 'marketplace_user_ads';
    const userAdsJson = localStorage.getItem(localOverrideKey);
    const userAds: Ad[] = userAdsJson ? JSON.parse(userAdsJson) : [];
    
    // Look for ad in existing local override first, if not exist copy from mockAds
    let targetIndex = userAds.findIndex(a => a.id === id);
    let targetAd: Ad;

    if (targetIndex === -1) {
      // Find in mockAds
      const mockAd = mockAds.find(a => a.id === id);
      if (!mockAd) throw new Error('Ad not found');
      targetAd = { ...mockAd };
      userAds.push(targetAd);
      targetIndex = userAds.length - 1;
    } else {
      targetAd = userAds[targetIndex];
    }

    const previous = { status: targetAd.status, moderationStatus: targetAd.moderationStatus };

    targetAd.status = status;
    targetAd.moderationStatus = modStatus;
    targetAd.updatedAt = new Date().toISOString();

    // Align backwards compatibility
    targetAd.isVerified = targetAd.verification?.status === 'verified';
    if (status === 'published') {
      targetAd.publishedAt = new Date().toISOString();
    }

    localStorage.setItem(localOverrideKey, JSON.stringify(userAds));

    // Record moderation log
    const modHistKey = `mod_hist_${id}`;
    const history = getLocalStorage<any[]>(modHistKey, []);
    history.unshift({
      action: modStatus,
      moderator: 'Marcus Brody',
      date: new Date().toISOString(),
      reason: reason || 'Routine verification audit check.'
    });
    setLocalStorage(modHistKey, history);

    logAdminAction(
      `AD_MODERATE_${modStatus.toUpperCase()}`,
      'ADVERTISEMENT',
      id,
      `Moderator evaluated ad. Reason: "${reason || 'None provided'}"`,
      previous,
      { status, moderationStatus: modStatus }
    );

    return targetAd;
  }

  static async getModerationHistory(id: string): Promise<any[]> {
    return getLocalStorage<any[]>(`mod_hist_${id}`, [
      {
        action: 'approved',
        moderator: 'Marcus Brody',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        reason: 'Initial profile credentials and facial matching passed standards.'
      }
    ]);
  }
}

// 4. Moderation Queue Service
export class adminModerationService {
  static async getModerationQueue(): Promise<Ad[]> {
    const ads = await adminAdService.getAllAds();
    return ads.filter(a => a.moderationStatus === 'pending');
  }
}

// 5. Reports Service
export class adminReportService {
  static async getReports(): Promise<AdminReport[]> {
    return getLocalStorage<AdminReport[]>('admin_db_reports', initialReports);
  }

  static async getReportById(id: string): Promise<AdminReport | null> {
    const reports = await this.getReports();
    return reports.find(r => r.id === id) || null;
  }

  static async updateReportStatus(id: string, status: 'resolved' | 'dismissed', notes: string): Promise<AdminReport> {
    const reports = await this.getReports();
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Report not found');

    const previous = { status: reports[index].status };
    reports[index].status = status;
    reports[index].notes = notes;
    setLocalStorage('admin_db_reports', reports);

    logAdminAction(
      `REPORT_${status.toUpperCase()}`,
      'REPORT',
      id,
      `Report resolved with action: ${status}. Notes: "${notes}"`,
      previous,
      { status }
    );

    return reports[index];
  }

  static async assignReport(id: string, moderator: string): Promise<AdminReport> {
    const reports = await this.getReports();
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Report not found');

    reports[index].assignedModerator = moderator;
    reports[index].status = 'pending';
    setLocalStorage('admin_db_reports', reports);

    return reports[index];
  }
}

// 6. Category Service
export class adminCategoryService {
  static async getCategories(): Promise<Category[]> {
    // Dynamically lazy-require CategoriesService
    const { CategoriesService } = await import('./categories.service');
    return CategoriesService.getAll();
  }

  static async saveCategory(cat: Category): Promise<Category> {
    // Simulated save
    logAdminAction('CATEGORY_UPDATE', 'CATEGORY', cat.id, `Updated category ${cat.name}`);
    return cat;
  }
}

// 7. Filter & Attribute Service
export class adminFilterService {
  static async getFilters(): Promise<Filter[]> {
    const { FiltersService } = await import('./filters.service');
    return FiltersService.getByCategory();
  }
}

// 8. Location Service
export class adminLocationService {
  static async getCountries(): Promise<Country[]> {
    const { LocationsService } = await import('./locations.service');
    return LocationsService.getCountries();
  }

  static async getRegions(countryId: string): Promise<Region[]> {
    const { LocationsService } = await import('./locations.service');
    return LocationsService.getStatesByCountry(countryId);
  }

  static async getCities(): Promise<City[]> {
    const { LocationsService } = await import('./locations.service');
    return LocationsService.getCities();
  }
}

// 9. Promotions Service
export class adminPromotionService {
  static async getPromoProducts(): Promise<AdminPromoProduct[]> {
    return getLocalStorage<AdminPromoProduct[]>('admin_db_promo_products', initialPromoProducts);
  }

  static async updatePromoProductStatus(id: string, status: 'active' | 'inactive'): Promise<AdminPromoProduct> {
    const products = await this.getPromoProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');

    products[index].status = status;
    setLocalStorage('admin_db_promo_products', products);

    logAdminAction('PROMO_PRODUCT_TOGGLE', 'PROMOTION_PRODUCT', id, `Promo product toggled to ${status}`);
    return products[index];
  }
}

// 10. Payments Service
export class adminPaymentService {
  static async getPayments(): Promise<Payment[]> {
    return getLocalStorage<Payment[]>('admin_db_payments', initialPayments);
  }
}

// 11. Wallet Service
export class adminWalletService {
  static async getTransactions(): Promise<WalletTransaction[]> {
    return getLocalStorage<WalletTransaction[]>('admin_db_wallet_transactions', initialTransactions);
  }

  static async performWalletAdjustment(
    userId: string, 
    amount: number, 
    direction: 'credit' | 'debit', 
    reason: string
  ): Promise<void> {
    const transactions = await this.getTransactions();
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      amount,
      type: direction === 'credit' ? 'credit' : 'spend',
      description: `Manual admin adjustment: ${reason}`,
      date: new Date().toISOString(),
      status: 'completed'
    };
    transactions.unshift(newTx);
    setLocalStorage('admin_db_wallet_transactions', transactions);

    logAdminAction(
      'WALLET_ADJUST',
      'WALLET',
      userId,
      `Adjusted wallet balance by ${direction === 'credit' ? '+' : '-'}${amount} credits. Reason: ${reason}`
    );
  }
}

// 12. SEO Service
export class adminSeoService {
  static async getSeoConfigs(): Promise<SeoPageConfig[]> {
    return getLocalStorage<SeoPageConfig[]>('admin_db_seo_configs', initialSeoConfigs);
  }

  static async getSeoById(id: string): Promise<SeoPageConfig | null> {
    const configs = await this.getSeoConfigs();
    return configs.find(c => c.id === id) || null;
  }

  static async saveSeoConfig(config: SeoPageConfig): Promise<SeoPageConfig> {
    const configs = await this.getSeoConfigs();
    const index = configs.findIndex(c => c.id === config.id);

    const updated = {
      ...config,
      updatedAt: new Date().toISOString()
    };

    if (index === -1) {
      configs.push(updated);
    } else {
      configs[index] = updated;
    }

    setLocalStorage('admin_db_seo_configs', configs);
    logAdminAction('SEO_CONFIG_SAVE', 'SEO', config.id, `Saved SEO tags for target path ${config.url}`);
    return updated;
  }
}

// 13. Settings Service
export class adminSettingsService {
  static async getSettings(): Promise<AdminSettings> {
    return getLocalStorage<AdminSettings>('admin_db_settings', defaultSettings);
  }

  static async saveSettings(settings: AdminSettings): Promise<AdminSettings> {
    const previous = await this.getSettings();
    setLocalStorage('admin_db_settings', settings);
    logAdminAction('SETTINGS_UPDATE', 'SYSTEM', 'global', 'Updated system configuration parameters.', previous, settings);
    return settings;
  }
}

// 14. Audit Service
export class adminAuditService {
  static async getAuditLogs(): Promise<AuditLog[]> {
    return getLocalStorage<AuditLog[]>('admin_db_audit_logs', initialAuditLogs);
  }
}
