import { Ad } from '../types/ad';
import { Advertisement as ApiAd } from '../types/api';

export function mapApiAdToFrontendAd(apiAd: any): Ad {
  if (!apiAd) return {} as Ad;

  // Extract cover image or first image from media array
  const mediaList = Array.isArray(apiAd.media) ? apiAd.media : [];
  const coverMedia = mediaList.find((m: any) => m.is_cover) || mediaList[0];
  const coverImageUrl = coverMedia?.thumbnail_path || coverMedia?.file_path || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600';
  
  const allImages = mediaList.map((m: any) => m.file_path).filter(Boolean);
  if (allImages.length === 0) {
    allImages.push(coverImageUrl);
  }

  // Extract filter values
  const filterVals = apiAd.filter_values || {};
  const attrs = {
    nationality: filterVals.nationality || filterVals.nationalities || 'Indian',
    ethnicity: filterVals.ethnicity || filterVals.ethnicities || 'Asian',
    bodyType: filterVals.bodyType || filterVals.body_type || 'Slim',
    hairColor: filterVals.hairColor || filterVals.hair_color || 'Black',
    intendedAudience: filterVals.intendedAudience || filterVals.audience || 'Men',
    placeOfService: Array.isArray(filterVals.placeOfService) ? filterVals.placeOfService : (filterVals.placeOfService ? [filterVals.placeOfService] : ['Incall', 'Outcall']),
    ...filterVals,
  };

  const formattedDate = apiAd.created_at ? new Date(apiAd.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';

  return {
    id: String(apiAd.id || apiAd.uuid),
    slug: apiAd.slug || String(apiAd.uuid || apiAd.id),
    userId: String(apiAd.user_id || ''),
    category: apiAd.category?.slug || String(apiAd.category_id || 'escorts'),
    categorySlug: apiAd.category?.slug || 'escorts',
    location: {
      countryId: String(apiAd.country_id || '1'),
      regionId: String(apiAd.region_id || '1'),
      cityId: String(apiAd.city_id || '1'),
      areaId: apiAd.area_id ? String(apiAd.area_id) : undefined,
    },
    citySlug: apiAd.city?.slug || 'delhi',
    areaSlug: apiAd.area?.slug || undefined,
    title: apiAd.title || 'Untitled Advertisement',
    description: apiAd.description || '',
    images: allImages,
    coverImage: coverImageUrl,
    attributes: attrs,
    services: Array.isArray(apiAd.services) ? apiAd.services : ['Massage', 'Companion'],
    contact: {
      phone: apiAd.contact_phone || apiAd.user?.phone || '+91 99999 88888',
      whatsapp: apiAd.contact_whatsapp || apiAd.contact_phone || '+91 99999 88888',
      email: apiAd.contact_email || apiAd.user?.email || 'contact@example.com',
    },
    status: apiAd.status || 'published',
    moderationStatus: apiAd.moderation_status || 'approved',
    viewsCount: apiAd.view_count || 0,
    viewCount: apiAd.view_count || 0,
    favoriteCount: apiAd.favorite_count || 0,
    isVerified: !!(apiAd.is_verified || apiAd.verification_status === 'verified'),
    isFeatured: !!apiAd.is_featured,
    postedAt: formattedDate,
    profileName: apiAd.title || apiAd.user?.name || 'Verified Advertiser',
    profileImage: coverImageUrl,
    createdAt: apiAd.created_at,
    updatedAt: apiAd.updated_at,
  };
}
