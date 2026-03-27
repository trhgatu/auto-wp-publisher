import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProductCommand } from '../../../application/commands/create-product/create-product.command';
import { GetProductsQuery } from '../../../application/queries/get-products/get-products.query';
import { ProductResponse } from '../responses/product.response';
import { ImportProductSchema, ImportProductDto } from '@repo/shared';
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
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<unknown[]> {
    return this.queryBus.execute<GetProductsQuery, unknown[]>(
      new GetProductsQuery(
        limit ? Number(limit) : 20,
        offset ? Number(offset) : 0,
      ),
    );
  }

  @Post()
  async createProduct(
    @Body(new ZodValidationPipe(ImportProductSchema as unknown as z.ZodSchema))
    data: ImportProductDto,
  ): Promise<ProductResponse> {
    // Kích hoạt Use Case: Lưu Pending Product & Bắn BullMQ Job
    const productId = await this.commandBus.execute<
      CreateProductCommand,
      string
    >(new CreateProductCommand(data));

    return new ProductResponse(productId);
  }
}
