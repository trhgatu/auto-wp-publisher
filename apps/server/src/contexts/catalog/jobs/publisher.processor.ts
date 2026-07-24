import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ProductRepository, ProductId } from '@catalog/products/domain';
import { WpProductService, GeminiService } from '@catalog/integrations';
import { ProductTemplateService } from '@catalog/templates';
import { EventsGateway } from './events.gateway';

export interface PublishProductJobData {
  productId: string;
}

@Processor('wp-publisher', {
  concurrency: 1,
  limiter: {
    max: 10,
    duration: 60000,
  },
})
export class PublisherProcessor extends WorkerHost {
  private readonly logger = new Logger(PublisherProcessor.name);

  constructor(
    private readonly productRepo: ProductRepository,
    private readonly wpProductService: WpProductService,
    private readonly geminiService: GeminiService,
    private readonly templateService: ProductTemplateService,
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

      let finalDescription: string | null = null;

      if (product.templateId) {
        this.logger.log(
          `📄 Product is assigned to Batch Template ID: ${product.templateId}. Rendering direct template...`,
        );
        finalDescription = await this.templateService.renderTemplateById(
          product.templateId,
          {
            title: product.name,
            sku: product.sku,
            material: product.material,
            carModels: product.carModels,
            shortDescription: product.shortDescription,
          },
        );
      } else {
        this.logger.log(
          `🤖 Generating AI product description for: ${product.name}`,
        );
        const aiDescription =
          await this.geminiService.generateProductDescription({
            title: product.name,
            sku: product.sku,
            material: product.material,
            carModels: product.carModels,
            shortDescription: product.shortDescription,
          });

        finalDescription = aiDescription;

        if (aiDescription) {
          this.logger.log(`✅ AI description generated successfully.`);
        } else {
          this.logger.warn(`⚠️ Falling back to rich Product Template Service.`);
          finalDescription = await this.templateService.renderFallbackHtml({
            title: product.name,
            sku: product.sku,
            material: product.material,
            carModels: product.carModels,
            shortDescription: product.shortDescription,
          });
        }
      }

      const wpProduct = await this.wpProductService.publishProduct({
        title: product.name,
        rawContent: finalDescription || '',
        price: product.price,
        material: product.material,
        carModels: product.carModels,
        shopeeLink: product.shopeeLink,
        lazadaLink: product.lazadaLink,
        tiktokLink: product.tiktokLink,
        videoUrl: product.videoUrl,
        imageUrl: product.imageUrl,
        galleryImageUrls: product.galleryImageUrls,
        categoryName: product.category,
        tags: product.tags,
        brand: product.brand,
        shortDescription: product.shortDescription,
        existingWpId: product.wpPostId,
      });

      this.logger.log(
        `🔗 WooCommerce created product ID: ${wpProduct.id} - URL: ${wpProduct.permalink}`,
      );

      product.markAsCompleted(
        wpProduct.id,
        wpProduct.permalink,
        finalDescription || '',
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
