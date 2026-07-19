import { Filter, FilterOption } from '../types/filter';
import { mockFilterConfig } from '../data/mock-filters';

export class FiltersService {
  /**
   * Get dynamic filters applicable to a category
   */
  static async getByCategory(categorySlug?: string): Promise<Filter[]> {
    const allFilters: Filter[] = [
      {
        id: 'ethnicity',
        label: 'Ethnicity',
        type: 'multi-select',
        options: this.mapMetaToOptions('ethnicity', mockFilterConfig.ethnicities),
        categoryIds: ['call-girls', 'male-escorts', 'transsexual', 'adult-meetings']
      },
      {
        id: 'nationality',
        label: 'Nationality',
        type: 'multi-select',
        options: this.mapMetaToOptions('nationality', mockFilterConfig.nationalities),
        categoryIds: ['call-girls', 'massage', 'male-escorts', 'transsexual', 'adult-meetings']
      },
      {
        id: 'bodyType',
        label: 'Body Type',
        type: 'multi-select',
        options: this.mapMetaToOptions('bodyType', mockFilterConfig.bodyTypes),
        categoryIds: ['call-girls', 'male-escorts', 'transsexual', 'adult-meetings']
      },
      {
        id: 'hairColor',
        label: 'Hair Color',
        type: 'multi-select',
        options: this.mapMetaToOptions('hairColor', mockFilterConfig.hairColors),
        categoryIds: ['call-girls', 'male-escorts', 'transsexual']
      },
      {
        id: 'services',
        label: 'Services Offered',
        type: 'multi-select',
        options: this.mapMetaToOptions('services', mockFilterConfig.services),
        categoryIds: ['call-girls', 'massage', 'male-escorts', 'transsexual']
      },
      {
        id: 'intendedAudience',
        label: 'Intended Audience',
        type: 'multi-select',
        options: this.mapMetaToOptions('intendedAudience', mockFilterConfig.intendedAudiences),
        categoryIds: ['call-girls', 'massage', 'male-escorts', 'transsexual', 'adult-meetings']
      },
      {
        id: 'placeOfService',
        label: 'Place of Service',
        type: 'multi-select',
        options: this.mapMetaToOptions('placeOfService', mockFilterConfig.placesOfService),
        categoryIds: ['call-girls', 'massage', 'male-escorts', 'transsexual', 'adult-meetings']
      }
    ];

    if (!categorySlug) {
      return Promise.resolve(allFilters);
    }

    const slug = categorySlug.toLowerCase();
    return Promise.resolve(allFilters.filter((f) => !f.categoryIds || f.categoryIds.includes(slug)));
  }

  /**
   * Get specific filter option list by filter ID
   */
  static async getOptions(filterId: string): Promise<FilterOption[]> {
    const filters = await this.getByCategory();
    const found = filters.find((f) => f.id === filterId);
    return Promise.resolve(found ? found.options : []);
  }

  private static mapMetaToOptions(filterId: string, meta: { label: string; value: string }[]): FilterOption[] {
    return meta.map((m, index) => ({
      id: `${filterId}-opt-${index + 1}`,
      filterId,
      label: m.label,
      value: m.value
    }));
  }
}
