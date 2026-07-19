import { Category } from '../types/category';
import { mockCategories } from '../data/mock-categories';

export class CategoriesService {
  /**
   * Fetch all categories
   */
  static async getAll(): Promise<Category[]> {
    // Simulating API latency
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockCategories]);
      }, 50);
    });
  }

  /**
   * Fetch a single category by its slug
   */
  static async getBySlug(slug: string): Promise<Category | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const category = mockCategories.find((c) => c.slug === slug);
        resolve(category ? { ...category } : null);
      }, 30);
    });
  }
}
