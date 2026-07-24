import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { TrashAllProductsCommand } from './trash-all-products.command';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { ProductRepository } from '../../../domain/product.repository';
import { ProductId } from '../../../domain/value-objects/product-id.vo';

@CommandHandler(TrashAllProductsCommand)
export class TrashAllProductsHandler implements ICommandHandler<TrashAllProductsCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: ProductRepository,
    private readonly publisher: EventPublisher,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(_command: TrashAllProductsCommand): Promise<void> {
    const products = await this.prisma.product.findMany({
      where: { deletedAt: null },
    });

    for (const raw of products) {
      const product = await this.repository.findById(ProductId.create(raw.id));
      if (product) {
        product.trash();
        await this.repository.save(product);
        this.publisher.mergeObjectContext(product).commit();
      }
    }
  }
}
