import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PermanentlyDeleteProductCommand } from './permanently-delete-product.command';
import { ProductRepository } from '../../../domain/product.repository';
import { ProductId } from '../../../domain/value-objects/product-id.vo';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(PermanentlyDeleteProductCommand)
export class PermanentlyDeleteProductHandler implements ICommandHandler<PermanentlyDeleteProductCommand> {
  constructor(private readonly repository: ProductRepository) {}

  async execute(command: PermanentlyDeleteProductCommand): Promise<void> {
    const id = ProductId.create(command.id);
    const product = await this.repository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${command.id} not found`);
    }

    await this.repository.delete(id);
  }
}
