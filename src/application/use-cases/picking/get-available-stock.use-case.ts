import { Injectable } from "@nestjs/common";
import { PaletteRepository } from "@domain/repositories";
import { ProductStock, QueryUseCase } from "@domain/types";

@Injectable()
export class GetAvailableStockUseCase implements QueryUseCase<
  number[],
  ProductStock[]
> {
  constructor(private readonly paletteRepository: PaletteRepository) {}

  async execute(productIds: number[]): Promise<ProductStock[]> {
    if (productIds.length === 0) {
      return [];
    }

    return this.paletteRepository.getAvailableStockByProductIds(productIds);
  }
}
