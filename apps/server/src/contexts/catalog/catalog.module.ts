import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { PublisherProcessor } from './jobs/publisher.processor';
import { ProductsController } from './products/infrastructure/http/controllers/products.controller';
import { CategoriesController } from './products/infrastructure/http/controllers/categories.controller';
import { BrandsController } from './products/infrastructure/http/controllers/brands.controller';
import { AiSettingsController } from './products/infrastructure/http/controllers/ai-settings.controller';
import { WpSettingsController } from './products/infrastructure/http/controllers/wp-settings.controller';
import { CreateProductHandler } from './products/application/commands/create-product/create-product.handler';
import { BulkCreateProductsHandler } from './products/application/commands/bulk-create-products/bulk-create-products.handler';
import { GetProductsHandler } from './products/application/queries/get-products/get-products.handler';
import { GetProductByIdHandler } from './products/application/queries/get-product-by-id/get-product-by-id.handler';
import { ProductRepository } from './products/domain/product.repository';
import { PrismaProductRepository } from './products/infrastructure/repositories/prisma-product.repository';
import { WordPressService } from './jobs/services/wordpress.service';
import { GeminiService } from './jobs/services/gemini.service';
import { MediaUploadService } from './jobs/services/media-upload.service';
import { ApiLogsModule } from './api-logs/api-logs.module';
import { EventsGateway } from './jobs/events.gateway';
import { GetDashboardStatsHandler } from './products/application/queries/get-dashboard-stats/get-dashboard-stats.handler';
import { GetProductsBySkusHandler } from './products/application/queries/get-products-by-skus/get-products-by-skus.handler';
import { TrashProductHandler } from './products/application/commands/trash-product/trash-product.handler';
import { RestoreProductHandler } from './products/application/commands/restore-product/restore-product.handler';
import { PermanentlyDeleteProductHandler } from './products/application/commands/permanently-delete-product/permanently-delete-product.handler';

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
    AiSettingsController,
    WpSettingsController,
  ],
  providers: [
    EventsGateway,
    WordPressService,
    GeminiService,
    MediaUploadService,
    PublisherProcessor,
    CreateProductHandler,
    BulkCreateProductsHandler,
    GetProductsHandler,
    GetProductByIdHandler,
    GetDashboardStatsHandler,
    TrashProductHandler,
    RestoreProductHandler,
    PermanentlyDeleteProductHandler,
    GetProductsBySkusHandler,
    {
      provide: ProductRepository,
      useClass: PrismaProductRepository,
    },
  ],
  exports: [BullModule],
})
export class CatalogModule {}
