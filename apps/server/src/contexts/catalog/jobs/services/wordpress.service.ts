import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WordPressService {
  private readonly logger = new Logger(WordPressService.name);

  async publishProduct(
    title: string,
    rawContent: string | null,
    price: string | null = null,
    sku: string | null = null,
    material: string | null = null,
    carModels: string | null = null,
    shopeeLink: string | null = null,
    lazadaLink: string | null = null,
    tiktokLink: string | null = null,
    videoUrl: string | null = null,
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

    this.logger.log(
      `Publishing WooCommerce product: "${title}" to ${wcApiUrl}`,
    );

    const authHeader =
      'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

    const numericPrice = price ? price.replace(/[^0-9]/g, '') : '';

    try {
      const response = await fetch(`${wcApiUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          name: title,
          type: 'simple',
          regular_price: numericPrice,
          sku: sku || undefined,
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
            // Link Shopee
            ...(shopeeLink
              ? [
                  { key: 'shopee', value: shopeeLink },
                  { key: '_shopee', value: shopeeLink },
                  { key: 'Shopee', value: shopeeLink },
                ]
              : []),
            // Link Lazada
            ...(lazadaLink
              ? [
                  { key: 'lazada', value: lazadaLink },
                  { key: '_lazada', value: lazadaLink },
                  { key: 'Lazada', value: lazadaLink },
                ]
              : []),
            // Link Tiktok
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
          status: 'publish',
          manage_stock: false,
          stock_status: 'instock',
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `WooCommerce Error: ${response.status} - ${errorText}`,
        );
        throw new Error(
          `WooCommerce từ chối: [Mã ${response.status}] - Phản hồi: ${errorText}`,
        );
      }

      interface WCProductResponse {
        id: number;
        permalink: string;
      }

      const data = (await response.json()) as WCProductResponse;
      this.logger.log(
        `Successfully published product "${title}" to WooCommerce! ID: ${data.id}`,
      );

      return data.permalink;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`Thất bại khi gọi WooCommerce API: ${errorMessage}`);
      throw new Error(
        `Kết nối bị từ chối hoặc quá hạn (Timeout): ${errorMessage}`,
      );
    }
  }
}
