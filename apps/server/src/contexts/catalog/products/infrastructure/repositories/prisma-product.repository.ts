import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../domain/product.repository';
import { Product } from '../../domain/entities/product.entity';
import { ProductId } from '../../domain/value-objects/product-id.vo';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { Product as PrismaProduct, JobStatus } from '@repo/database';
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
        shortDescription: product.shortDescription,
        rawContent: product.rawContent,
        aiContent: product.aiContent,
        imageUrl: product.imageUrl,
        galleryImageUrls: product.galleryImageUrls,
        wpPostId: product.wpPostId,
        wpUrl: product.wpUrl,
        price: product.price,
        sku: product.sku,
        material: product.material,
        carModels: product.carModels,
        shopeeLink: product.shopeeLink,
        lazadaLink: product.lazadaLink,
        tiktokLink: product.tiktokLink,
        videoUrl: product.videoUrl,
        category: product.category,
        tags: product.tags,
        status: product.status as unknown as JobStatus,
        errorLog: product.errorLog,
        updatedAt: product.updatedAt,
        deletedAt: product.deletedAt,
      },
      create: {
        id: product.id.value,
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        rawContent: product.rawContent,
        aiContent: product.aiContent,
        imageUrl: product.imageUrl,
        galleryImageUrls: product.galleryImageUrls,
        wpPostId: product.wpPostId,
        wpUrl: product.wpUrl,
        price: product.price,
        sku: product.sku,
        material: product.material,
        carModels: product.carModels,
        shopeeLink: product.shopeeLink,
        lazadaLink: product.lazadaLink,
        tiktokLink: product.tiktokLink,
        videoUrl: product.videoUrl,
        category: product.category,
        tags: product.tags,
        status: product.status as unknown as JobStatus,
        errorLog: product.errorLog,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        deletedAt: product.deletedAt,
      },
    });
  }

  async findById(id: ProductId): Promise<Product | null> {
    const raw = await this.prisma.product.findUnique({
      where: { id: id.value },
    });

    if (!raw) return null;

    return this.mapToDomain(raw);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const raw = await this.prisma.product.findFirst({
      where: { sku },
    });

    if (!raw) return null;

    return this.mapToDomain(raw);
  }

  async findByName(name: string): Promise<Product | null> {
    const raw = await this.prisma.product.findFirst({
      where: { name },
    });

    if (!raw) return null;

    return this.mapToDomain(raw);
  }

  async delete(id: ProductId): Promise<void> {
    await this.prisma.product.delete({
      where: { id: id.value },
    });
  }

  private mapToDomain(raw: PrismaProduct): Product {
    return new Product(
      ProductId.create(raw.id),
      raw.name,
      raw.description,
      raw.shortDescription,
      raw.rawContent,
      raw.aiContent,
      raw.imageUrl,
      raw.galleryImageUrls,
      raw.wpPostId,
      raw.wpUrl,
      raw.price,
      raw.sku,
      raw.material,
      raw.carModels,
      raw.shopeeLink,
      raw.lazadaLink,
      raw.tiktokLink,
      raw.videoUrl,
      raw.category,
      raw.tags,
      raw.status as unknown as ProductStatus,
      raw.errorLog,
      raw.createdAt,
      raw.updatedAt,
      raw.deletedAt,
    );
  }
}
