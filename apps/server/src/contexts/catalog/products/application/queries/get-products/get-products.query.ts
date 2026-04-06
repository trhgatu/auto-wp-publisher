export class GetProductsQuery {
  constructor(
    public readonly limit: number = 20,
    public readonly offset: number = 0,
    public readonly status?: string,
    public readonly search?: string,
  ) {}
}
