import { FilterOptions } from './filter';

export interface AdvancedSearchState extends FilterOptions {
  q?: string;
  sortBy?: 'recommended' | 'latest' | 'most_viewed';
}

export interface FilterItemOption {
  label: string;
  value: string;
}

export interface FilterDefinition {
  id: string;
  label: string;
  iconName: string;
  isLarge?: boolean;
  options: FilterItemOption[];
}
