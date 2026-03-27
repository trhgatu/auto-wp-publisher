import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductsQuery } from './get-products.query';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

@QueryHandler(GetProductsQuery)
export class GetProductsHandler implements IQueryHandler<GetProductsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetProductsQuery): Promise<unknown[]> {
    const products = await this.prisma.product.findMany({
      take: query.limit,
      skip: query.offset,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        errorLog: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return products;
  }
}
