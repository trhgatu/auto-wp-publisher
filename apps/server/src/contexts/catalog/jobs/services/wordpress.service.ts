import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WordPressService {
  private readonly logger = new Logger(WordPressService.name);

  /**
   * Đẩy bài viết thẳng lên WordPress thông qua REST API.
   * Yêu cầu biến môi trường: WP_API_URL, WP_USERNAME, WP_APP_PASSWORD.
   */
  async publishPost(title: string, rawContent: string | null): Promise<string> {
    const wpApiUrl =
      process.env.WP_API_URL || 'https://phutungoto123.vn/wp-json/wp/v2';
    const wpUser = process.env.WP_USERNAME || 'phutungoto123';
    const wpPass = process.env.WP_APP_PASSWORD;

    if (!wpPass) {
      throw new Error(
        'Hệ thống thiếu WP_APP_PASSWORD. Vui lòng khai báo trong file .env',
      );
    }

    this.logger.log(`Publishing real post: "${title}" to ${wpApiUrl}`);

    // Mã hoá chuỗi Base64 cho tiêu chuẩn Basic Auth của WordPress
    const authHeader =
      'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

    try {
      const response = await fetch(`${wpApiUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          title: title,
          content:
            rawContent ||
            `<p>Bài viết "${title}" vừa được khởi tạo bởi Auto Publisher.</p>`,
          status: 'publish', // Có thể đổi thành 'draft' nếu muốn lưu nháp trước
        }),
        signal: AbortSignal.timeout(15000), // Timeout tự động ngắt nếu WP ngâm HTTP quá 15 giây
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`WP Error: ${response.status} - ${errorText}`);
        throw new Error(
          `WordPress từ chối: [Mã ${response.status}] - Phản hồi: ${errorText}`,
        );
      }

      interface WPPostResponse {
        id: number;
        link: string;
      }

      const data = (await response.json()) as WPPostResponse;
      this.logger.log(
        `Successfully published "${title}" to WordPress! Post ID: ${data.id}`,
      );

      // Trả về Link bài viết thật trên web
      return data.link;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`Thất bại khi gọi API: ${errorMessage}`);
      throw new Error(
        `Kết nối bị từ chối hoặc quá hạn (Timeout): ${errorMessage}`,
      );
    }
  }
}
