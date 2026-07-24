import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { PublisherProcessor } from './jobs/publisher.processor';
import { ProductsController } from './products/infrastructure/http/controllers/products.controller';
import { CategoriesController } from './categories/infrastructure/http/controllers/categories.controller';
import { BrandsController } from './brands/infrastructure/http/controllers/brands.controller';
import { CommandHandlers, QueryHandlers } from '@catalog/products/application';
import { ProductRepository } from '@catalog/products/domain';
import { PrismaProductRepository } from './products/infrastructure/repositories/prisma-product.repository';
import {
  WpApiClient,
  WpCategoryService,
  WpBrandService,
  WpProductService,
  GeminiService,
  MediaUploadService,
} from '@catalog/integrations';
import { ProductTemplateService } from './templates';
import { ApiLogsModule } from './api-logs/api-logs.module';
import { EventsGateway } from './jobs/events.gateway';

import { TemplatesController } from './templates/infrastructure/http/controllers/templates.controller';

@Module({
  imports: [
    CqrsModule,
    ApiLogsModule,
    BullModule.registerQueue({
      name: 'wp-publisher',
    }),
  ],
  controllers: [
    ProductsController,
    CategoriesController,
    BrandsController,
    TemplatesController,
  ],
  providers: [
    EventsGateway,
    WpApiClient,
    WpCategoryService,
    WpBrandService,
    WpProductService,
    GeminiService,
    MediaUploadService,
    ProductTemplateService,
    PublisherProcessor,
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: ProductRepository,
      useClass: PrismaProductRepository,
    },
  ],
  exports: [BullModule],
})
export class CatalogModule {}
