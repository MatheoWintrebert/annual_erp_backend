import {
  RuleEntity,
  RulePlacementConstraintConfigEntity,
  RuleProductIncompatibilityConfigEntity,
  RuleStorageConditionConfigEntity,
  RuleZonePriorityConfigEntity,
} from "@domain/entities";
import {
  PlacementConstraintType,
  RuleType,
  SelectionMode,
} from "@domain/types";
import type { PaletteForViolationCheck } from "@domain/services";
import { EntityManager } from "typeorm";

export interface RuleWithConfig {
  rule: RuleEntity;
  zonePriorityConfig?: RuleZonePriorityConfigEntity & {
    palettierIds: number[];
  };
  productIncompatibilityConfig?: RuleProductIncompatibilityConfigEntity;
  storageConditionConfig?: RuleStorageConditionConfigEntity & {
    palettierIds: number[];
  };
  placementConstraintConfig?: RulePlacementConstraintConfigEntity;
  productIds?: number[];
}

export interface FindRulesOptions {
  type?: RuleType;
  isActive?: boolean;
  includeProducts?: boolean;
  page?: number;
  limit?: number;
}

export interface FindRulesResult {
  rules: RuleWithConfig[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateRuleData {
  name: string;
  description?: string | null;
  type: RuleType;
  isActive?: boolean;
  productIds?: number[];
}

export interface CreateZonePriorityConfigData {
  priorityLevel: number;
  palettierIds: number[];
}

export interface CreateProductIncompatibilityConfigData {
  categoryId: number;
  minimumDistance: number;
}

export interface CreateStorageConditionConfigData {
  conditionType: string;
  selectionMode: SelectionMode;
  palettierTypeId?: number | null;
  palettierIds?: number[];
}

export interface CreatePlacementConstraintConfigData {
  constraintType: PlacementConstraintType;
  maxHeight?: number | null;
}

export interface CreateRuleWithConfigData {
  rule: CreateRuleData;
  zonePriorityConfig?: CreateZonePriorityConfigData;
  productIncompatibilityConfig?: CreateProductIncompatibilityConfigData;
  storageConditionConfig?: CreateStorageConditionConfigData;
  placementConstraintConfig?: CreatePlacementConstraintConfigData;
}

export interface UpdateRuleData {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateZonePriorityConfigData {
  priorityLevel?: number;
  palettierIds?: number[];
}

export interface UpdateProductIncompatibilityConfigData {
  categoryId?: number;
  minimumDistance?: number;
}

export interface UpdateStorageConditionConfigData {
  conditionType?: string;
  selectionMode?: SelectionMode;
  palettierTypeId?: number | null;
  palettierIds?: number[];
}

export interface UpdatePlacementConstraintConfigData {
  constraintType?: PlacementConstraintType;
  maxHeight?: number | null;
}

export interface UpdateRuleWithConfigData {
  rule?: UpdateRuleData;
  zonePriorityConfig?: UpdateZonePriorityConfigData;
  productIncompatibilityConfig?: UpdateProductIncompatibilityConfigData;
  storageConditionConfig?: UpdateStorageConditionConfigData;
  placementConstraintConfig?: UpdatePlacementConstraintConfigData;
}

export abstract class RuleRepository {
  abstract findById(
    id: number,
    options?: { includeProducts?: boolean }
  ): Promise<RuleWithConfig | null>;

  abstract findAll(options?: FindRulesOptions): Promise<FindRulesResult>;

  abstract createBatch(
    rules: CreateRuleWithConfigData[],
    transactionManager?: EntityManager
  ): Promise<RuleWithConfig[]>;

  abstract update(
    id: number,
    data: UpdateRuleWithConfigData
  ): Promise<RuleWithConfig>;

  abstract softDelete(id: number): Promise<void>;

  abstract linkProducts(
    ruleId: number,
    productIds: number[],
    transactionManager?: EntityManager
  ): Promise<void>;

  abstract unlinkProducts(ruleId: number, productIds: number[]): Promise<void>;

  abstract validatePalettierIds(ids: number[]): Promise<number[]>;

  abstract validateProductIds(ids: number[]): Promise<number[]>;

  abstract validatePalettierTypeId(id: number): Promise<boolean>;

  abstract findPalettesForViolationCheck(
    ruleId: number
  ): Promise<PaletteForViolationCheck[]>;

  abstract countActiveRules(): Promise<number>;
}
