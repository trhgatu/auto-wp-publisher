import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PermanentlyDeleteAllProductsCommand } from './permanent-delete-all-products.command';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { ProductRepository } from '../../../domain/product.repository';
import { ProductId } from '../../../domain/value-objects/product-id.vo';

@CommandHandler(PermanentlyDeleteAllProductsCommand)
export class PermanentlyDeleteAllProductsHandler implements ICommandHandler<PermanentlyDeleteAllProductsCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: ProductRepository,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(_command: PermanentlyDeleteAllProductsCommand): Promise<void> {
    const products = await this.prisma.product.findMany({
      where: { deletedAt: { not: null } },
    });

    for (const raw of products) {
      await this.repository.delete(ProductId.create(raw.id));
    }
  }
}
