import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Request, Response } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { DomainExceptionFilter } from './shared/infrastructure/filters/domain-exception.filter';
import { LoggingInterceptor } from './shared/infrastructure/interceptors/logging.interceptor';

/**
 * Parse the CORS_ORIGINS env value into a value `enableCors` understands.
 * "*" (or empty) allows any origin; a comma-separated list restricts to
 * those origins and enables credentialed requests.
 */
function resolveCorsOptions(raw: string) {
  const value = (raw ?? '*').trim();
  if (value === '' || value === '*') {
    return { origin: true, credentials: false } as const;
  }
  const origins = value
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return { origin: origins, credentials: true };
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // --- Security & performance middleware ---
  app.use(helmet());
  app.use(compression());

  const cors = resolveCorsOptions(config.get<string>('CORS_ORIGINS', '*'));
  app.enableCors({
    ...cors,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // --- Global pipes / filters / interceptors ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix, { exclude: ['health'] });

  // --- OpenAPI / Swagger docs ---
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auto WP Publisher API')
    .setDescription(
      'REST API for the Auto WP Publisher platform — bulk product import, ' +
        'AI content optimization and WordPress/WooCommerce publishing.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  const server = app.getHttpAdapter();
  server.get('/', (req: Request, res: Response) => res.status(200).send('OK'));

  const port = config.get<number>('PORT', 3000);
  await app.listen(port, '::');

  logger.log(
    `🚀 Auto WP Publisher API running on: http://localhost:${port}/${globalPrefix}`,
  );
  logger.log(
    `📚 API docs available at: http://localhost:${port}/${globalPrefix}/docs`,
  );
}

bootstrap().catch((err) => {
  console.error('💥 Critical Error during system startup:', err);
  process.exit(1);
});
