import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductsBySkusQuery } from './get-products-by-skus.query';
import { ProductRepository } from '../../../domain/product.repository';

@QueryHandler(GetProductsBySkusQuery)
export class GetProductsBySkusHandler implements IQueryHandler<GetProductsBySkusQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductsBySkusQuery) {
    const products = await this.productRepository.findBySkus(query.skus);
    return products.map((p) => ({
      id: p.id.value,
      sku: p.sku,
      status: p.status,
      wpUrl: p.wpUrl,
    }));
  }
}
