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

interface WCCategory {
  id: number;
  name: string;
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
    existingWpId: number | null = null,
  ): Promise<{ id: number; permalink: string }> {
    const wpBaseUrl = (
      process.env.WP_API_URL || 'https://phutungoto123.vn/wp-json'
    ).replace(/\/$/, '');

    const wcApiUrl = `${wpBaseUrl.replace(/\/wp\/v2\/?$/, '')}/wc/v3`;
    const isUpdate = existingWpId != null;
    const endpoint = isUpdate
      ? `${wcApiUrl}/products/${existingWpId}`
      : `${wcApiUrl}/products`;

    this.logger.debug(
      `Final WooCommerce Endpoint: ${endpoint} (Method: ${isUpdate ? 'PUT' : 'POST'})`,
    );

    const wpUser = process.env.WP_USERNAME || 'phutungoto123';
    const wpPass = process.env.WP_APP_PASSWORD;

    if (!wpPass) {
      throw new Error(
        'Hệ thống thiếu WP_APP_PASSWORD. Vui lòng khai báo trong file .env',
      );
    }

    const authHeader =
      'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

    // --- Xử lý Category ---
    const categories: { id: number }[] = [];
    if (categoryName) {
      const categoryId = await this.getCategoryIdByName(
        categoryName,
        wcApiUrl,
        authHeader,
      );
      if (categoryId) {
        categories.push({ id: categoryId });
      }
    }

    const numericPrice = price ? price.replace(/[^0-9]/g, '') : '';
    const requestBody = {
      name: title,
      type: 'simple',
      regular_price: numericPrice,
      categories: categories,
      description:
        rawContent ||
        `<p>Sản phẩm "${title}" vừa được khởi tạo bởi Auto Publisher.</p>`,
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

        // --- Sửa lỗi 400/404 ID không hợp lệ ---
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

          // Xóa trắng ID hỏng trong Database để lần sau không bị gọi lại nữa
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
            null, // Force create
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

      // Save log asynchronously to not block the main process
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

  private categoryCache: Map<string, number> = new Map();

  private async getCategoryIdByName(
    name: string,
    apiUrl: string,
    auth: string,
  ): Promise<number | null> {
    const cachedId = this.categoryCache.get(name);
    if (cachedId) return cachedId;

    try {
      // Tìm kiếm category theo name
      const searchUrl = `${apiUrl}/products/categories?search=${encodeURIComponent(name)}`;
      const response = await fetch(searchUrl, {
        headers: { Authorization: auth },
      });

      if (!response.ok) return null;

      const categories = (await response.json()) as WCCategory[];
      // Tìm chính xác tên (vì search có thể trả về kết quả gần đúng)
      const exactMatch = categories.find(
        (c) => c.name.toLowerCase() === name.toLowerCase(),
      );

      if (exactMatch) {
        this.categoryCache.set(name, exactMatch.id);
        return exactMatch.id;
      }
      return null;
    } catch (err) {
      this.logger.error(`Error fetching category ${name}: ${String(err)}`);
      return null;
    }
  }
}
