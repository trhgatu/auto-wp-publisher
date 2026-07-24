import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

@Controller('wp-settings')
export class WpSettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getWpSetting() {
    let setting = await this.prisma.wpSetting.findUnique({
      where: { id: 'default' },
    });

    if (!setting) {
      // Fallback to environment variables if not set in DB yet
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

  @Post()
  async saveWpSetting(
    @Body()
    body: {
      apiUrl: string;
      username: string;
      appPassword: string;
    },
  ) {
    return this.prisma.wpSetting.upsert({
      where: { id: 'default' },
      update: {
        apiUrl: body.apiUrl,
        username: body.username,
        appPassword: body.appPassword,
      },
      create: {
        id: 'default',
        apiUrl: body.apiUrl,
        username: body.username,
        appPassword: body.appPassword,
      },
    });
  }

  @Post('test')
  async testConnection(
    @Body()
    body: {
      apiUrl: string;
      username: string;
      appPassword: string;
    },
  ) {
    const wpBaseUrl = body.apiUrl.replace(/\/$/, '');
    const wcApiUrl = `${wpBaseUrl.replace(/\/wp\/v2\/?$/, '')}/wc/v3`;
    const authHeader =
      'Basic ' +
      Buffer.from(`${body.username}:${body.appPassword}`).toString('base64');

    const response = await fetch(`${wcApiUrl}/products/categories?per_page=1`, {
      headers: { Authorization: authHeader },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(
        `WordPress connection test failed with status ${response.status}`,
      );
    }

    return { success: true };
  }
}
