import { Controller, Get, Post, Body } from '@nestjs/common';
import { WordPressService } from '../../../../jobs/services/wordpress.service';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

@Controller('brands')
export class BrandsController {
  constructor(
    private readonly wpService: WordPressService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('wp')
  async getWpBrands() {
    return this.wpService.getBrands();
  }

  @Get('mappings')
  async getMappings() {
    return this.prisma.brandMapping.findMany({
      orderBy: { excelValue: 'asc' },
    });
  }

  @Post('mappings')
  async saveMappings(
    @Body()
    mappings: {
      excelValue: string;
      wpBrandId: string;
      wpBrandName: string;
    }[],
  ) {
    for (const mapping of mappings) {
      await this.prisma.brandMapping.upsert({
        where: { excelValue: mapping.excelValue },
        update: {
          wpBrandId: mapping.wpBrandId,
          wpBrandName: mapping.wpBrandName,
        },
        create: {
          excelValue: mapping.excelValue,
          wpBrandId: mapping.wpBrandId,
          wpBrandName: mapping.wpBrandName,
        },
      });
    }
    return { success: true };
  }
}
