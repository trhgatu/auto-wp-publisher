import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RestoreProductCommand } from './restore-product.command';
import { ProductRepository } from '../../../domain/product.repository';
import { ProductId } from '../../../domain/value-objects/product-id.vo';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(RestoreProductCommand)
export class RestoreProductHandler implements ICommandHandler<RestoreProductCommand> {
  constructor(private readonly repository: ProductRepository) {}

  async execute(command: RestoreProductCommand): Promise<void> {
    const product = await this.repository.findById(
      ProductId.create(command.id),
    );
    if (!product) {
      throw new NotFoundException(`Product with ID ${command.id} not found`);
    }

    product.restore();
    await this.repository.save(product);
  }
}
