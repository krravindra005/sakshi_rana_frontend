export type AdvertisementStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'paused' | 'expired';
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';
export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface AdvertisementImage {
  id: string;
  url: string;
  isCover: boolean;
  sortOrder: number;
}

export interface AdvertisementAttribute {
  id: string;
  name: string;
  value: string | string[];
}

export interface Service {
  id: string;
  name: string;
  category?: string;
}

export interface Report {
  id: string;
  adId: string;
  userId?: string;
  reason: string;
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  cost: number;
  durationDays: number;
  type: 'featured' | 'bump' | 'vip';
}

export interface AdAttributes {
  nationality: string;
  ethnicity: string;
  bodyType: string;
  hairColor: string;
  intendedAudience: string;
  placeOfService: string[]; // e.g. ["Provider location", "Customer location", "Hotel"]
  [key: string]: any;
}

export interface AdContact {
  phone: string;
  whatsapp: string;
  email?: string;
}

export interface Advertisement {
  id: string;
  slug: string;
  userId?: string;
  category?: string; // ID or Slug of the category
  categorySlug: string; // Backward compatibility
  location?: {
    countryId: string;
    regionId: string;
    cityId: string;
    areaId?: string;
  };
  citySlug: string; // Backward compatibility
  areaSlug?: string; // Backward compatibility
  title: string;
  description: string;
  images: string[];
  coverImage?: string;
  attributes: AdAttributes; // Backward compatibility
  adAttributes?: AdvertisementAttribute[]; // Future normalized attributes
  services: string[]; // Backward compatibility / list of service names
  adServices?: Service[]; // Future normalized services
  contact: AdContact;
  verification?: {
    status: VerificationStatus;
    verifiedAt?: string;
  };
  promotion?: {
    status: 'active' | 'inactive';
    type?: string;
    expiresAt?: string;
  };
  status?: AdvertisementStatus;
  moderationStatus?: ModerationStatus;
  viewCount?: number;
  viewsCount: number; // Backward compatibility
  favoriteCount?: number;
  isVerified: boolean; // Backward compatibility
  isFeatured: boolean; // Backward compatibility
  postedAt: string; // Backward compatibility
  profileName: string; // Backward compatibility
  profileImage: string; // Backward compatibility
  publishedAt?: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}


// Support Ad as an alias of Advertisement for perfect backward compatibility
export type Ad = Advertisement;

// Presentation and utility models
export interface AdvertisementCard {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  citySlug: string;
  isVerified: boolean;
  isFeatured: boolean;
  postedAt: string;
  viewsCount: number;
  categorySlug: string;
}

export interface AdvertisementDetail extends Advertisement {
  isFavorite?: boolean;
}

export interface AdvertisementFormData {
  category: string;
  location: {
    countryId: string;
    regionId: string;
    cityId: string;
    areaId?: string;
  };
  title: string;
  description: string;
  profileName: string;
  profileImage: string;
  images: string[];
  attributes: {
    nationality: string;
    ethnicity: string;
    bodyType: string;
    hairColor: string;
    intendedAudience: string;
    placeOfService: string[];
  };
  services: string[];
  contact: AdContact;
}

