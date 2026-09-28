import { Ad } from '../types/ad';
import { Advertisement as ApiAd } from '../types/api';

const FALLBACK_PROFILE_IMAGE = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600';

export function mapApiAdToFrontendAd(apiAd: any): Ad {
  if (!apiAd) return {} as Ad;

  // Extract cover image or first image from media array
  const mediaList = Array.isArray(apiAd.media) ? apiAd.media : [];
  const coverMedia = mediaList.find((m: any) => m.is_cover) || mediaList[0];
  const coverImageUrl = coverMedia?.url || coverMedia?.path || coverMedia?.thumbnail_path || coverMedia?.file_path || apiAd.profile_image || apiAd.cover_image || FALLBACK_PROFILE_IMAGE;
  
  const allImages = mediaList.map((m: any) => m.url || m.path || m.file_path).filter(Boolean);
  if (allImages.length === 0 && coverImageUrl && coverImageUrl !== FALLBACK_PROFILE_IMAGE) {
    allImages.push(coverImageUrl);
  } else if (allImages.length === 0) {
    allImages.push(coverImageUrl);
  }

  // Extract filter values dynamically from API
  const filterVals = apiAd.filters || apiAd.filter_values || {};
  const attrs = {
    ...filterVals,
    nationality: filterVals.nationality || filterVals.nationalities || undefined,
    ethnicity: filterVals.ethnicity || filterVals.ethnicities || undefined,
    bodyType: filterVals.bodyType || filterVals.body_type || undefined,
    hairColor: filterVals.hairColor || filterVals.hair_color || undefined,
    intendedAudience: filterVals.intendedAudience || filterVals.audience || undefined,
    placeOfService: Array.isArray(filterVals.placeOfService) 
      ? filterVals.placeOfService 
      : (filterVals.placeOfService ? [filterVals.placeOfService] : []),
  };

  const formattedDate = apiAd.published_at 
    ? new Date(apiAd.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
    : apiAd.created_at 
    ? new Date(apiAd.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
    : 'Recently';

  const categorySlug = apiAd.category?.slug || (typeof apiAd.category === 'string' ? apiAd.category : '');
  const categoryName = apiAd.category?.name || (categorySlug ? categorySlug.replace(/-/g, ' ') : 'Classified');

  const citySlug = apiAd.city?.slug || (typeof apiAd.city === 'string' ? apiAd.city : '');
  const cityName = apiAd.city?.name || (citySlug ? citySlug.replace(/-/g, ' ') : '');

  const areaSlug = apiAd.area?.slug || undefined;
  const areaName = apiAd.area?.name || (areaSlug ? areaSlug.replace(/-/g, ' ') : undefined);

  return {
    id: String(apiAd.id || apiAd.uuid),
    slug: apiAd.slug || String(apiAd.uuid || apiAd.id),
    userId: String(apiAd.user_id || apiAd.user?.id || ''),
    category: categoryName,
    categorySlug: categorySlug,
    location: {
      countryId: String(apiAd.country_id || ''),
      regionId: String(apiAd.region_id || ''),
      cityId: String(apiAd.city_id || ''),
      areaId: apiAd.area_id ? String(apiAd.area_id) : undefined,
    },
    citySlug: citySlug,
    cityName: cityName,
    areaSlug: areaSlug,
    areaName: areaName,
    price: apiAd.price ? Number(apiAd.price) : undefined,
    title: apiAd.title || 'Untitled Advertisement',
    description: apiAd.description || '',
    images: allImages,
    coverImage: coverImageUrl,
    attributes: attrs,
    services: Array.isArray(apiAd.services) ? apiAd.services : [],
    contact: {
      phone: apiAd.contact_phone || apiAd.user?.phone || '',
      whatsapp: apiAd.contact_whatsapp || apiAd.contact_phone || apiAd.user?.phone || '',
      email: apiAd.contact_email || apiAd.user?.email || '',
    },
    user: apiAd.user ? {
      id: String(apiAd.user.id || apiAd.user.uuid || ''),
      name: apiAd.user.name || apiAd.user.profile?.display_name || 'Advertiser',
      email: apiAd.user.email || '',
      avatar: apiAd.user.profile?.avatar || apiAd.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(apiAd.user.name || 'User')}&background=random`,
      phone: apiAd.user.phone || apiAd.contact_phone || '',
      createdAt: apiAd.user.created_at,
    } : undefined,
    status: apiAd.status || 'published',
    moderationStatus: apiAd.moderation_status || 'approved',
    rejectionReason: apiAd.rejection_reason || apiAd.reason || undefined,
    viewsCount: apiAd.view_count || 0,
    viewCount: apiAd.view_count || 0,
    favoriteCount: apiAd.favorite_count || 0,
    isVerified: !!(apiAd.is_verified || apiAd.verification_status === 'verified'),
    isFeatured: !!apiAd.is_featured,
    postedAt: formattedDate,
    profileName: apiAd.profile_name || apiAd.title || apiAd.user?.name || 'Verified Advertiser',
    profileImage: coverImageUrl,
    createdAt: apiAd.created_at,
    updatedAt: apiAd.updated_at,
  };
}

export function mapApiUserToFrontendUser(u: any): any {
  if (!u) return null;
  const profileName = u.profile?.display_name || u.name || 'User';
  const avatar = u.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName)}&background=random`;
  const phone = u.phone || u.profile?.phone || '';
  const joinedAt = u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Recently';

  return {
    id: String(u.id || u.uuid),
    uuid: u.uuid,
    name: u.name || profileName,
    email: u.email || '',
    role: u.role || 'user',
    status: u.status || 'active',
    createdAt: u.created_at || new Date().toISOString(),
    profile: {
      id: String(u.id || u.uuid),
      name: profileName,
      email: u.email || '',
      phone: phone,
      avatar: avatar,
      bio: u.profile?.bio || '',
      joinedAt: joinedAt,
      roles: Array.isArray(u.roles) ? u.roles.map((r: any) => typeof r === 'string' ? r : r.name) : (u.role ? [u.role] : []),
      permissions: u.permissions || [],
    },
    wallet: u.wallet ? {
      balance: Number(u.wallet.balance || 0),
      currency: u.wallet.currency || 'INR',
      userId: String(u.id || u.uuid),
    } : { balance: 0, currency: 'INR', userId: String(u.id || u.uuid) },
  };
}

