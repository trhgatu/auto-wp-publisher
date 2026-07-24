import { Module } from '@nestjs/common';
import { AiSettingsController } from './ai-settings/infrastructure/http/controllers/ai-settings.controller';
import { WpSettingsController } from './wp-settings/infrastructure/http/controllers/wp-settings.controller';
import { GeminiService } from '@catalog/integrations';

@Module({
  controllers: [AiSettingsController, WpSettingsController],
  providers: [GeminiService],
})
export class SettingsModule {}
