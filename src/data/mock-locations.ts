import { City, Area, Country, LocationState } from '../types/location';

export const mockCountries: Country[] = [
  { id: 'c-in', name: 'India', slug: 'india' }
];

export const mockStates: LocationState[] = [
  { id: 's-dl', name: 'Delhi NCR', slug: 'delhi-ncr', countryId: 'c-in' },
  { id: 's-mh', name: 'Maharashtra', slug: 'maharashtra', countryId: 'c-in' },
  { id: 's-ka', name: 'Karnataka', slug: 'karnataka', countryId: 'c-in' },
  { id: 's-tg', name: 'Telangana', slug: 'telangana', countryId: 'c-in' },
  { id: 's-wb', name: 'West Bengal', slug: 'west-bengal', countryId: 'c-in' },
  { id: 's-tn', name: 'Tamil Nadu', slug: 'tamil-nadu', countryId: 'c-in' },
  { id: 's-gj', name: 'Gujarat', slug: 'gujarat', countryId: 'c-in' },
  { id: 's-rj', name: 'Rajasthan', slug: 'rajasthan', countryId: 'c-in' },
  { id: 's-ga', name: 'Goa', slug: 'goa', countryId: 'c-in' }
];

export const mockCities: City[] = [
  {
    id: 'ct-delhi',
    name: 'Delhi',
    slug: 'delhi',
    state: 'Delhi NCR',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=600',
    activeAdsCount: 1840,
  },
  {
    id: 'ct-mumbai',
    name: 'Mumbai',
    slug: 'mumbai',
    state: 'Maharashtra',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&q=80&w=600',
    activeAdsCount: 2150,
  },
  {
    id: 'ct-bangalore',
    name: 'Bangalore',
    slug: 'bangalore',
    state: 'Karnataka',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80&w=600',
    activeAdsCount: 1530,
  },
  {
    id: 'ct-hyderabad',
    name: 'Hyderabad',
    slug: 'hyderabad',
    state: 'Telangana',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&q=80&w=600',
    activeAdsCount: 1210,
  },
  {
    id: 'ct-pune',
    name: 'Pune',
    slug: 'pune',
    state: 'Maharashtra',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1601919051950-bb9f3ffb3fee?auto=format&fit=crop&q=80&w=600',
    activeAdsCount: 980,
  },
  {
    id: 'ct-kolkata',
    name: 'Kolkata',
    slug: 'kolkata',
    state: 'West Bengal',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&q=80&w=600',
    activeAdsCount: 1100,
  },
  {
    id: 'ct-chennai',
    name: 'Chennai',
    slug: 'chennai',
    state: 'Tamil Nadu',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=600',
    activeAdsCount: 850,
  },
  {
    id: 'ct-ahmedabad',
    name: 'Ahmedabad',
    slug: 'ahmedabad',
    state: 'Gujarat',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1603251483977-e626c7208b52?auto=format&fit=crop&q=80&w=600',
    activeAdsCount: 720,
  },
  {
    id: 'ct-jaipur',
    name: 'Jaipur',
    slug: 'jaipur',
    state: 'Rajasthan',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1477584322902-471a53b9d433?auto=format&fit=crop&q=80&w=600',
    activeAdsCount: 610,
  },
  {
    id: 'ct-goa',
    name: 'Goa',
    slug: 'goa',
    state: 'Goa',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=600',
    activeAdsCount: 930,
  },
];

export const mockAreas: Area[] = [
  // Delhi
  { id: 'ar-cp', name: 'Connaught Place', slug: 'connaught-place', cityId: 'ct-delhi' },
  { id: 'ar-saket', name: 'Saket', slug: 'saket', cityId: 'ct-delhi' },
  { id: 'ar-kb', name: 'Karol Bagh', slug: 'karol-bagh', cityId: 'ct-delhi' },
  { id: 'ar-vk', name: 'Vasant Kunj', slug: 'vasant-kunj', cityId: 'ct-delhi' },
  { id: 'ar-dw', name: 'Dwarka', slug: 'dwarka', cityId: 'ct-delhi' },

  // Mumbai
  { id: 'ar-bandra', name: 'Bandra', slug: 'bandra', cityId: 'ct-mumbai' },
  { id: 'ar-andheri', name: 'Andheri West', slug: 'andheri-west', cityId: 'ct-mumbai' },
  { id: 'ar-colaba', name: 'Colaba', slug: 'colaba', cityId: 'ct-mumbai' },
  { id: 'ar-juhu', name: 'Juhu', slug: 'juhu', cityId: 'ct-mumbai' },
  { id: 'ar-worli', name: 'Worli', slug: 'worli', cityId: 'ct-mumbai' },

  // Bangalore
  { id: 'ar-ind', name: 'Indiranagar', slug: 'indiranagar', cityId: 'ct-bangalore' },
  { id: 'ar-kor', name: 'Koramangala', slug: 'koramangala', cityId: 'ct-bangalore' },
  { id: 'ar-wf', name: 'Whitefield', slug: 'whitefield', cityId: 'ct-bangalore' },
  { id: 'ar-jn', name: 'Jayanagar', slug: 'jayanagar', cityId: 'ct-bangalore' },
  { id: 'ar-mg', name: 'MG Road Area', slug: 'mg-road', cityId: 'ct-bangalore' },

  // Hyderabad
  { id: 'ar-gachibowli', name: 'Gachibowli', slug: 'gachibowli', cityId: 'ct-hyderabad' },
  { id: 'ar-jubileehills', name: 'Jubilee Hills', slug: 'jubilee-hills', cityId: 'ct-hyderabad' },
  { id: 'ar-banjarahills', name: 'Banjara Hills', slug: 'banjara-hills', cityId: 'ct-hyderabad' },
  { id: 'ar-hitechcity', name: 'HITECH City', slug: 'hitech-city', cityId: 'ct-hyderabad' },
  { id: 'ar-secunderabad', name: 'Secunderabad', slug: 'secunderabad', cityId: 'ct-hyderabad' },

  // Pune
  { id: 'ar-koregaon', name: 'Koregaon Park', slug: 'koregaon-park', cityId: 'ct-pune' },
  { id: 'ar-kalyani', name: 'Kalyani Nagar', slug: 'kalyani-nagar', cityId: 'ct-pune' },
  { id: 'ar-viman', name: 'Viman Nagar', slug: 'viman-nagar', cityId: 'ct-pune' },
  { id: 'ar-hinjewadi', name: 'Hinjewadi', slug: 'hinjewadi', cityId: 'ct-pune' },
  { id: 'ar-baner', name: 'Baner', slug: 'baner', cityId: 'ct-pune' },

  // Kolkata
  { id: 'ar-saltlake', name: 'Salt Lake', slug: 'salt-lake', cityId: 'ct-kolkata' },
  { id: 'ar-parkstreet', name: 'Park Street', slug: 'park-street', cityId: 'ct-kolkata' },
  { id: 'ar-newtown', name: 'New Town', slug: 'new-town', cityId: 'ct-kolkata' },
  { id: 'ar-alipore', name: 'Alipore', slug: 'alipore', cityId: 'ct-kolkata' },
  { id: 'ar-gariahat', name: 'Gariahat', slug: 'gariahat', cityId: 'ct-kolkata' },

  // Chennai
  { id: 'ar-adyar', name: 'Adyar', slug: 'adyar', cityId: 'ct-chennai' },
  { id: 'ar-t-nagar', name: 'T. Nagar', slug: 't-nagar', cityId: 'ct-chennai' },
  { id: 'ar-nugambakkam', name: 'Nungambakkam', slug: 'nungambakkam', cityId: 'ct-chennai' },
  { id: 'ar-omr', name: 'OMR Road', slug: 'omr-road', cityId: 'ct-chennai' },

  // Goa
  { id: 'ar-calangute', name: 'Calangute', slug: 'calangute', cityId: 'ct-goa' },
  { id: 'ar-baga', name: 'Baga Beach Area', slug: 'baga', cityId: 'ct-goa' },
  { id: 'ar-panaji', name: 'Panaji Center', slug: 'panaji', cityId: 'ct-goa' },
  { id: 'ar-candolim', name: 'Candolim', slug: 'candolim', cityId: 'ct-goa' },
];
