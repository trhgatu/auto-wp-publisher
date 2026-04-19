import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ProductRepository } from '../products/domain/product.repository';
import { WordPressService } from './services/wordpress.service';
import { ProductId } from '../products/domain/value-objects/product-id.vo';
import { EventsGateway } from './events.gateway';

export interface PublishProductJobData {
  productId: string;
}

@Processor('wp-publisher')
export class PublisherProcessor extends WorkerHost {
  private readonly logger = new Logger(PublisherProcessor.name);

  constructor(
    private readonly productRepo: ProductRepository,
    private readonly wpService: WordPressService,
    private readonly eventsGateway: EventsGateway,
  ) {
    super();
  }

  async process(job: Job<PublishProductJobData, void, string>): Promise<void> {
    const { productId } = job.data;
    this.logger.log(`🚀 Worker Picked Job ${job.id} for Product ${productId}`);

    try {
      const productIdVo = ProductId.create(productId);
      const product = await this.productRepo.findById(productIdVo);

      if (!product) {
        this.logger.error(`❌ Product ${productId} not found!`);
        return;
      }

      this.logger.log(`🔄 Processing WooCommerce product: ${product.name}`);
      product.markAsProcessing();
      await this.productRepo.save(product);

      this.eventsGateway.broadcastJobUpdate({
        productId: product.id.value,
        status: 'PROCESSING',
        message: `Đang xử lý bài viết: ${product.name}`,
      });

      const wpProduct = await this.wpService.publishProduct(
        product.name,
        product.rawContent,
        product.price,
        product.material,
        product.carModels,
        product.shopeeLink,
        product.lazadaLink,
        product.tiktokLink,
        product.videoUrl,
        product.imageUrl,
        product.galleryImageUrls,
        product.category,
        product.tags,
        product.shortDescription,
        product.wpPostId,
      );

      this.logger.log(
        `🔗 WooCommerce created product ID: ${wpProduct.id} - URL: ${wpProduct.permalink}`,
      );

      product.markAsCompleted(
        wpProduct.id,
        wpProduct.permalink,
        `<p>Sản phẩm đã lên sóng: <a href="${wpProduct.permalink}" target="_blank">${wpProduct.permalink}</a></p>`,
      );
      await this.productRepo.save(product);

      this.eventsGateway.broadcastJobUpdate({
        productId: product.id.value,
        status: 'COMPLETED',
        message: `Đã đăng bài thành công: ${product.name}`,
      });

      this.logger.log(`✅ Job ${job.id} completed successfully!`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : '';
      this.logger.error(
        `💥 Job ${job.id} CRITICAL ERROR: ${errorMessage}`,
        errorStack,
      );
      try {
        const product = await this.productRepo.findById(
          ProductId.create(productId),
        );
        if (product) {
          product.markAsFailed(errorMessage);
          await this.productRepo.save(product);

          this.eventsGateway.broadcastJobUpdate({
            productId: product.id.value,
            status: 'FAILED',
            message: `Lỗi đăng bài: ${errorMessage}`,
          });
        }
      } catch (innerErr: unknown) {
        const innerMessage =
          innerErr instanceof Error ? innerErr.message : String(innerErr);
        this.logger.error(`Failed to record error to DB: ${innerMessage}`);
      }

      throw err;
    }
  }
}
