import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import {
  BatchSizeLimitError,
  InvalidPalettierIdsError,
  InvalidPalettierTypeIdError,
  InvalidProductIdsError,
  ValidationError,
} from "@domain/errors";
import {
  CreateRuleWithConfigData,
  RuleRepository,
  RuleWithConfig,
} from "@domain/repositories";
import {
  ErrorCode,
  PlacementConstraintType,
  QueryUseCase,
  RuleType,
  SelectionMode,
} from "@domain/types";

const MAX_BATCH_SIZE = 50;

export interface CreateRuleItemInput {
  name: string;
  description?: string | null;
  type: RuleType;
  isActive?: boolean;
  productIds?: number[];
  zonePriorityConfig?: {
    priorityLevel: number;
    palettierIds: number[];
  };
  productIncompatibilityConfig?: {
    categoryId: number;
    minimumDistance: number;
  };
  storageConditionConfig?: {
    conditionType: string;
    selectionMode: SelectionMode;
    palettierTypeId?: number | null;
    palettierIds?: number[];
  };
  placementConstraintConfig?: {
    constraintType: PlacementConstraintType;
    maxHeight?: number | null;
  };
}

export interface CreateRulesBatchInput {
  rules: CreateRuleItemInput[];
}

@Injectable()
export class CreateRulesBatchUseCase implements QueryUseCase<
  CreateRulesBatchInput,
  RuleWithConfig[]
> {
  constructor(
    private readonly ruleRepository: RuleRepository,
    private readonly dataSource: DataSource
  ) {}

  async execute(input: CreateRulesBatchInput): Promise<RuleWithConfig[]> {
    if (input.rules.length > MAX_BATCH_SIZE) {
      throw new BatchSizeLimitError(input.rules.length, MAX_BATCH_SIZE);
    }

    this.validateRuleConfigs(input.rules);

    return this.dataSource.transaction(async (transactionManager) => {
      await this.validateForeignKeys(input.rules);

      const rulesData: CreateRuleWithConfigData[] = input.rules.map(
        (ruleInput) => this.mapToCreateRuleWithConfigData(ruleInput)
      );

      return this.ruleRepository.createBatch(rulesData, transactionManager);
    });
  }

  private validateRuleConfigs(rules: CreateRuleItemInput[]): void {
    const errors: { index: number; message: string }[] = [];

    rules.forEach((rule, index) => {
      switch (rule.type) {
        case RuleType.ZONE_PRIORITY:
          if (!rule.zonePriorityConfig) {
            errors.push({
              index,
              message: "zonePriorityConfig is required for zone_priority rules",
            });
          }
          break;

        case RuleType.PRODUCT_INCOMPATIBILITY:
          if (!rule.productIncompatibilityConfig) {
            errors.push({
              index,
              message:
                "productIncompatibilityConfig is required for product_incompatibility rules",
            });
          }
          break;

        case RuleType.STORAGE_CONDITION:
          if (!rule.storageConditionConfig) {
            errors.push({
              index,
              message:
                "storageConditionConfig is required for storage_condition rules",
            });
          } else {
            const config = rule.storageConditionConfig;
            if (
              config.selectionMode === SelectionMode.PALETTIER_TYPE &&
              !config.palettierTypeId
            ) {
              errors.push({
                index,
                message:
                  "palettierTypeId is required when selectionMode is 'palettier_type'",
              });
            }
            if (
              config.selectionMode === SelectionMode.SPECIFIC_PALETTIER &&
              (!config.palettierIds || config.palettierIds.length === 0)
            ) {
              errors.push({
                index,
                message:
                  "palettierIds is required when selectionMode is 'specific_palettier'",
              });
            }
          }
          break;

        case RuleType.PLACEMENT_CONSTRAINT:
          if (!rule.placementConstraintConfig) {
            errors.push({
              index,
              message:
                "placementConstraintConfig is required for placement_constraint rules",
            });
          } else {
            const config = rule.placementConstraintConfig;
            if (
              config.constraintType === PlacementConstraintType.MAX_HEIGHT &&
              !config.maxHeight
            ) {
              errors.push({
                index,
                message:
                  "maxHeight is required when constraintType is 'max_height'",
              });
            }
            if (
              config.constraintType === PlacementConstraintType.GROUND_ONLY &&
              config.maxHeight
            ) {
              errors.push({
                index,
                message:
                  "maxHeight must not be provided when constraintType is 'ground_only'",
              });
            }
          }
          break;
      }
    });

    if (errors.length > 0) {
      throw new ValidationError("Invalid rule configurations", {
        code: ErrorCode.DTO_VALIDATION_FAILED,
        details: { errors },
      });
    }
  }

  private async validateForeignKeys(
    rules: CreateRuleItemInput[]
  ): Promise<void> {
    const allPalettierIds = new Set<number>();
    const allProductIds = new Set<number>();
    const palettierTypeIds = new Set<number>();

    for (const rule of rules) {
      if (rule.productIds) {
        rule.productIds.forEach((id) => allProductIds.add(id));
      }

      if (rule.zonePriorityConfig?.palettierIds) {
        rule.zonePriorityConfig.palettierIds.forEach((id) =>
          allPalettierIds.add(id)
        );
      }

      if (rule.storageConditionConfig) {
        if (rule.storageConditionConfig.palettierIds) {
          rule.storageConditionConfig.palettierIds.forEach((id) =>
            allPalettierIds.add(id)
          );
        }
        if (rule.storageConditionConfig.palettierTypeId) {
          palettierTypeIds.add(rule.storageConditionConfig.palettierTypeId);
        }
      }
    }

    const invalidPalettierIds = await this.ruleRepository.validatePalettierIds(
      Array.from(allPalettierIds)
    );
    if (invalidPalettierIds.length > 0) {
      throw new InvalidPalettierIdsError(invalidPalettierIds);
    }

    const invalidProductIds = await this.ruleRepository.validateProductIds(
      Array.from(allProductIds)
    );
    if (invalidProductIds.length > 0) {
      throw new InvalidProductIdsError(invalidProductIds);
    }

    for (const palettierTypeId of palettierTypeIds) {
      const exists =
        await this.ruleRepository.validatePalettierTypeId(palettierTypeId);
      if (!exists) {
        throw new InvalidPalettierTypeIdError(palettierTypeId);
      }
    }
  }

  private mapToCreateRuleWithConfigData(
    input: CreateRuleItemInput
  ): CreateRuleWithConfigData {
    return {
      rule: {
        name: input.name,
        description: input.description,
        type: input.type,
        isActive: input.isActive,
        productIds: input.productIds,
      },
      zonePriorityConfig: input.zonePriorityConfig,
      productIncompatibilityConfig: input.productIncompatibilityConfig,
      storageConditionConfig: input.storageConditionConfig,
      placementConstraintConfig: input.placementConstraintConfig,
    };
  }
}
