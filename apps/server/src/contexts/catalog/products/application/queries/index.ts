import { GetProductsHandler } from './get-products/get-products.handler';
import { GetProductByIdHandler } from './get-product-by-id/get-product-by-id.handler';
import { GetDashboardStatsHandler } from './get-dashboard-stats/get-dashboard-stats.handler';
import { GetProductsBySkusHandler } from './get-products-by-skus/get-products-by-skus.handler';

export * from './get-products/get-products.query';
export * from './get-products/get-products.handler';
export * from './get-product-by-id/get-product-by-id.query';
export * from './get-product-by-id/get-product-by-id.handler';
export * from './get-dashboard-stats/get-dashboard-stats.query';
export * from './get-dashboard-stats/get-dashboard-stats.handler';
export * from './get-products-by-skus/get-products-by-skus.query';
export * from './get-products-by-skus/get-products-by-skus.handler';

export const QueryHandlers = [
  GetProductsHandler,
  GetProductByIdHandler,
  GetDashboardStatsHandler,
  GetProductsBySkusHandler,
];
