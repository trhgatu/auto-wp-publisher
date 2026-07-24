import { Injectable, Logger } from '@nestjs/common';
import { WpApiClient } from '../wordpress/wp-api.client';

@Injectable()
export class MediaUploadService {
  private readonly logger = new Logger(MediaUploadService.name);

  constructor(private readonly client: WpApiClient) {}

  async uploadToWordPress(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<string> {
    const settings = await this.client.getSettings();
    const wpBaseUrl = settings.apiUrl.replace(/\/$/, '');

    if (!wpBaseUrl) {
      throw new Error('Cấu hình thiếu: WordPress API URL chưa được thiết lập.');
    }

    const cleanBaseUrl = wpBaseUrl
      .replace(/\/wp\/v2\/?$/, '')
      .replace(/\/wp-json\/?$/, '');
    const mediaEndpoint = `${cleanBaseUrl}/wp-json/wp/v2/media`;

    this.logger.log(`Uploading file ${filename} to WordPress Media Library...`);

    try {
      const response = await this.client.fetch(
        mediaEndpoint,
        {
          method: 'POST',
          headers: {
            'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
            'Content-Type': mimeType,
          },
          body: new Uint8Array(fileBuffer),
        },
        60000,
      );

      const text = await response.text();

      if (!response.ok) {
        this.logger.error(
          `WordPress media upload failed: ${response.status} - ${text}`,
        );
        throw new Error(`WordPress upload failed: ${text}`);
      }

      const media = JSON.parse(text) as {
        source_url?: string;
        guid?: { rendered?: string };
      };

      const uploadedUrl = media.source_url || media.guid?.rendered;

      if (!uploadedUrl) {
        throw new Error(
          'WordPress API uploaded file but returned no source URL',
        );
      }

      this.logger.log(`File ${filename} uploaded successfully: ${uploadedUrl}`);
      return uploadedUrl;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to upload media to WordPress: ${errorMsg}`);
      throw new Error(`WordPress upload failed: ${errorMsg}`);
    }
  }
}
