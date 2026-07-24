import { Injectable, Logger } from '@nestjs/common';
import { WpApiClient } from './wp-api.client';

export interface WpBrandItem {
  id: number;
  name: string;
  slug: string;
  parent: number;
}

@Injectable()
export class WpBrandService {
  private readonly logger = new Logger(WpBrandService.name);

  constructor(private readonly client: WpApiClient) {}

  async getBrands(): Promise<WpBrandItem[]> {
    try {
      const wcApiUrl = await this.client.getWcApiUrl();
      let page = 1;
      const allBrands: WpBrandItem[] = [];

      while (true) {
        const response = await this.client.fetch(
          `${wcApiUrl}/products/brands?per_page=100&page=${page}`,
          {},
          15000,
        );

        if (!response.ok) {
          if (page === 1) {
            this.logger.error(
              `Failed to fetch brands: ${response.status} ${response.statusText}`,
            );
          }
          break;
        }

        const data = (await response.json()) as WpBrandItem[];
        if (!Array.isArray(data) || data.length === 0) {
          break;
        }

        data.forEach((b) => {
          allBrands.push({
            id: b.id,
            name: b.name,
            slug: b.slug,
            parent: b.parent || 0,
          });
        });

        if (data.length < 100) {
          break;
        }
        page++;
      }

      return allBrands;
    } catch (error) {
      this.logger.error('Error fetching brands from WordPress', error);
      return [];
    }
  }

  async getOrCreateBrandId(name: string): Promise<number | null> {
    try {
      const wcApiUrl = await this.client.getWcApiUrl();
      const searchRes = await this.client.fetch(
        `${wcApiUrl}/products/brands?search=${encodeURIComponent(name)}`,
      );

      if (searchRes.ok) {
        const searchData = (await searchRes.json()) as WpBrandItem[];
        const exactMatch = searchData.find(
          (b) => b.name.toLowerCase() === name.toLowerCase(),
        );
        if (exactMatch) {
          return exactMatch.id;
        }
      }

      const createRes = await this.client.fetch(`${wcApiUrl}/products/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (createRes.ok) {
        const newBrand = (await createRes.json()) as WpBrandItem;
        return newBrand.id;
      }
    } catch (err) {
      this.logger.warn(`Could not get/create Brand "${name}":`, err);
    }
    return null;
  }
}
