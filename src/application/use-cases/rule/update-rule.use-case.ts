import { Injectable } from "@nestjs/common";
import {
  InvalidPalettierIdsError,
  InvalidPalettierTypeIdError,
  RuleNotFoundError,
  RuleTypeMismatchError,
  ValidationError,
} from "@domain/errors";
import {
  RuleRepository,
  RuleWithConfig,
  UpdateRuleWithConfigData,
} from "@domain/repositories";
import {
  ErrorCode,
  PlacementConstraintType,
  QueryUseCase,
  RuleType,
  SelectionMode,
} from "@domain/types";
import type { RuleViolation } from "@domain/types";
import { RuleViolationDetectorService } from "@domain/services";

export interface UpdateRuleInput {
  id: number;
  name?: string;
  description?: string | null;
  isActive?: boolean;
  zonePriorityConfig?: {
    priorityLevel?: number;
    palettierIds?: number[];
  };
  productIncompatibilityConfig?: {
    categoryId?: number;
    minimumDistance?: number;
  };
  storageConditionConfig?: {
    conditionType?: string;
    selectionMode?: SelectionMode;
    palettierTypeId?: number | null;
    palettierIds?: number[];
  };
  placementConstraintConfig?: {
    constraintType?: PlacementConstraintType;
    maxHeight?: number | null;
  };
}

export interface UpdateRuleOutput {
  ruleWithConfig: RuleWithConfig;
  violations: RuleViolation[];
}

@Injectable()
export class UpdateRuleUseCase implements QueryUseCase<
  UpdateRuleInput,
  UpdateRuleOutput
> {
  constructor(
    private readonly ruleRepository: RuleRepository,
    private readonly violationDetector: RuleViolationDetectorService
  ) {}

  async execute(input: UpdateRuleInput): Promise<UpdateRuleOutput> {
    const existingRule = await this.ruleRepository.findById(input.id);

    if (!existingRule) {
      throw new RuleNotFoundError(input.id);
    }

    this.validateConfigTypeMatch(existingRule, input);

    await this.validateForeignKeys(input);

    const updateData: UpdateRuleWithConfigData = {
      rule:
        input.name !== undefined ||
        input.description !== undefined ||
        input.isActive !== undefined
          ? {
              name: input.name,
              description: input.description,
              isActive: input.isActive,
            }
          : undefined,
      zonePriorityConfig: input.zonePriorityConfig,
      productIncompatibilityConfig: input.productIncompatibilityConfig,
      storageConditionConfig: input.storageConditionConfig,
      placementConstraintConfig: input.placementConstraintConfig,
    };

    const ruleWithConfig = await this.ruleRepository.update(
      input.id,
      updateData
    );
    const violations = await this.violationDetector.detectViolations(input.id);

    return { ruleWithConfig, violations };
  }

  private validateConfigTypeMatch(
    existingRule: RuleWithConfig,
    input: UpdateRuleInput
  ): void {
    const ruleType = existingRule.rule.type;

    if (input.zonePriorityConfig && ruleType !== RuleType.ZONE_PRIORITY) {
      throw new RuleTypeMismatchError(
        input.id,
        RuleType.ZONE_PRIORITY,
        ruleType
      );
    }

    if (
      input.productIncompatibilityConfig &&
      ruleType !== RuleType.PRODUCT_INCOMPATIBILITY
    ) {
      throw new RuleTypeMismatchError(
        input.id,
        RuleType.PRODUCT_INCOMPATIBILITY,
        ruleType
      );
    }

    if (
      input.storageConditionConfig &&
      ruleType !== RuleType.STORAGE_CONDITION
    ) {
      throw new RuleTypeMismatchError(
        input.id,
        RuleType.STORAGE_CONDITION,
        ruleType
      );
    }

    if (
      input.placementConstraintConfig &&
      ruleType !== RuleType.PLACEMENT_CONSTRAINT
    ) {
      throw new RuleTypeMismatchError(
        input.id,
        RuleType.PLACEMENT_CONSTRAINT,
        ruleType
      );
    }

    if (input.placementConstraintConfig) {
      const { constraintType, maxHeight } = input.placementConstraintConfig;
      if (
        constraintType === PlacementConstraintType.GROUND_ONLY &&
        maxHeight !== undefined &&
        maxHeight !== null
      ) {
        throw new ValidationError(
          "maxHeight must not be provided when constraintType is 'ground_only'",
          { code: ErrorCode.DTO_VALIDATION_FAILED }
        );
      }
    }
  }

  private async validateForeignKeys(input: UpdateRuleInput): Promise<void> {
    if (input.zonePriorityConfig?.palettierIds) {
      const invalidPalettierIds =
        await this.ruleRepository.validatePalettierIds(
          input.zonePriorityConfig.palettierIds
        );
      if (invalidPalettierIds.length > 0) {
        throw new InvalidPalettierIdsError(invalidPalettierIds);
      }
    }

    if (input.storageConditionConfig) {
      if (input.storageConditionConfig.palettierIds) {
        const invalidPalettierIds =
          await this.ruleRepository.validatePalettierIds(
            input.storageConditionConfig.palettierIds
          );
        if (invalidPalettierIds.length > 0) {
          throw new InvalidPalettierIdsError(invalidPalettierIds);
        }
      }

      if (
        input.storageConditionConfig.palettierTypeId !== undefined &&
        input.storageConditionConfig.palettierTypeId !== null
      ) {
        const exists = await this.ruleRepository.validatePalettierTypeId(
          input.storageConditionConfig.palettierTypeId
        );
        if (!exists) {
          throw new InvalidPalettierTypeIdError(
            input.storageConditionConfig.palettierTypeId
          );
        }
      }
    }
  }
}
