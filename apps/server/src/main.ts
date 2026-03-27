import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainExceptionFilter } from './shared/infrastructure/filters/domain-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Mở CORS cho Frontend Vite (hoặc bất kỳ Domain hợp lệ nào khác sau này)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalFilters(new DomainExceptionFilter());

  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  const server = app.getHttpAdapter();
  server.get('/', (req: Request, res: Response) => res.status(200).send('OK'));

  const port = process.env.PORT ?? 3000;

  await app.listen(port, '0.0.0.0');

  logger.log(
    `🚀 8eyond Infinite Backend is running on: http://0.0.0.0:${port}/${globalPrefix}`,
  );
}

bootstrap().catch((err) => {
  console.error('💥 Critical Error during system startup:', err);
  process.exit(1);
});
