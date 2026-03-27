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
    const { title, baseDescription, sourceUrl } = command.data;

    const id = this.uuidGenerator.generate();

    // Khởi tạo Aggregate Root
    const product = Product.create(
      id,
      title,
      baseDescription,
      sourceUrl || null, // Map source URL sang rawContent tạm
      null,
    );

    // Kích hoạt Event tạo mới
    product.markAsCreated();

    // Lưu vào Repository
    await this.productRepository.save(product);

    // Apply các events thông qua EventPublisher của NestJS CQRS
    this.publisher.mergeObjectContext(product).commit();

    // Bắn một Job ngầm vào BullMQ (Redis) xử lý gọi API lấy bài viết và đăng WP
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
