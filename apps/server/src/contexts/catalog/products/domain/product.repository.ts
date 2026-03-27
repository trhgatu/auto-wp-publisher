import { Product } from './entities/product.entity';
import { ProductId } from './value-objects/product-id.vo';

export abstract class ProductRepository {
  abstract save(product: Product): Promise<void>;
  abstract findById(id: ProductId): Promise<Product | null>;
}
