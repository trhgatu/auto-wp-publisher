import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { PublisherProcessor } from './jobs/publisher.processor';
import { ProductsController } from './products/infrastructure/http/controllers/products.controller';
import { CreateProductHandler } from './products/application/commands/create-product/create-product.handler';
import { BulkCreateProductsHandler } from './products/application/commands/bulk-create-products/bulk-create-products.handler';
import { GetProductsHandler } from './products/application/queries/get-products/get-products.handler';
import { ProductRepository } from './products/domain/product.repository';
import { PrismaProductRepository } from './products/infrastructure/repositories/prisma-product.repository';
import { WordPressService } from './jobs/services/wordpress.service';

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({
      name: 'wp-publisher',
    }),
  ],
  controllers: [ProductsController],
  providers: [
    WordPressService,
    PublisherProcessor,
    CreateProductHandler,
    BulkCreateProductsHandler,
    GetProductsHandler,
    {
      provide: ProductRepository,
      useClass: PrismaProductRepository,
    },
  ],
  exports: [BullModule],
})
export class CatalogModule {}
