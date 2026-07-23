import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

@Injectable()
export class MediaUploadService {
  private readonly logger = new Logger(MediaUploadService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async getSettings(): Promise<{
    apiUrl: string;
    username: string;
    appPassword: string;
  }> {
    const setting = await this.prisma.wpSetting.findUnique({
      where: { id: 'default' },
    });

    if (setting && setting.apiUrl && setting.username && setting.appPassword) {
      return {
        apiUrl: setting.apiUrl,
        username: setting.username,
        appPassword: setting.appPassword,
      };
    }

    return {
      apiUrl: process.env.WP_API_URL || '',
      username: process.env.WP_USERNAME || '',
      appPassword: process.env.WP_APP_PASSWORD || '',
    };
  }

  /**
   * Uploads a file buffer directly to WordPress Media Library.
   * Returns the public URL of the uploaded media.
   */
  async uploadToWordPress(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<string> {
    const settings = await this.getSettings();
    const wpBaseUrl = settings.apiUrl.replace(/\/$/, '');

    if (!wpBaseUrl) {
      throw new Error('Cấu hình thiếu: WordPress API URL chưa được thiết lập.');
    }

    const cleanBaseUrl = wpBaseUrl
      .replace(/\/wp\/v2\/?$/, '')
      .replace(/\/wp-json\/?$/, '');
    const mediaEndpoint = `${cleanBaseUrl}/wp-json/wp/v2/media`;
    const wpUser = settings.username;
    const wpPass = settings.appPassword;

    if (!wpUser || !wpPass) {
      throw new Error(
        'Cấu hình thiếu: WordPress Username hoặc Application Password chưa được thiết lập.',
      );
    }

    const authHeader =
      'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

    this.logger.log(`Uploading file ${filename} to WordPress Media Library...`);

    try {
      const response = await fetch(mediaEndpoint, {
        method: 'POST',
        headers: {
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
          'Content-Type': mimeType,
          Authorization: authHeader,
        },
        body: new Uint8Array(fileBuffer),
      });

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
      const imageUrl = media.source_url || media.guid?.rendered;

      if (!imageUrl) {
        throw new Error('WordPress media response did not return a valid URL.');
      }

      this.logger.log(`Uploaded successfully! WordPress URL: ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to upload media to WordPress: ${err.message}`);
      throw error;
    }
  }
}
