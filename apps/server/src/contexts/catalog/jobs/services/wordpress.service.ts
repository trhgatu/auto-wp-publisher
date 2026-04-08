import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

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
  ): Promise<string> {
    const wpBaseUrl =
      process.env.WP_API_URL || 'https://phutungoto123.vn/wp-json';
    const wcApiUrl = `${wpBaseUrl.replace(/\/wp\/v2\/?$/, '')}/wc/v3`;

    const wpUser = process.env.WP_USERNAME || 'phutungoto123';
    const wpPass = process.env.WP_APP_PASSWORD;

    if (!wpPass) {
      throw new Error(
        'Hệ thống thiếu WP_APP_PASSWORD. Vui lòng khai báo trong file .env',
      );
    }

    const authHeader =
      'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

    const numericPrice = price ? price.replace(/[^0-9]/g, '') : '';
    const endpoint = `${wcApiUrl}/products`;
    const requestBody = {
      name: title,
      type: 'simple',
      regular_price: numericPrice,
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(20000),
      });

      statusCode = response.status;
      responseBodyText = await response.clone().text();

      if (!response.ok) {
        throw new Error(
          `WooCommerce từ chối: [Mã ${statusCode}] - Phản hồi: ${responseBodyText}`,
        );
      }

      const data = (await response.json()) as {
        id: number;
        permalink: string;
      };

      return data.permalink;
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
            method: 'POST',
            endpoint: endpoint,
            requestHeader: JSON.stringify({
              'Content-Type': 'application/json',
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
}
