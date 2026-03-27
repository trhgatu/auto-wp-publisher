export class ProductResponse {
  id: string;
  message: string;

  constructor(id: string) {
    this.id = id;
    this.message =
      'Sản phẩm đã được đưa vào hàng đợi xử lý nền (Background Job).';
  }
}
