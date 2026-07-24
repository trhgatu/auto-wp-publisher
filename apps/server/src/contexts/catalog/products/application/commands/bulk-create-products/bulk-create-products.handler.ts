import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { BulkCreateProductsCommand } from './bulk-create-products.command';
import { ProductRepository } from '../../../domain/product.repository';
import { Product } from '../../../domain/entities/product.entity';
import { UuidGeneratorAdapter } from 'src/shared/infrastructure/generators/uuid-generator.adapter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PublishProductJobData } from '../../../../jobs/publisher.processor';
import { Logger } from '@nestjs/common';
import { ImportProductDto as BaseDto } from '@repo/shared';

type ImportProductDto = BaseDto & { shortDescription?: string; sku?: string };

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

  async execute(
    command: BulkCreateProductsCommand,
  ): Promise<Record<number, string>> {
    const products = command.data as ImportProductDto[];
    const idsMap: Record<number, string> = {};
    const newlyCreatedIds = new Set<string>();

    for (let i = 0; i < products.length; i++) {
      const data = products[i];
      try {
        const htmlContent = this.generateWPContent(data);
        // 1. Try to find existing product by Name/Title
        let product: Product | null = await this.productRepository.findByName(
          data.title,
        );
        const skuToSearch =
          data.sku || data.partNumbers
            ? String(data.sku || data.partNumbers)
            : null;

        let productId: string;

        if (product && !newlyCreatedIds.has(product.id.value)) {
          this.logger.log(`Updating existing product: ${data.title}`);
          productId = product.id.value;
          product.name = data.title;
          product.shortDescription =
            data.shortDescription || product.shortDescription;
          product.rawContent = htmlContent;
          product.imageUrl = data.imageUrl || product.imageUrl;
          product.galleryImageUrls =
            data.galleryImageUrls || product.galleryImageUrls;
          product.price = data.price ? String(data.price) : product.price;
          product.sku = skuToSearch || product.sku;
          product.material = data.material || product.material;
          product.carModels = data.carModels || product.carModels;
          product.shopeeLink = data.shopeeLink || product.shopeeLink;
          product.lazadaLink = data.lazadaLink || product.lazadaLink;
          product.tiktokLink = data.tiktokLink || product.tiktokLink;
          product.videoUrl = data.video || product.videoUrl;
          product.category = data.category ?? product.category;
          product.brand = data.brand ?? product.brand;
          product.tags = data.tags ?? product.tags;
          if (data.templateId) {
            product.templateId = data.templateId;
          }
          // Set to pending so it gets re-published to WP with new links
          product.markAsPending();
        } else {
          // 3. Create new product
          productId = this.uuidGenerator.generate();
          this.logger.log(`Importing new product: ${data.title}`);
          newlyCreatedIds.add(productId);

          product = Product.create(
            productId,
            data.title,
            null,
            data.shortDescription || null,
            htmlContent,
            data.imageUrl || null,
            data.galleryImageUrls || null,
            data.price ? String(data.price) : null,
            skuToSearch,
            data.material ? String(data.material) : null,
            data.carModels ? String(data.carModels) : null,
            data.shopeeLink ? String(data.shopeeLink) : null,
            data.lazadaLink ? String(data.lazadaLink) : null,
            data.tiktokLink ? String(data.tiktokLink) : null,
            data.video ? String(data.video) : null,
            data.category ?? null,
            data.brand ?? null,
            data.tags ?? null,
            data.templateId ?? null,
          );
          product.markAsCreated();
        }

        await this.productRepository.save(product);
        this.publisher.mergeObjectContext(product).commit();

        if (!command.delayQueue) {
          await this.wpPublisherQueue.add(
            'publish-product',
            { productId },
            {
              removeOnComplete: true,
              removeOnFail: false,
              attempts: 3,
              backoff: { type: 'exponential', delay: 2000 },
            },
          );
        }
        idsMap[i] = productId;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Failed to import/sync product: ${data.title}`,
          errorMessage,
        );
      }
    }

    this.logger.log(
      `Bulk processed ${Object.keys(idsMap).length}/${products.length} products (Created/Updated).`,
    );
    return idsMap;
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
