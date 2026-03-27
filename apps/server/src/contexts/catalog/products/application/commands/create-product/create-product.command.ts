import { ImportProductDto } from '@repo/shared';

export class CreateProductCommand {
  constructor(public readonly data: ImportProductDto) {}
}
