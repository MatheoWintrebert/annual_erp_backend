import { Injectable } from "@nestjs/common";
import { InvalidProductIdsError, RuleNotFoundError } from "@domain/errors";
import { RuleRepository } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";
import type { RuleViolation } from "@domain/types";
import { RuleViolationDetectorService } from "@domain/services";

export interface LinkProductsToRuleInput {
  ruleId: number;
  productIds: number[];
}

export interface LinkProductsToRuleOutput {
  violations: RuleViolation[];
}

@Injectable()
export class LinkProductsToRuleUseCase implements QueryUseCase<
  LinkProductsToRuleInput,
  LinkProductsToRuleOutput
> {
  constructor(
    private readonly ruleRepository: RuleRepository,
    private readonly violationDetector: RuleViolationDetectorService
  ) {}

  async execute(
    input: LinkProductsToRuleInput
  ): Promise<LinkProductsToRuleOutput> {
    const rule = await this.ruleRepository.findById(input.ruleId);

    if (!rule) {
      throw new RuleNotFoundError(input.ruleId);
    }

    const invalidProductIds = await this.ruleRepository.validateProductIds(
      input.productIds
    );
    if (invalidProductIds.length > 0) {
      throw new InvalidProductIdsError(invalidProductIds);
    }

    await this.ruleRepository.linkProducts(input.ruleId, input.productIds);

    const violations = await this.violationDetector.detectViolations(
      input.ruleId
    );

    return { violations };
  }
}
