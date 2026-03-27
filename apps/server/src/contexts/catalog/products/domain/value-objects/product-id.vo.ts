import { validate as validateUuid } from 'uuid';
import { BaseId } from 'src/shared/value-objects/base-id.vo';

export class ProductId extends BaseId {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): ProductId {
    return new ProductId(value);
  }

  protected validate(value: string): void {
    super.validate(value);
    if (!validateUuid(value)) {
      throw new Error(`INVALID_PRODUCT_ID_FORMAT: ${value}`);
    }
  }
}
