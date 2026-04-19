import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

interface WooCommerceResponse {
  id?: number;
  permalink?: string;
  link?: string;
  url?: string;
  message?: string;
  code?: string;
  [key: string]: unknown;
}

export interface WCCategory {
  id: number;
  name: string;
  parent: number;
}

@Injectable()
export class WordPressService {
  private readonly logger = new Logger(WordPressService.name);

  constructor(private readonly prisma: PrismaService) {}

  async publishProduct(
    title: string,
    rawContent: string | null,
    price: string | null = null,
    material: string | null = null,
    carModels: string | null = null,
    shopeeLink: string | null = null,
    lazadaLink: string | null = null,
    tiktokLink: string | null = null,
    videoUrl: string | null = null,
    imageUrl: string | null = null,
    galleryImageUrls: string | null = null,
    categoryName: string | null = null,
    tags: string | null = null,
    shortDescription: string | null = null,
    existingWpId: number | null = null,
  ): Promise<{ id: number; permalink: string }> {
    const wpBaseUrl = process.env.WP_API_URL?.replace(/\/$/, '');

    if (!wpBaseUrl) {
      throw new Error(
        'Config missing: WP_API_URL must be defined in environment',
      );
    }

    const wcApiUrl = `${wpBaseUrl.replace(/\/wp\/v2\/?$/, '')}/wc/v3`;
    const isUpdate = existingWpId != null;
    const endpoint = isUpdate
      ? `${wcApiUrl}/products/${existingWpId}`
      : `${wcApiUrl}/products`;

    this.logger.debug(
      `Final WooCommerce Endpoint: ${endpoint} (Method: ${isUpdate ? 'PUT' : 'POST'})`,
    );

    const wpUser = process.env.WP_USERNAME;
    const wpPass = process.env.WP_APP_PASSWORD;

    if (!wpUser) {
      throw new Error(
        'Config missing: WP_USERNAME must be defined in environment',
      );
    }

    if (!wpPass) {
      throw new Error(
        'Hệ thống thiếu WP_APP_PASSWORD. Vui lòng khai báo trong file .env',
      );
    }

    const authHeader =
      'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

    const categories: { id: number }[] = [];
    if (categoryName) {
      const names = categoryName
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '');

      for (const name of names) {
        const isNumeric = /^\d+$/.test(name);
        let categoryId: number | null = null;

        if (isNumeric) {
          categoryId = parseInt(name, 10);
        } else {
          categoryId = await this.getOrCreateCategoryId(
            name,
            wcApiUrl,
            authHeader,
          );
        }

        if (categoryId) {
          categories.push({ id: categoryId });
        }
      }
    }
    const wpTags: { id: number }[] = [];
    if (tags) {
      const tagIds = await this.getOrCreateTags(tags, wcApiUrl, authHeader);
      for (const id of tagIds) {
        wpTags.push({ id });
      }
    }

    const numericPrice = price ? price.replace(/[^0-9]/g, '') : '';
    const requestBody = {
      name: title,
      type: 'simple',
      regular_price: numericPrice,
      categories: categories,
      tags: wpTags,
      description:
        rawContent ||
        `<p>Sản phẩm "${title}" vừa được khởi tạo bởi Auto Publisher.</p>`,
      short_description: shortDescription || '',
      attributes: [
        ...(material
          ? [
              {
                name: 'Chất liệu',
                visible: true,
                options: [material],
              },
            ]
          : []),
        ...(carModels
          ? [
              {
                name: 'Dòng xe',
                visible: true,
                options: [carModels],
              },
            ]
          : []),
      ],
      meta_data: [
        ...(shopeeLink
          ? [
              { key: 'shopee', value: shopeeLink },
              { key: '_shopee', value: shopeeLink },
              { key: 'Shopee', value: shopeeLink },
            ]
          : []),
        ...(lazadaLink
          ? [
              { key: 'lazada', value: lazadaLink },
              { key: '_lazada', value: lazadaLink },
              { key: 'Lazada', value: lazadaLink },
            ]
          : []),
        ...(tiktokLink
          ? [
              { key: 'tiktok', value: tiktokLink },
              { key: '_tiktok', value: tiktokLink },
              { key: 'Tiktok', value: tiktokLink },
            ]
          : []),
        ...(videoUrl
          ? [
              { key: 'youtube', value: videoUrl },
              { key: '_youtube', value: videoUrl },
              { key: 'video', value: videoUrl },
              { key: 'Video', value: videoUrl },
              { key: '_product_video', value: videoUrl },
              { key: 'product_video', value: videoUrl },
              { key: '_product_video_url', value: videoUrl },
              { key: 'product_video_url', value: videoUrl },
              { key: '_dt_product_video_url', value: videoUrl },
              { key: 'dt_product_video_url', value: videoUrl },
              { key: '_product_video_size', value: '900x900' },
              { key: 'product_video_size', value: '900x900' },
              { key: '_dt_product_video_size', value: '900x900' },
              { key: '_product_video_placement', value: 'lightbox' },
              { key: '_dt_product_video_placement', value: 'lightbox' },
            ]
          : []),
      ],
      images: [
        ...(imageUrl ? [{ src: imageUrl }] : []),
        ...(galleryImageUrls
          ? galleryImageUrls
              .split(',')
              .map((url) => ({ src: url.trim() }))
              .filter((img) => img.src !== '')
          : []),
      ],
      status: 'publish',
      manage_stock: false,
      stock_status: 'instock',
    };

    const startTime = Date.now();
    let statusCode = 0;
    let responseBodyText = '';
    let errorMessage = '';

    try {
      const response = await fetch(endpoint, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AutoPublisher/1.0',
          Authorization: authHeader,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(20000),
      });

      statusCode = response.status;
      responseBodyText = await response.clone().text();

      if (!response.ok) {
        this.logger.error(
          `WooCommerce API Error [${statusCode}]: ${responseBodyText}`,
        );
        const errorData = JSON.parse(responseBodyText) as WooCommerceResponse;

        const isInvalidIdError =
          errorData.code === 'woocommerce_rest_product_invalid_id' ||
          errorData.code === 'woocommerce_rest_product_invalid_object_id' ||
          (statusCode === 404 &&
            errorData.code === 'woocommerce_rest_product_not_found') ||
          errorData.message?.toLowerCase().includes('id không hợp lệ') ||
          errorData.message?.toLowerCase().includes('invalid id');

        if (isUpdate && isInvalidIdError) {
          this.logger.warn(
            `🚀 ID ${existingWpId} hỏng. Đang xóa trắng ID cũ trong DB và tạo bài mới...`,
          );
          try {
            await this.prisma.product.updateMany({
              where: { wpPostId: existingWpId },
              data: { wpPostId: null, errorLog: null },
            });
          } catch (dbErr) {
            this.logger.error(
              `Không thể xóa trắng ID hỏng trong DB: ${String(dbErr)}`,
            );
          }

          return this.publishProduct(
            title,
            rawContent,
            price,
            material,
            carModels,
            shopeeLink,
            lazadaLink,
            tiktokLink,
            videoUrl,
            imageUrl,
            galleryImageUrls,
            categoryName,
            tags,
            shortDescription,
            null,
          );
        }

        throw new Error(
          `WooCommerce từ chối: [Mã ${statusCode}] - Phản hồi: ${responseBodyText}`,
        );
      }

      const data = (await response.json()) as WooCommerceResponse;

      if (!data.id || (!data.permalink && !data.link)) {
        const msg = `WooCommerce không trả về ID sản phẩm. Có thể bị chặn hoặc lỗi cấu hình. Phản hồi: ${JSON.stringify(data)}`;
        this.logger.error(msg);
        throw new Error(msg);
      }

      return {
        id: data.id,
        permalink: data.permalink || data.link || data.url || 'URL_NOT_FOUND',
      };
    } catch (err: unknown) {
      errorMessage = err instanceof Error ? err.message : String(err);
      if (statusCode === 0) statusCode = 500;
      throw err;
    } finally {
      const duration = Date.now() - startTime;

      this.prisma.apiLog
        .create({
          data: {
            method: isUpdate ? 'PUT' : 'POST',
            endpoint: endpoint,
            requestHeader: JSON.stringify({
              'Content-Type': 'application/json; charset=utf-8',
              Accept: 'application/json',
              'User-Agent': '[HIDDEN]',
              Authorization: '[MASKED]',
            }),
            requestBody: JSON.stringify(requestBody),
            responseBody: responseBodyText || null,
            statusCode: statusCode,
            duration: duration,
            errorMessage: errorMessage || null,
          },
        })
        .catch((logErr: unknown) =>
          this.logger.error(
            `Failed to save API log: ${
              logErr instanceof Error ? logErr.message : String(logErr)
            }`,
          ),
        );
    }
  }

  async getCategories(): Promise<WCCategory[]> {
    const wpBaseUrl = process.env.WP_API_URL?.replace(/\/$/, '');

    if (!wpBaseUrl) {
      throw new Error(
        'Config missing: WP_API_URL must be defined in environment',
      );
    }
    const wcApiUrl = `${wpBaseUrl.replace(/\/wp\/v2\/?$/, '')}/wc/v3`;
    const wpUser = process.env.WP_USERNAME;
    const wpPass = process.env.WP_APP_PASSWORD;

    if (!wpUser) {
      throw new Error(
        'Config missing: WP_USERNAME must be defined in environment',
      );
    }

    if (!wpPass) {
      throw new Error('Hệ thống thiếu WP_APP_PASSWORD.');
    }

    const authHeader =
      'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

    const allCategories: WCCategory[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = `${wcApiUrl}/products/categories?per_page=100&page=${page}&hide_empty=false`;
      try {
        const response = await fetch(url, {
          headers: { Authorization: authHeader },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }

        const categories = (await response.json()) as WCCategory[];
        allCategories.push(...categories);

        const totalPages = parseInt(
          response.headers.get('X-WP-TotalPages') || '0',
          10,
        );
        if (page >= totalPages || categories.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      } catch (err) {
        this.logger.error(
          `Error fetching categories page ${page}: ${String(err)}`,
        );
        hasMore = false;
      }
    }

    return allCategories;
  }

  private categoryCache: Map<string, number> = new Map();
  private tagCache: Map<string, number> = new Map();

  private async getOrCreateCategoryId(
    path: string,
    apiUrl: string,
    auth: string,
  ): Promise<number | null> {
    const segments = path
      .split(/[>|/]/)
      .map((s) => s.trim())
      .filter((s) => s !== '');
    if (segments.length === 0) return null;

    let parentId = 0;
    for (const segment of segments) {
      const currentLevelId = await this.getOrCreateSingleCategory(
        segment,
        parentId,
        apiUrl,
        auth,
      );
      if (currentLevelId === null) return null;
      parentId = currentLevelId;
    }

    return parentId === 0 ? null : parentId;
  }

  private async getOrCreateSingleCategory(
    name: string,
    parentId: number,
    apiUrl: string,
    auth: string,
  ): Promise<number | null> {
    const cacheKey = `${parentId}:${name.toLowerCase()}`;
    const cachedId = this.categoryCache.get(cacheKey);
    if (cachedId) return cachedId;

    try {
      const searchUrl = `${apiUrl}/products/categories?search=${encodeURIComponent(name)}&parent=${parentId}`;
      const response = await fetch(searchUrl, {
        headers: { Authorization: auth },
      });

      if (response.ok) {
        const categories = (await response.json()) as WCCategory[];
        const exactMatch = categories.find(
          (c) => c.name.toLowerCase() === name.toLowerCase(),
        );

        if (exactMatch) {
          this.categoryCache.set(cacheKey, exactMatch.id);
          return exactMatch.id;
        }
      }

      this.logger.log(`Creating new category: ${name} (Parent: ${parentId})`);
      const createResponse = await fetch(`${apiUrl}/products/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: auth,
        },
        body: JSON.stringify({ name, parent: parentId }),
      });

      if (createResponse.ok) {
        const newCategory = (await createResponse.json()) as WCCategory;
        this.categoryCache.set(cacheKey, newCategory.id);
        return newCategory.id;
      }

      return null;
    } catch (err) {
      this.logger.error(
        `Error getOrCreateSingleCategory ${name}: ${String(err)}`,
      );
      return null;
    }
  }

  private async getOrCreateTags(
    tagsStr: string,
    apiUrl: string,
    auth: string,
  ): Promise<number[]> {
    const tagNames = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '');
    const tagIds: number[] = [];

    for (const name of tagNames) {
      const cachedId = this.tagCache.get(name);
      if (cachedId) {
        tagIds.push(cachedId);
        continue;
      }

      try {
        const searchUrl = `${apiUrl}/products/tags?search=${encodeURIComponent(name)}`;
        const response = await fetch(searchUrl, {
          headers: { Authorization: auth },
        });

        if (response.ok) {
          const tags = (await response.json()) as {
            id: number;
            name: string;
          }[];
          const exactMatch = tags.find(
            (t) => t.name.toLowerCase() === name.toLowerCase(),
          );

          if (exactMatch) {
            this.tagCache.set(name, exactMatch.id);
            tagIds.push(exactMatch.id);
            continue;
          }
        }

        this.logger.log(`Creating new tag: ${name}`);
        const createResponse = await fetch(`${apiUrl}/products/tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: auth,
          },
          body: JSON.stringify({ name }),
        });

        if (createResponse.ok) {
          const newTag = (await createResponse.json()) as { id: number };
          this.tagCache.set(name, newTag.id);
          tagIds.push(newTag.id);
        }
      } catch (err) {
        this.logger.error(`Error getOrCreateTag ${name}: ${String(err)}`);
      }
    }

    return tagIds;
  }
}
