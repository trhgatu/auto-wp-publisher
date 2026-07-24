import { Injectable, Logger } from '@nestjs/common';
import { WpApiClient } from './wp-api.client';

export interface WpCategoryItem {
  id: number;
  name: string;
  slug: string;
  parent: number;
}

@Injectable()
export class WpCategoryService {
  private readonly logger = new Logger(WpCategoryService.name);

  constructor(private readonly client: WpApiClient) {}

  async getCategories(): Promise<WpCategoryItem[]> {
    try {
      const wcApiUrl = await this.client.getWcApiUrl();
      let page = 1;
      const allCategories: WpCategoryItem[] = [];

      while (true) {
        const response = await this.client.fetch(
          `${wcApiUrl}/products/categories?per_page=100&page=${page}`,
          {},
          15000,
        );

        if (!response.ok) {
          if (page === 1) {
            this.logger.error(
              `Failed to fetch categories: ${response.status} ${response.statusText}`,
            );
          }
          break;
        }

        const data = (await response.json()) as WpCategoryItem[];
        if (!Array.isArray(data) || data.length === 0) {
          break;
        }

        data.forEach((cat) => {
          allCategories.push({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            parent: cat.parent || 0,
          });
        });

        if (data.length < 100) {
          break;
        }
        page++;
      }

      return allCategories;
    } catch (error) {
      this.logger.error('Error fetching categories from WordPress', error);
      return [];
    }
  }

  async getOrCreateCategoryId(name: string): Promise<number | null> {
    try {
      const wcApiUrl = await this.client.getWcApiUrl();
      const searchRes = await this.client.fetch(
        `${wcApiUrl}/products/categories?search=${encodeURIComponent(name)}`,
      );

      if (searchRes.ok) {
        const searchData = (await searchRes.json()) as WpCategoryItem[];
        const exactMatch = searchData.find(
          (c) => c.name.toLowerCase() === name.toLowerCase(),
        );
        if (exactMatch) {
          return exactMatch.id;
        }
      }

      const createRes = await this.client.fetch(
        `${wcApiUrl}/products/categories`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        },
      );

      if (createRes.ok) {
        const newCat = (await createRes.json()) as WpCategoryItem;
        return newCat.id;
      }
    } catch (err) {
      this.logger.warn(`Could not get/create Category "${name}":`, err);
    }
    return null;
  }
}
