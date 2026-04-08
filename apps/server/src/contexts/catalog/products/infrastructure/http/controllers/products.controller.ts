import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProductCommand } from '../../../application/commands/create-product/create-product.command';
import { BulkCreateProductsCommand } from '../../../application/commands/bulk-create-products/bulk-create-products.command';
import { GetProductsQuery } from '../../../application/queries/get-products/get-products.query';
import { GetProductByIdQuery } from '../../../application/queries/get-product-by-id/get-product-by-id.query';
import { ProductResponse } from '../responses/product.response';
import {
  ImportProductSchema,
  ImportProductDto,
  BulkImportProductDto,
  BulkImportProductSchema,
} from '@repo/shared';
import { ZodValidationPipe } from 'src/shared/infrastructure/pipes/zod-validation.pipe';
import { z } from 'zod';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getProducts(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const { items, total } = await this.queryBus.execute<
      GetProductsQuery,
      { items: unknown[]; total: number }
    >(
      new GetProductsQuery(
        Number(limit),
        Number(offset),
        status,
        search,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      ),
    );
    return { items, total };
  }

  @Get(':id')
  async getProductById(@Param('id') id: string): Promise<unknown> {
    return this.queryBus.execute(new GetProductByIdQuery(id));
  }

  @Post()
  async createProduct(
    @Body(new ZodValidationPipe(ImportProductSchema as unknown as z.ZodSchema))
    data: ImportProductDto,
  ): Promise<ProductResponse> {
    const productId = await this.commandBus.execute<
      CreateProductCommand,
      string
    >(new CreateProductCommand(data));

    return new ProductResponse(productId);
  }

  @Post('bulk')
  async createBulkProducts(
    @Body(
      new ZodValidationPipe(BulkImportProductSchema as unknown as z.ZodSchema),
    )
    data: BulkImportProductDto,
  ): Promise<string[]> {
    return this.commandBus.execute<BulkCreateProductsCommand, string[]>(
      new BulkCreateProductsCommand(data),
    );
  }
}
