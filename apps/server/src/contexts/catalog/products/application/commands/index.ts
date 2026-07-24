import { CreateProductHandler } from './create-product/create-product.handler';
import { BulkCreateProductsHandler } from './bulk-create-products/bulk-create-products.handler';
import { TrashProductHandler } from './trash-product/trash-product.handler';
import { RestoreProductHandler } from './restore-product/restore-product.handler';
import { PermanentlyDeleteProductHandler } from './permanently-delete-product/permanently-delete-product.handler';
import { TrashAllProductsHandler } from './trash-all-products/trash-all-products.handler';
import { PermanentlyDeleteAllProductsHandler } from './permanent-delete-all-products/permanent-delete-all-products.handler';

export * from './create-product/create-product.command';
export * from './create-product/create-product.handler';
export * from './bulk-create-products/bulk-create-products.command';
export * from './bulk-create-products/bulk-create-products.handler';
export * from './trash-product/trash-product.command';
export * from './trash-product/trash-product.handler';
export * from './restore-product/restore-product.command';
export * from './restore-product/restore-product.handler';
export * from './permanently-delete-product/permanently-delete-product.command';
export * from './permanently-delete-product/permanently-delete-product.handler';
export * from './trash-all-products/trash-all-products.command';
export * from './trash-all-products/trash-all-products.handler';
export * from './permanent-delete-all-products/permanent-delete-all-products.command';
export * from './permanent-delete-all-products/permanent-delete-all-products.handler';

export const CommandHandlers = [
  CreateProductHandler,
  BulkCreateProductsHandler,
  TrashProductHandler,
  RestoreProductHandler,
  PermanentlyDeleteProductHandler,
  TrashAllProductsHandler,
  PermanentlyDeleteAllProductsHandler,
];
