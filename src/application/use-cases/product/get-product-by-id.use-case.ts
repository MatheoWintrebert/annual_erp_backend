import { Injectable } from "@nestjs/common";
import { ProductNotFoundError } from "@domain/errors";
import { ProductRepository, ProductWithRules } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

export interface GetProductByIdInput {
  id: number;
}

@Injectable()
export class GetProductByIdUseCase implements QueryUseCase<
  GetProductByIdInput,
  ProductWithRules
> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: GetProductByIdInput): Promise<ProductWithRules> {
    const product = await this.productRepository.findById(input.id);

    if (!product) {
      throw new ProductNotFoundError(input.id);
    }

    return product;
  }
}
