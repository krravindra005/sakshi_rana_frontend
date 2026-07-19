export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  listingCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // Lucide icon identifier
  coverImage: string;
  description: string;
  listingCount: number;
  popularCities: string[];
  subcategories?: Subcategory[];
}

