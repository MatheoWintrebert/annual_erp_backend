import { Injectable } from "@nestjs/common";
import { ProductNotFoundError } from "@domain/errors";
import { ProductRepository } from "@domain/repositories";
import { PlacementEngineService } from "@domain/services";
import { PlacementResult, QueryUseCase } from "@domain/types";

export interface RecommendPlacementInput {
  productIds: number[];
}

@Injectable()
export class RecommendPlacementUseCase implements QueryUseCase<
  RecommendPlacementInput,
  PlacementResult
> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly placementEngine: PlacementEngineService
  ) {}

  async execute(input: RecommendPlacementInput): Promise<PlacementResult> {
    const productsWithRules = await this.productRepository.findByIds(
      input.productIds
    );

    // Check for missing products — distinct from "no valid placement"
    const foundIds = new Set(productsWithRules.map((p) => p.product.id));
    const missingIds = input.productIds.filter((id) => !foundIds.has(id));
    if (missingIds.length > 0) {
      throw new ProductNotFoundError(missingIds[0]);
    }

    return this.placementEngine.recommendWithConflictDetection(
      {
        productIds: productsWithRules.map((p) => p.product.id),
        productCategoryIds: productsWithRules.map((p) => p.product.categoryId),
      },
      productsWithRules.map((p) => p.product.name)
    );
  }
}
