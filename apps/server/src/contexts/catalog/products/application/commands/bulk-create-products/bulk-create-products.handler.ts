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

    if (data.video) {
      html += `<h3>Video Sản phẩm</h3>`;
      // Hỗ trợ cả Youtube Shorts lồng vào iframe
      const videoId = data.video.split('/').pop()?.split('?')[0];
      html += `
          <div style="margin-bottom: 20px;">
            <iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
          </div>
        `;
    }

    html += `<div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">`;

    if (data.shopeeLink) {
      html += `<a href="${data.shopeeLink}" target="_blank" style="background: #ee4d2d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Mua trên Shopee</a>`;
    }

    if (data.lazadaLink) {
      html += `<a href="${data.lazadaLink}" target="_blank" style="background: #00008b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Mua trên Lazada</a>`;
    }

    if (data.tiktokLink) {
      html += `<a href="${data.tiktokLink}" target="_blank" style="background: #000000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Mua trên Tiktok</a>`;
    }

    html += `</div>`;

    return html;
  }
}
