import { Controller, Get, Post, Body } from '@nestjs/common';
import { WordPressService } from '../../../../jobs/services/wordpress.service';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly wpService: WordPressService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('wp')
  async getWpCategories() {
    return this.wpService.getCategories();
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
      wpCategoryId: number;
      wpCategoryName: string;
    }[],
  ) {
    // Upsert each mapping
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
