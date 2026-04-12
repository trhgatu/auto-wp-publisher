import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductsQuery } from './get-products.query';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { JobStatus } from '@prisma/client';

@QueryHandler(GetProductsQuery)
export class GetProductsHandler implements IQueryHandler<GetProductsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetProductsQuery,
  ): Promise<{ items: unknown[]; total: number }> {
    const where: {
      status?: JobStatus;
      name?: { contains: string; mode: 'insensitive' };
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (query.status) {
      where.status = query.status as JobStatus;
    }

    if (query.search) {
      where.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        // Set to end of day
        const endDay = new Date(query.endDate);
        endDay.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDay;
      }
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        take: query.limit,
        skip: query.offset,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          status: true,
          errorLog: true,
          imageUrl: true,
          price: true,
          sku: true,
          category: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total };
  }
}
