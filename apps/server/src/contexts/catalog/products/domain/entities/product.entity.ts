import { AggregateRoot, IEvent } from '@nestjs/cqrs';
import { ProductId } from '../value-objects/product-id.vo';
import { ProductStatus } from '../types/product-status.enum';
import { ProductCreatedEvent } from '../events/product-created.event';

export class Product extends AggregateRoot<IEvent> {
  constructor(
    public readonly id: ProductId,
    public name: string,
    public description: string | null,
    public rawContent: string | null,
    public aiContent: string | null,
    public imageUrl: string | null,
    public wpPostId: number | null,
    public price: string | null,
    public sku: string | null,
    public material: string | null,
    public carModels: string | null,
    public shopeeLink: string | null,
    public lazadaLink: string | null,
    public tiktokLink: string | null,
    public videoUrl: string | null,
    public status: ProductStatus,
    public errorLog: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    super();
  }

  static create(
    id: string,
    name: string,
    description: string | null,
    rawContent: string | null,
    imageUrl: string | null,
    price: string | null = null,
    sku: string | null = null,
    material: string | null = null,
    carModels: string | null = null,
    shopeeLink: string | null = null,
    lazadaLink: string | null = null,
    tiktokLink: string | null = null,
    videoUrl: string | null = null,
  ): Product {
    return new Product(
      ProductId.create(id),
      name,
      description,
      rawContent,
      null, // aiContent
      imageUrl,
      null, // wpPostId
      price,
      sku,
      material,
      carModels,
      shopeeLink,
      lazadaLink,
      tiktokLink,
      videoUrl,
      ProductStatus.PENDING,
      null, // errorLog
      new Date(),
      new Date(),
    );
  }

  markAsCreated(): void {
    this.apply(new ProductCreatedEvent(this.id.value, this.name));
  }

  markAsProcessing(): void {
    this.status = ProductStatus.PROCESSING;
  }

  markAsFailed(errorMsg: string): void {
    this.status = ProductStatus.FAILED;
    this.errorLog = errorMsg;
  }

  markAsCompleted(wpPostId: number, aiContent: string): void {
    this.status = ProductStatus.COMPLETED;
    this.wpPostId = wpPostId;
    this.aiContent = aiContent;
  }
}
