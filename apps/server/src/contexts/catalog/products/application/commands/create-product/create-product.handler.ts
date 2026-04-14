import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateProductCommand } from './create-product.command';
import { ProductRepository } from '../../../domain/product.repository';
import { Product } from '../../../domain/entities/product.entity';
import { UuidGeneratorAdapter } from 'src/shared/infrastructure/generators/uuid-generator.adapter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PublishProductJobData } from '../../../../jobs/publisher.processor';
import { Logger } from '@nestjs/common';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
  private readonly logger = new Logger(CreateProductHandler.name);
  private uuidGenerator = new UuidGeneratorAdapter();

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly publisher: EventPublisher,
    @InjectQueue('wp-publisher')
    private readonly wpPublisherQueue: Queue<
      PublishProductJobData,
      void,
      string
    >,
  ) {}

  async execute(command: CreateProductCommand): Promise<string> {
    const {
      title,
      baseDescription,
      sourceUrl,
      imageUrl,
      galleryImageUrls,
      tags,
    } = command.data;
    const id = this.uuidGenerator.generate();

    const product = Product.create(
      id,
      title,
      baseDescription ?? null,
      sourceUrl ?? null, // Map source URL sang rawContent tạm
      imageUrl ?? null,
      galleryImageUrls ?? null,
      null, // price
      null, // sku
      null, // material
      null, // carModels
      null, // shopeeLink
      null, // lazadaLink
      null, // tiktokLink
      null, // videoUrl
      command.data.category ?? null,
      tags ?? null,
    );

    product.markAsCreated();

    await this.productRepository.save(product);

    this.publisher.mergeObjectContext(product).commit();

    await this.wpPublisherQueue.add(
      'publish-product',
      { productId: id },
      {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );

    this.logger.log(
      `Created new product [${id}] directly into "PENDING" and dispatched Job Queue.`,
    );

    return id;
  }
}
