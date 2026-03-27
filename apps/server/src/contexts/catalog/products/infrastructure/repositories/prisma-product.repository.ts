import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../domain/product.repository';
import { Product } from '../../domain/entities/product.entity';
import { ProductId } from '../../domain/value-objects/product-id.vo';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { JobStatus } from '@prisma/client';
import { ProductStatus } from '../../domain/types/product-status.enum';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(product: Product): Promise<void> {
    await this.prisma.product.upsert({
      where: { id: product.id.value },
      update: {
        name: product.name,
        description: product.description,
        rawContent: product.rawContent,
        aiContent: product.aiContent,
        imageUrl: product.imageUrl,
        wpPostId: product.wpPostId,
        status: product.status as unknown as JobStatus,
        errorLog: product.errorLog,
        updatedAt: product.updatedAt,
      },
      create: {
        id: product.id.value,
        name: product.name,
        description: product.description,
        rawContent: product.rawContent,
        aiContent: product.aiContent,
        imageUrl: product.imageUrl,
        wpPostId: product.wpPostId,
        status: product.status as unknown as JobStatus,
        errorLog: product.errorLog,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  }

  async findById(id: ProductId): Promise<Product | null> {
    const raw = await this.prisma.product.findUnique({
      where: { id: id.value },
    });

    if (!raw) return null;

    return new Product(
      ProductId.create(raw.id),
      raw.name,
      raw.description,
      raw.rawContent,
      raw.aiContent,
      raw.imageUrl,
      raw.wpPostId,
      raw.status as unknown as ProductStatus,
      raw.errorLog,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}
