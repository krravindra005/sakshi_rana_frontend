export interface Country {
  id: string;
  name: string;
  slug: string;
  code?: string; // e.g. "IN"
}

export interface LocationState {
  id: string;
  name: string;
  slug: string;
  countryId: string;
}

// Alias Region/State to match future Laravel terminology
export type Region = LocationState;
export type State = LocationState;

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string; // Backward compatibility string
  country: string; // Backward compatibility string
  countryId?: string; // Hierarchical ID
  regionId?: string; // Hierarchical ID
  image: string;
  activeAdsCount: number;
}

export interface Area {
  id: string;
  name: string;
  slug: string;
  cityId: string;
  regionId?: string;
  countryId?: string;
}

