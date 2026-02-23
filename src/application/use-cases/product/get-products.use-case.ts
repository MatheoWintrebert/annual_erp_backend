import { Injectable } from "@nestjs/common";
import { FindProductsResult, ProductRepository } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

export interface GetProductsInput {
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class GetProductsUseCase implements QueryUseCase<
  GetProductsInput,
  FindProductsResult
> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: GetProductsInput): Promise<FindProductsResult> {
    return this.productRepository.findAll({
      search: input.search,
      page: input.page ?? 1,
      limit: input.limit ?? 20,
    });
  }
}
