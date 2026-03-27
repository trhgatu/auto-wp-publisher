import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

export interface PublishProductJobData {
  productId: string;
}

@Processor('wp-publisher')
export class PublisherProcessor extends WorkerHost {
  private readonly logger = new Logger(PublisherProcessor.name);

  async process(job: Job<PublishProductJobData, void, string>): Promise<void> {
    this.logger.log(
      `Processing job ${job.id} for product ${job.data.productId}`,
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.logger.log(`Job ${job.id} handle completed`);
  }
}
