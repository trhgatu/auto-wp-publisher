import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TrashProductCommand } from './trash-product.command';
import { ProductRepository } from '../../../domain/product.repository';
import { ProductId } from '../../../domain/value-objects/product-id.vo';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(TrashProductCommand)
export class TrashProductHandler implements ICommandHandler<TrashProductCommand> {
  constructor(private readonly repository: ProductRepository) {}

  async execute(command: TrashProductCommand): Promise<void> {
    const product = await this.repository.findById(
      ProductId.create(command.id),
    );
    if (!product) {
      throw new NotFoundException(`Product with ID ${command.id} not found`);
    }

    product.trash();
    await this.repository.save(product);
  }
}
