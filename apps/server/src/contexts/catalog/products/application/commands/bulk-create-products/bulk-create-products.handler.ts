import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { BulkCreateProductsCommand } from './bulk-create-products.command';
import { ProductRepository } from '../../../domain/product.repository';
import { Product } from '../../../domain/entities/product.entity';
import { UuidGeneratorAdapter } from 'src/shared/infrastructure/generators/uuid-generator.adapter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PublishProductJobData } from '../../../../jobs/publisher.processor';
import { Logger } from '@nestjs/common';
import { ImportProductDto } from '@repo/shared';

@CommandHandler(BulkCreateProductsCommand)
export class BulkCreateProductsHandler implements ICommandHandler<BulkCreateProductsCommand> {
  private readonly logger = new Logger(BulkCreateProductsHandler.name);
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

  async execute(command: BulkCreateProductsCommand): Promise<string[]> {
    const products = command.data;
    const ids: string[] = [];

    for (const data of products) {
      try {
        const id = this.uuidGenerator.generate();
        const htmlContent = this.generateWPContent(data);

        const product = Product.create(
          id,
          data.title,
          null, // description
          htmlContent,
          null, // imageUrl
          data.price ? String(data.price) : null,
          data.partNumbers ? String(data.partNumbers) : null,
          data.material ? String(data.material) : null,
          data.carModels ? String(data.carModels) : null,
          data.shopeeLink ? String(data.shopeeLink) : null,
          data.lazadaLink ? String(data.lazadaLink) : null,
          data.tiktokLink ? String(data.tiktokLink) : null,
          data.video ? String(data.video) : null,
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
        ids.push(id);
      } catch (err) {
        this.logger.error(`Failed to import product: ${data.title}`, err.stack);
      }
    }

    this.logger.log(`Bulk imported ${ids.length}/${products.length} products.`);
    return ids;
  }

  private generateWPContent(data: ImportProductDto): string {
    let html = `<h3>Thông số kỹ thuật</h3>`;
    html += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">`;

    const specs = [
      { label: 'Kích thước (mm)', value: data.dimensions },
      { label: 'Chất liệu', value: data.material },
      { label: 'Giá bán (VNĐ)', value: data.price },
      { label: 'Dòng xe', value: data.carModels },
      { label: 'Chi tiết dòng xe', value: data.carDetail },
      { label: 'Mã phụ tùng', value: data.partNumbers },
    ];

    specs.forEach((spec) => {
      if (spec.value) {
        html += `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold; width: 30%;">${spec.label}</td>
            <td style="padding: 10px;">${spec.value}</td>
          </tr>
        `;
      }
    });
    html += `</table>`;

    return html;
  }
}
