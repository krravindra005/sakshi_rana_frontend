import { Ad } from '../types/ad';
import { Advertisement as ApiAd } from '../types/api';

const FALLBACK_PROFILE_IMAGE = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600';

export function mapApiAdToFrontendAd(apiAd: any): Ad {
  if (!apiAd) return {} as Ad;

  // Extract cover image or first image from media array
  const mediaList = Array.isArray(apiAd.media) ? apiAd.media : [];
  const coverMedia = mediaList.find((m: any) => m.is_cover) || mediaList[0];
  const coverImageUrl = coverMedia?.thumbnail_path || coverMedia?.file_path || apiAd.profile_image || apiAd.cover_image || FALLBACK_PROFILE_IMAGE;
  
  const allImages = mediaList.map((m: any) => m.file_path).filter(Boolean);
  if (allImages.length === 0 && coverImageUrl) {
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
    placeOfService: Array.isArray(filterVals.placeOfService) ? filterVals.placeOfService : (filterVals.placeOfService ? [filterVals.placeOfService] : undefined),
  };

  const formattedDate = apiAd.published_at 
    ? new Date(apiAd.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
    : apiAd.created_at 
    ? new Date(apiAd.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
    : 'Recently';

  return {
    id: String(apiAd.id || apiAd.uuid),
    slug: apiAd.slug || String(apiAd.uuid || apiAd.id),
    userId: String(apiAd.user_id || ''),
    category: apiAd.category?.slug || (apiAd.category_id ? String(apiAd.category_id) : ''),
    categorySlug: apiAd.category?.slug || '',
    location: {
      countryId: String(apiAd.country_id || ''),
      regionId: String(apiAd.region_id || ''),
      cityId: String(apiAd.city_id || ''),
      areaId: apiAd.area_id ? String(apiAd.area_id) : undefined,
    },
    citySlug: apiAd.city?.slug || '',
    areaSlug: apiAd.area?.slug || undefined,
    title: apiAd.title || 'Untitled Advertisement',
    description: apiAd.description || '',
    images: allImages,
    coverImage: coverImageUrl,
    attributes: attrs,
    services: Array.isArray(apiAd.services) ? apiAd.services : [],
    contact: {
      phone: apiAd.contact_phone || apiAd.user?.phone || '',
      whatsapp: apiAd.contact_whatsapp || apiAd.contact_phone || '',
      email: apiAd.contact_email || apiAd.user?.email || '',
    },
    status: apiAd.status || 'published',
    moderationStatus: apiAd.moderation_status || 'approved',
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
