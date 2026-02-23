import { Injectable } from "@nestjs/common";
import {
  DuplicateProductReferenceError,
  InvalidCategoryIdError,
  InvalidRuleIdsError,
  InvalidUnitOfMeasureIdError,
} from "@domain/errors";
import { ProductRepository, ProductWithRules } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

export interface CreateProductInput {
  reference: string;
  name: string;
  unitOfMeasureId: number;
  categoryId?: number | null;
  minimumStock?: number | null;
  expiryAlertThreshold?: number | null;
  ruleIds?: number[];
}

@Injectable()
export class CreateProductUseCase implements QueryUseCase<
  CreateProductInput,
  ProductWithRules
> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: CreateProductInput): Promise<ProductWithRules> {
    const existingProduct = await this.productRepository.findByReference(
      input.reference
    );
    if (existingProduct) {
      throw new DuplicateProductReferenceError(input.reference);
    }

    const unitExists = await this.productRepository.validateUnitOfMeasureId(
      input.unitOfMeasureId
    );
    if (!unitExists) {
      throw new InvalidUnitOfMeasureIdError(input.unitOfMeasureId);
    }

    if (input.categoryId != null) {
      const categoryExists = await this.productRepository.validateCategoryId(
        input.categoryId
      );
      if (!categoryExists) {
        throw new InvalidCategoryIdError(input.categoryId);
      }
    }

    if (input.ruleIds && input.ruleIds.length > 0) {
      const invalidRuleIds = await this.productRepository.validateRuleIds(
        input.ruleIds
      );
      if (invalidRuleIds.length > 0) {
        throw new InvalidRuleIdsError(invalidRuleIds);
      }
    }

    return this.productRepository.create({
      reference: input.reference,
      name: input.name,
      unitOfMeasureId: input.unitOfMeasureId,
      categoryId: input.categoryId ?? null,
      minimumStock: input.minimumStock ?? null,
      expiryAlertThreshold: input.expiryAlertThreshold ?? null,
      ruleIds: input.ruleIds,
    });
  }
}
