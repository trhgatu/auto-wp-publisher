import { Controller, Post, Body } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateProductCommand } from '../../../application/commands/create-product/create-product.command';
import { ProductResponse } from '../responses/product.response';
import { ImportProductSchema, ImportProductDto } from '@repo/shared';
import { ZodValidationPipe } from 'src/shared/infrastructure/pipes/zod-validation.pipe';
import { z } from 'zod';

@Controller('products')
export class ProductsController {
  constructor(private readonly commandBus: CommandBus) {}

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
