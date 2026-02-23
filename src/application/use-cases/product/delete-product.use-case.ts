import { Injectable } from "@nestjs/common";
import {
  ProductNotFoundError,
  ProductHasActivePalettesError,
} from "@domain/errors";
import { ProductRepository } from "@domain/repositories";
import { CommandUseCase } from "@domain/types";

export interface DeleteProductInput {
  id: number;
}

@Injectable()
export class DeleteProductUseCase implements CommandUseCase<DeleteProductInput> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: DeleteProductInput): Promise<void> {
    const product = await this.productRepository.findById(input.id);

    if (!product) {
      throw new ProductNotFoundError(input.id);
    }

    const activePaletteCount = await this.productRepository.countActivePalettes(
      input.id
    );

    if (activePaletteCount > 0) {
      throw new ProductHasActivePalettesError(input.id, activePaletteCount);
    }

    await this.productRepository.softDelete(input.id);
  }
}
