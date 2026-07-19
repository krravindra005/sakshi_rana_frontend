export interface FilterOption {
  id: string;
  filterId: string;
  label: string;
  value: string;
}

export interface Filter {
  id: string; // e.g., "ethnicity", "nationality"
  label: string; // e.g., "Ethnicity", "Nationality"
  type: 'select' | 'multi-select' | 'checkbox' | 'radio';
  options: FilterOption[];
  categoryIds?: string[]; // Categories where this filter applies
}

export interface FilterOptions {
  category?: string;
  country?: string;
  state?: string;
  city?: string;
  area?: string;
  nationality?: string[];
  ethnicity?: string[];
  bodyType?: string[];
  hairColor?: string[];
  services?: string[];
  intendedAudience?: string[];
  placeOfService?: string[];
}

export interface FilterMetaOption {
  label: string;
  value: string;
}

export interface FacetConfig {
  nationalities: FilterMetaOption[];
  ethnicities: FilterMetaOption[];
  bodyTypes: FilterMetaOption[];
  hairColors: FilterMetaOption[];
  services: FilterMetaOption[];
  intendedAudiences: FilterMetaOption[];
  placesOfService: FilterMetaOption[];
}

