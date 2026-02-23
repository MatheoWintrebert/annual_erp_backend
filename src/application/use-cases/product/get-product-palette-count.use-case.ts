import { Injectable } from "@nestjs/common";
import { ProductNotFoundError } from "@domain/errors";
import { ProductRepository } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

export interface GetProductPaletteCountInput {
  id: number;
}

export interface GetProductPaletteCountOutput {
  count: number;
}

@Injectable()
export class GetProductPaletteCountUseCase implements QueryUseCase<
  GetProductPaletteCountInput,
  GetProductPaletteCountOutput
> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(
    input: GetProductPaletteCountInput
  ): Promise<GetProductPaletteCountOutput> {
    const product = await this.productRepository.findById(input.id);

    if (!product) {
      throw new ProductNotFoundError(input.id);
    }

    const count = await this.productRepository.countActivePalettes(input.id);

    return { count };
  }
}
