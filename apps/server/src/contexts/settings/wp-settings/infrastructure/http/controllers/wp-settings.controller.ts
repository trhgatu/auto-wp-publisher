import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

@Controller('wp-settings')
export class WpSettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getSettings() {
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

    return {
      id: setting.id,
      apiUrl: setting.apiUrl,
      username: setting.username,
      appPassword: setting.appPassword ? '********' : '',
    };
  }

  @Post()
  async saveSettings(
    @Body()
    body: {
      apiUrl: string;
      username: string;
      appPassword?: string;
    },
  ) {
    const existing = await this.prisma.wpSetting.findUnique({
      where: { id: 'default' },
    });

    let passwordToSave = body.appPassword;
    if (!passwordToSave || passwordToSave === '********') {
      passwordToSave =
        existing?.appPassword || process.env.WP_APP_PASSWORD || '';
    }

    const updated = await this.prisma.wpSetting.upsert({
      where: { id: 'default' },
      update: {
        apiUrl: body.apiUrl.trim(),
        username: body.username.trim(),
        appPassword: passwordToSave.trim(),
      },
      create: {
        id: 'default',
        apiUrl: body.apiUrl.trim(),
        username: body.username.trim(),
        appPassword: passwordToSave.trim(),
      },
    });

    return {
      id: updated.id,
      apiUrl: updated.apiUrl,
      username: updated.username,
      appPassword: '********',
    };
  }

  @Post('test')
  async testConnection(
    @Body()
    body: {
      apiUrl: string;
      username: string;
      appPassword?: string;
    },
  ) {
    let passwordToTest = body.appPassword;
    if (!passwordToTest || passwordToTest === '********') {
      const existing = await this.prisma.wpSetting.findUnique({
        where: { id: 'default' },
      });
      passwordToTest =
        existing?.appPassword || process.env.WP_APP_PASSWORD || '';
    }

    const username = (body.username || '').trim();
    const password = (passwordToTest || '').trim();

    if (!username || !password) {
      throw new BadRequestException(
        'Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu ứng dụng (App Password).',
      );
    }

    const wpBaseUrl = (body.apiUrl || '').trim().replace(/\/$/, '');
    if (!wpBaseUrl) {
      throw new BadRequestException('Vui lòng nhập URL trang web WordPress.');
    }

    const wcApiUrl = `${wpBaseUrl.replace(/\/wp\/v2\/?$/, '')}/wc/v3`;
    const authHeader =
      'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

    let response = await fetch(`${wcApiUrl}/products/categories?per_page=1`, {
      headers: { Authorization: authHeader },
      signal: AbortSignal.timeout(10000),
    });

    // Fallback 1: Try password without spaces if spaces present
    if (response.status === 401 && password.includes(' ')) {
      const passwordNoSpaces = password.replace(/\s+/g, '');
      const altAuthHeader =
        'Basic ' +
        Buffer.from(`${username}:${passwordNoSpaces}`).toString('base64');
      const altResponse = await fetch(
        `${wcApiUrl}/products/categories?per_page=1`,
        {
          headers: { Authorization: altAuthHeader },
          signal: AbortSignal.timeout(10000),
        },
      );
      if (altResponse.ok) {
        response = altResponse;
      }
    }

    // Fallback 2: Try URL Basic Auth if server strips Authorization header
    if (response.status === 401) {
      try {
        const urlObj = new URL(`${wcApiUrl}/products/categories?per_page=1`);
        urlObj.username = username;
        urlObj.password = password;
        const urlResponse = await fetch(urlObj.toString(), {
          signal: AbortSignal.timeout(10000),
        });
        if (urlResponse.ok) {
          response = urlResponse;
        }
      } catch {
        // ignore URL parse errors
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new BadRequestException(
          'Lỗi xác thực (401 Unauthorized): Tên đăng nhập hoặc Mật khẩu ứng dụng (App Password) WordPress không chính xác. Vui lòng kiểm tra lại tài khoản WordPress.',
        );
      }
      if (response.status === 404) {
        throw new BadRequestException(
          'Lỗi đường dẫn (404 Not Found): Không tìm thấy WooCommerce REST API. Hãy đảm bảo WooCommerce đã được cài đặt và kích hoạt trên WordPress.',
        );
      }
      throw new BadRequestException(
        `Kiểm tra kết nối WordPress thất bại với mã lỗi HTTP ${response.status}`,
      );
    }

    return { success: true };
  }
}
