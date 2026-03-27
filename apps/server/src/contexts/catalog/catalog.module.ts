import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PublisherProcessor } from './jobs/publisher.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'wp-publisher',
    }),
  ],
  providers: [PublisherProcessor],
  exports: [BullModule],
})
export class CatalogModule {}
