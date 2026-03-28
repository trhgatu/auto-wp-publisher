import { BulkImportProductDto } from '@repo/shared';

export class BulkCreateProductsCommand {
  constructor(public readonly data: BulkImportProductDto) {}
}
