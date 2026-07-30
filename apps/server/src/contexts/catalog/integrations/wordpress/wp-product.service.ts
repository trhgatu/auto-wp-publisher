import { Injectable, Logger } from '@nestjs/common';
import { WpApiClient } from './wp-api.client';
import { WpCategoryService } from './wp-category.service';
import { WpBrandService } from './wp-brand.service';
import { MediaUploadService } from '../media/media-upload.service';

export interface PublishProductParams {
  title: string;
  rawContent: string | null;
  price?: string | null;
  material?: string | null;
  carModels?: string | null;
  shopeeLink?: string | null;
  lazadaLink?: string | null;
  tiktokLink?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
  galleryImageUrls?: string | null;
  categoryName?: string | null;
  tags?: string | null;
  brand?: string | null;
  shortDescription?: string | null;
  existingWpId?: number | null;
}

@Injectable()
export class WpProductService {
  private readonly logger = new Logger(WpProductService.name);

  constructor(
    private readonly client: WpApiClient,
    private readonly categoryService: WpCategoryService,
    private readonly brandService: WpBrandService,
    private readonly mediaUploadService: MediaUploadService,
  ) {}

  async publishProduct(
    params: PublishProductParams,
  ): Promise<{ id: number; permalink: string }> {
    const {
      title,
      rawContent,
      price = null,
      material = null,
      carModels = null,
      shopeeLink = null,
      lazadaLink = null,
      tiktokLink = null,
      videoUrl = null,
      imageUrl = null,
      galleryImageUrls = null,
      categoryName = null,
      tags = null,
      brand = null,
      shortDescription = null,
      existingWpId = null,
    } = params;

    const words = title.split(/[-|/]/)[0].trim().split(/\s+/);
    const focusKeyword = words.slice(0, Math.min(4, words.length)).join(' ');

    const wcApiUrl = await this.client.getWcApiUrl();
    const isUpdate = existingWpId != null;
    const endpoint = isUpdate
      ? `${wcApiUrl}/products/${existingWpId}`
      : `${wcApiUrl}/products`;

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
          categoryId = await this.categoryService.getOrCreateCategoryId(name);
        }

        if (categoryId) {
          categories.push({ id: categoryId });
        }
      }
    }

    const wpTags: { id: number }[] = [];
    if (tags) {
      const tagIds = await this.getOrCreateTags(tags, wcApiUrl);
      for (const id of tagIds) {
        wpTags.push({ id });
      }
    }

    const wpBrands: { id: number }[] = [];
    if (brand) {
      const names = brand
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '');

      for (const name of names) {
        const isNumeric = /^\d+$/.test(name);
        let brandId: number | null = null;

        if (isNumeric) {
          brandId = parseInt(name, 10);
        } else {
          brandId = await this.brandService.getOrCreateBrandId(name);
        }

        if (brandId) {
          wpBrands.push({ id: brandId });
        }
      }
    }

    const numericPrice = price ? price.replace(/[^0-9]/g, '') : '';
    let descriptionWithImages =
      rawContent ||
      `<p>Sản phẩm "${title}" vừa được khởi tạo bởi Auto Publisher.</p>`;

    let imagesHtml = '';

    if (imageUrl && this.client.isValidUrl(imageUrl)) {
      imagesHtml += `<div style="text-align: center; margin: 20px 0;"><img class="aligncenter" src="${imageUrl.trim()}" alt="${title}" style="max-width: 350px; width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: inline-block;" /></div>`;
    }

    if (galleryImageUrls) {
      const gUrls = galleryImageUrls
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url !== '' && this.client.isValidUrl(url));

      if (gUrls.length > 0) {
        const isFour = gUrls.length === 4;
        const gridStyle = isFour
          ? 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; max-width: 520px; margin: 20px auto;'
          : 'display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 12px; margin: 20px 0;';

        imagesHtml += `<div style="${gridStyle}">`;
        gUrls.forEach((gUrl, idx) => {
          const imgStyle = isFour
            ? 'width: 100%; height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.06); display: block;'
            : 'width: 160px; height: 160px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.06); display: inline-block;';

          imagesHtml += `<a href="${gUrl}" target="_blank" style="display: block; text-decoration: none;"><img src="${gUrl}" alt="${title} - Ảnh ${idx + 1}" style="${imgStyle}" /></a>`;
        });
        imagesHtml += `</div>`;
      }
    }

    if (imagesHtml) {
      descriptionWithImages +=
        `<hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" /><h3 style="text-align: center; margin-bottom: 15px;">Hình ảnh thực tế sản phẩm</h3>` +
        imagesHtml;
    }

    const resolveWpImage = async (
      url: string,
    ): Promise<{ id?: number; src?: string }> => {
      const trimmedUrl = url.trim();
      const cachedId = this.mediaUploadService.getAttachmentIdByUrl(trimmedUrl);
      if (cachedId) {
        this.logger.log(
          `📌 Linked image directly from cache to WordPress Media ID: ${cachedId}`,
        );
        return { id: cachedId };
      }

      try {
        const filename = trimmedUrl.split('/').pop()?.split('?')[0];
        if (filename) {
          const cleanFilename = filename.replace(/\.[^/.]+$/, '');
          const settings = await this.client.getSettings();
          const wpBaseUrl = settings.apiUrl
            .replace(/\/$/, '')
            .replace(/\/wp\/v2\/?$/, '')
            .replace(/\/wp-json\/?$/, '');
          const searchRes = await this.client.fetch(
            `${wpBaseUrl}/wp-json/wp/v2/media?search=${encodeURIComponent(cleanFilename)}&per_page=5`,
          );
          if (searchRes.ok) {
            const mediaList = (await searchRes.json()) as {
              id: number;
              source_url: string;
              status?: string;
            }[];
            const matched = mediaList.find(
              (m) =>
                (m.source_url === trimmedUrl ||
                  m.source_url.includes(cleanFilename)) &&
                m.status !== 'trash',
            );
            if (matched?.id) {
              this.logger.log(
                `📌 Linked image "${cleanFilename}" directly to WordPress Media ID: ${matched.id}`,
              );
              return { id: matched.id, src: trimmedUrl };
            }
          }
        }
      } catch (err) {
        this.logger.warn(
          `Could not resolve media ID for URL ${trimmedUrl}: ${String(err)}`,
        );
      }
      return { src: trimmedUrl };
    };

    const resolvedProductImages: { id?: number; src?: string }[] = [];

    if (imageUrl && this.client.isValidUrl(imageUrl)) {
      resolvedProductImages.push(await resolveWpImage(imageUrl));
    }

    if (galleryImageUrls) {
      const gUrls = galleryImageUrls
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url !== '' && this.client.isValidUrl(url));

      for (const gUrl of gUrls) {
        resolvedProductImages.push(await resolveWpImage(gUrl));
      }
    }

    const requestBody = {
      name: title,
      type: 'simple',
      regular_price: numericPrice,
      categories: categories,
      brands: wpBrands,
      tags: wpTags,
      description: descriptionWithImages,
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
        // RankMath SEO
        { key: 'rank_math_title', value: `%title%` },
        { key: 'rank_math_description', value: `%excerpt%` },
        { key: 'rank_math_focus_keyword', value: focusKeyword },

        // Yoast SEO
        { key: '_yoast_wpseo_title', value: `%%title%%` },
        { key: '_yoast_wpseo_metadesc', value: `%%excerpt%%` },
        { key: '_yoast_wpseo_focuskw', value: focusKeyword },

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
              { key: 'dt_product_video_size', value: '900x900' },
              { key: '_product_video_size', value: '900x900' },
              { key: 'product_video_size', value: '900x900' },
              { key: '_dt_product_video_size', value: '900x900' },
              { key: '_product_video_placement', value: 'lightbox' },
              { key: '_dt_product_video_placement', value: 'lightbox' },
            ]
          : []),
      ],
      images: resolvedProductImages,
      status: 'publish',
      manage_stock: false,
      stock_status: 'instock',
    };

    let response = await this.client.fetch(
      endpoint,
      {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      },
      60000,
    );

    let responseText = await response.text();

    if (
      !response.ok &&
      responseText.includes('woocommerce_product_invalid_image_id')
    ) {
      this.logger.warn(
        '⚠️ Detected invalid WooCommerce image ID error. Evicting stale media caches and retrying publish...',
      );
      this.mediaUploadService.clearAllCaches();

      requestBody.images = requestBody.images.map((img) =>
        img.src ? { src: img.src } : img,
      );

      response = await this.client.fetch(
        endpoint,
        {
          method: isUpdate ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        },
        60000,
      );
      responseText = await response.text();
    }

    if (!response.ok) {
      this.logger.error(
        `WooCommerce API Error: ${response.status} - ${responseText}`,
      );
      throw new Error(
        `WooCommerce API Error: ${response.status} - ${responseText}`,
      );
    }

    const data = JSON.parse(responseText) as {
      id?: number;
      permalink?: string;
    };

    if (!data.id) {
      throw new Error('WooCommerce API returned success but no product ID');
    }

    return {
      id: data.id,
      permalink: data.permalink || '',
    };
  }

  private async getOrCreateTags(
    tagsStr: string,
    wcApiUrl: string,
  ): Promise<number[]> {
    const tagNames = tagsStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '');
    const tagIds: number[] = [];

    for (const name of tagNames) {
      try {
        const searchRes = await this.client.fetch(
          `${wcApiUrl}/products/tags?search=${encodeURIComponent(name)}`,
        );

        if (searchRes.ok) {
          const searchData = (await searchRes.json()) as {
            id: number;
            name: string;
          }[];
          const exactMatch = searchData.find(
            (t) => t.name.toLowerCase() === name.toLowerCase(),
          );
          if (exactMatch) {
            tagIds.push(exactMatch.id);
            continue;
          }
        }

        const createRes = await this.client.fetch(`${wcApiUrl}/products/tags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });

        if (createRes.ok) {
          const newTag = (await createRes.json()) as { id: number };
          tagIds.push(newTag.id);
        }
      } catch (err) {
        this.logger.warn(`Could not get/create Tag "${name}":`, err);
      }
    }

    return tagIds;
  }
}
