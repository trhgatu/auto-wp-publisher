import { Controller, Get, Post, Body } from '@nestjs/common';
import { WpCategoryService } from '@catalog/integrations';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly wpCategoryService: WpCategoryService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('wp')
  async getWpCategories() {
    return this.wpCategoryService.getCategories();
  }

  @Get('mappings')
  async getMappings() {
    return this.prisma.categoryMapping.findMany({
      orderBy: { excelValue: 'asc' },
    });
  }

  @Post('mappings')
  async saveMappings(
    @Body()
    mappings: {
      excelValue: string;
      wpCategoryId: string;
      wpCategoryName: string;
    }[],
  ) {
    for (const mapping of mappings) {
      await this.prisma.categoryMapping.upsert({
        where: { excelValue: mapping.excelValue },
        update: {
          wpCategoryId: mapping.wpCategoryId,
          wpCategoryName: mapping.wpCategoryName,
        },
        create: {
          excelValue: mapping.excelValue,
          wpCategoryId: mapping.wpCategoryId,
          wpCategoryName: mapping.wpCategoryName,
        },
      });
    }
    return { success: true };
  }
}
