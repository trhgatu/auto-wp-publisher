import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreateProductCommand,
  BulkCreateProductsCommand,
  TrashProductCommand,
  RestoreProductCommand,
  PermanentlyDeleteProductCommand,
  TrashAllProductsCommand,
  PermanentlyDeleteAllProductsCommand,
  GetProductsQuery,
  GetProductByIdQuery,
  GetDashboardStatsQuery,
  GetProductsBySkusQuery,
} from '@catalog/products/application';
import { ProductResponse } from '../responses/product.response';
import {
  ImportProductSchema,
  ImportProductDto,
  BulkImportProductDto,
  BulkImportProductSchema,
} from '@repo/shared';
import { ZodValidationPipe } from '@shared/infrastructure/pipes/zod-validation.pipe';
import { z } from 'zod';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { MediaUploadService } from '@catalog/integrations';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
    private readonly mediaUploadService: MediaUploadService,
    @InjectQueue('wp-publisher')
    private readonly wpPublisherQueue: Queue,
  ) {}

  @Get()
  async getProducts(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('onlyTrashed') onlyTrashed: string = 'false',
  ) {
    const { items, total } = await this.queryBus.execute<
      GetProductsQuery,
      { items: unknown[]; total: number }
    >(
      new GetProductsQuery(
        Number(limit),
        Number(offset),
        status,
        search,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        onlyTrashed === 'true',
      ),
    );
    return { items, total };
  }

  @Get('dashboard/stats')
  async getDashboardStats(): Promise<unknown> {
    return this.queryBus.execute(new GetDashboardStatsQuery());
  }

  @Get('check-skus')
  async checkSkus(@Query('skus') skus: string): Promise<unknown> {
    if (!skus) return [];
    return this.queryBus.execute<GetProductsBySkusQuery, unknown>(
      new GetProductsBySkusQuery(skus.split(',').map((s) => s.trim())),
    );
  }

  @Get(':id')
  async getProductById(@Param('id') id: string): Promise<unknown> {
    return this.queryBus.execute(new GetProductByIdQuery(id));
  }

  @Post()
  async createProduct(
    @Body(new ZodValidationPipe(ImportProductSchema as unknown as z.ZodSchema))
    data: ImportProductDto,
  ): Promise<ProductResponse> {
    const productId = await this.commandBus.execute<
      CreateProductCommand,
      string
    >(new CreateProductCommand(data));

    return new ProductResponse(productId);
  }

  @Post('bulk')
  async createBulkProducts(
    @Body(
      new ZodValidationPipe(BulkImportProductSchema as unknown as z.ZodSchema),
    )
    data: BulkImportProductDto,
    @Query('delayQueue') delayQueue?: string,
  ): Promise<Record<number, string>> {
    return this.commandBus.execute<
      BulkCreateProductsCommand,
      Record<number, string>
    >(new BulkCreateProductsCommand(data, delayQueue === 'true'));
  }

  @Post(':id/publish')
  async publishProduct(@Param('id') id: string) {
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
    return { success: true };
  }

  @Post(':id/restore')
  async restoreProduct(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new RestoreProductCommand(id));
  }

  @Post(':id/trash')
  async trashProduct(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new TrashProductCommand(id));
  }

  @Post(':id/permanent-delete')
  async permanentlyDeleteProduct(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new PermanentlyDeleteProductCommand(id));
  }

  @Post('trash-all')
  async trashAllProducts(): Promise<void> {
    await this.commandBus.execute(new TrashAllProductsCommand());
  }

  @Post('permanent-delete-all')
  async permanentlyDeleteAllProducts(): Promise<void> {
    await this.commandBus.execute(new PermanentlyDeleteAllProductsCommand());
  }

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1,
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new HttpException(
              'Chỉ hỗ trợ tải lên tệp tin hình ảnh.',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadTempImage(
    @UploadedFile()
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    },
  ) {
    if (!file) {
      throw new HttpException(
        'File không hợp lệ hoặc thiếu.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const uploadedUrl = await this.mediaUploadService.uploadToWordPress(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    return { url: uploadedUrl };
  }

  @Post(':id/upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1,
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new HttpException(
              'Chỉ hỗ trợ tải lên tệp tin hình ảnh.',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile()
    file: { buffer: Buffer; originalname: string; mimetype: string },
    @Query('type') type: 'imageUrl' | 'gallery' = 'imageUrl',
  ) {
    if (!file) {
      throw new HttpException(
        'File không hợp lệ hoặc thiếu.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new HttpException('Không tìm thấy sản phẩm.', HttpStatus.NOT_FOUND);
    }

    const uploadedUrl = await this.mediaUploadService.uploadToWordPress(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    if (type === 'gallery') {
      const currentGallery = product.galleryImageUrls
        ? product.galleryImageUrls
            .split(',')
            .map((u) => u.trim())
            .filter(Boolean)
        : [];
      currentGallery.push(uploadedUrl);
      const updatedGallery = currentGallery.join(', ');
      await this.prisma.product.update({
        where: { id },
        data: { galleryImageUrls: updatedGallery },
      });
    } else {
      await this.prisma.product.update({
        where: { id },
        data: { imageUrl: uploadedUrl },
      });
    }

    return { url: uploadedUrl };
  }
}
