import { Injectable, Logger } from '@nestjs/common';
import { WpApiClient } from '../wordpress/wp-api.client';
import * as crypto from 'crypto';

@Injectable()
export class MediaUploadService {
  private readonly logger = new Logger(MediaUploadService.name);
  private readonly uploadCache = new Map<string, string>();
  private readonly uploadInFlight = new Map<string, Promise<string>>();
  private readonly urlToIdMap = new Map<string, number>();

  constructor(private readonly client: WpApiClient) {}

  getAttachmentIdByUrl(url: string): number | undefined {
    return this.urlToIdMap.get(url.trim());
  }

  clearAttachmentId(url: string): void {
    this.urlToIdMap.delete(url.trim());
  }

  clearAllCaches(): void {
    this.uploadCache.clear();
    this.uploadInFlight.clear();
    this.urlToIdMap.clear();
    this.logger.log('🧹 Cleared all MediaUploadService caches.');
  }

  async uploadToWordPress(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<string> {
    const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const cacheKey = `${filename}_${fileBuffer.length}_${fileHash}`;

    if (this.uploadCache.has(cacheKey)) {
      const cachedUrl = this.uploadCache.get(cacheKey)!;
      try {
        const checkRes = await this.client.fetch(
          cachedUrl,
          { method: 'HEAD' },
          5000,
        );
        if (checkRes.ok) {
          this.logger.log(
            `⚡ Reusing verified WordPress media URL for ${filename}: ${cachedUrl}`,
          );
          return cachedUrl;
        } else {
          this.logger.warn(
            `🗑️ Cached media URL for ${filename} returned ${checkRes.status} (deleted on WP). Evicting stale cache...`,
          );
          this.uploadCache.delete(cacheKey);
          this.urlToIdMap.delete(cachedUrl);
        }
      } catch (checkErr) {
        this.logger.warn(
          `Could not verify cached URL ${cachedUrl}: ${String(checkErr)}. Evicting cache...`,
        );
        this.uploadCache.delete(cacheKey);
        this.urlToIdMap.delete(cachedUrl);
      }
    }

    if (this.uploadInFlight.has(cacheKey)) {
      this.logger.log(
        `⏳ Parallel upload detected for ${filename}. Awaiting in-flight upload promise...`,
      );
      return this.uploadInFlight.get(cacheKey)!;
    }

    const uploadPromise = (async () => {
      const settings = await this.client.getSettings();
      const wpBaseUrl = settings.apiUrl.replace(/\/$/, '');

      if (!wpBaseUrl) {
        throw new Error(
          'Cấu hình thiếu: WordPress API URL chưa được thiết lập.',
        );
      }

      const cleanBaseUrl = wpBaseUrl
        .replace(/\/wp\/v2\/?$/, '')
        .replace(/\/wp-json\/?$/, '');
      const mediaEndpoint = `${cleanBaseUrl}/wp-json/wp/v2/media`;

      this.logger.log(
        `Uploading file ${filename} to WordPress Media Library...`,
      );

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
          id?: number;
          source_url?: string;
          guid?: { rendered?: string };
        };

        const uploadedUrl = media.source_url || media.guid?.rendered;

        if (!uploadedUrl) {
          throw new Error(
            'WordPress API uploaded file but returned no source URL',
          );
        }

        if (media.id) {
          this.urlToIdMap.set(uploadedUrl, media.id);
        }

        this.logger.log(
          `File ${filename} uploaded successfully (ID ${media.id || 'N/A'}): ${uploadedUrl}`,
        );
        this.uploadCache.set(cacheKey, uploadedUrl);
        return uploadedUrl;
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to upload media to WordPress: ${errorMsg}`);
        throw new Error(`WordPress upload failed: ${errorMsg}`);
      }
    })();

    this.uploadInFlight.set(cacheKey, uploadPromise);
    try {
      return await uploadPromise;
    } finally {
      this.uploadInFlight.delete(cacheKey);
    }
  }
}
