import { Injectable } from "@nestjs/common";
import {
  DuplicateProductReferenceError,
  InvalidCategoryIdError,
  InvalidRuleIdsError,
  InvalidUnitOfMeasureIdError,
  ProductNotFoundError,
} from "@domain/errors";
import { ProductRepository, ProductWithRules } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";
import type { RuleViolation } from "@domain/types";
import { RuleViolationDetectorService } from "@domain/services";

export interface UpdateProductInput {
  id: number;
  reference?: string;
  name?: string;
  unitOfMeasureId?: number;
  categoryId?: number | null;
  minimumStock?: number | null;
  expiryAlertThreshold?: number | null;
  ruleIds?: number[];
}

export interface UpdateProductOutput {
  productWithRules: ProductWithRules;
  violations: RuleViolation[];
}

@Injectable()
export class UpdateProductUseCase implements QueryUseCase<
  UpdateProductInput,
  UpdateProductOutput
> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly violationDetector: RuleViolationDetectorService
  ) {}

  async execute(input: UpdateProductInput): Promise<UpdateProductOutput> {
    const existing = await this.productRepository.findById(input.id);
    if (!existing) {
      throw new ProductNotFoundError(input.id);
    }

    if (
      input.reference !== undefined &&
      input.reference !== existing.product.reference
    ) {
      const duplicate = await this.productRepository.findByReference(
        input.reference
      );
      if (duplicate) {
        throw new DuplicateProductReferenceError(input.reference);
      }
    }

    if (input.unitOfMeasureId !== undefined) {
      const unitExists = await this.productRepository.validateUnitOfMeasureId(
        input.unitOfMeasureId
      );
      if (!unitExists) {
        throw new InvalidUnitOfMeasureIdError(input.unitOfMeasureId);
      }
    }

    if (input.categoryId != null) {
      const categoryExists = await this.productRepository.validateCategoryId(
        input.categoryId
      );
      if (!categoryExists) {
        throw new InvalidCategoryIdError(input.categoryId);
      }
    }

    if (input.ruleIds !== undefined && input.ruleIds.length > 0) {
      const invalidRuleIds = await this.productRepository.validateRuleIds(
        input.ruleIds
      );
      if (invalidRuleIds.length > 0) {
        throw new InvalidRuleIdsError(invalidRuleIds);
      }
    }

    const productWithRules = await this.productRepository.update(input.id, {
      reference: input.reference,
      name: input.name,
      unitOfMeasureId: input.unitOfMeasureId,
      categoryId: input.categoryId,
      minimumStock: input.minimumStock,
      expiryAlertThreshold: input.expiryAlertThreshold,
      ruleIds: input.ruleIds,
    });

    // Detect violations for newly added rules
    let violations: RuleViolation[] = [];
    if (input.ruleIds !== undefined && input.ruleIds.length > 0) {
      const existingRuleIds = new Set(existing.ruleIds);
      const addedRuleIds = input.ruleIds.filter(
        (id) => !existingRuleIds.has(id)
      );

      const violationResults = await Promise.all(
        addedRuleIds.map((ruleId) =>
          this.violationDetector.detectViolations(ruleId)
        )
      );
      violations = violationResults.flat();
    }

    return { productWithRules, violations };
  }
}
