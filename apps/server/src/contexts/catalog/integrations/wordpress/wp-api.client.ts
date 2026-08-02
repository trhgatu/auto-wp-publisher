import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

export interface WpSettingsData {
  apiUrl: string;
  username: string;
  appPassword: string;
}

@Injectable()
export class WpApiClient {
  private readonly logger = new Logger(WpApiClient.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<WpSettingsData> {
    let setting = await this.prisma.wpSetting.findUnique({
      where: { id: 'default' },
    });

    if (!setting) {
      setting = await this.prisma.wpSetting.create({
        data: {
          id: 'default',
          apiUrl: process.env.WP_API_URL || '',
          username: process.env.WP_USERNAME || '',
          appPassword: process.env.WP_APP_PASSWORD || '',
        },
      });
    }

    return setting;
  }

  async getWcApiUrl(): Promise<string> {
    const settings = await this.getSettings();
    const wpBaseUrl = settings.apiUrl.replace(/\/$/, '');
    if (!wpBaseUrl) {
      throw new Error('Cấu hình thiếu: WordPress API URL chưa được thiết lập.');
    }
    return `${wpBaseUrl.replace(/\/wp\/v2\/?$/, '')}/wc/v3`;
  }

  async getAuthHeader(): Promise<string> {
    const settings = await this.getSettings();
    const wpUser = (settings.username || '').trim();
    const wpPass = (settings.appPassword || '').trim();

    if (!wpUser || !wpPass) {
      throw new Error(
        'Cấu hình thiếu: WordPress Username hoặc Application Password chưa được thiết lập.',
      );
    }

    return 'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  }

  isValidUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return false;
    }
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  }

  async fetch(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = 60000,
  ): Promise<Response> {
    const authHeader = await this.getAuthHeader();
    const headers = {
      Authorization: authHeader,
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (response.status === 401) {
      const settings = await this.getSettings();
      const username = (settings.username || '').trim();
      const password = (settings.appPassword || '').trim();

      // Fallback 1: Try password without spaces if spaces present
      if (password.includes(' ')) {
        const altPassword = password.replace(/\s+/g, '');
        const altAuthHeader =
          'Basic ' +
          Buffer.from(`${username}:${altPassword}`).toString('base64');
        const altResponse = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            Authorization: altAuthHeader,
          },
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (altResponse.ok) {
          return altResponse;
        }
      }

      // Fallback 2: Try URL basic auth if web server strips Authorization header
      try {
        const urlObj = new URL(url);
        if (!urlObj.username && username && password) {
          urlObj.username = username;
          urlObj.password = password;
          const urlResponse = await fetch(urlObj.toString(), {
            ...options,
            signal: AbortSignal.timeout(timeoutMs),
          });
          if (urlResponse.ok) {
            return urlResponse;
          }
        }
      } catch (err) {
        this.logger.warn(
          `Could not parse URL for basic auth fallback: ${String(err)}`,
        );
      }
    }

    return response;
  }
}
