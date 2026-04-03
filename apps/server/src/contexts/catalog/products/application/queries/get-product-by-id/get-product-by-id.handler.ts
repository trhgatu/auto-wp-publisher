import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductByIdQuery } from './get-product-by-id.query';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetProductByIdQuery)
export class GetProductByIdHandler implements IQueryHandler<GetProductByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetProductByIdQuery): Promise<any> {
    const product = await this.prisma.product.findUnique({
      where: { id: query.id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${query.id} not found`);
    }

    return product;
  }
}
