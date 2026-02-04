import {
  IRuleStorageConditionConfig,
  IRuleStorageConditionPalettier,
  SelectionMode,
} from "@domain/types";

export class RuleStorageConditionConfigEntity implements IRuleStorageConditionConfig {
  public readonly id: number;
  public readonly ruleId: number;
  public readonly conditionType: string;
  public readonly selectionMode: SelectionMode;
  public readonly palettierTypeId: number | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: IRuleStorageConditionConfig) {
    this.id = params.id;
    this.ruleId = params.ruleId;
    this.conditionType = params.conditionType;
    this.selectionMode = params.selectionMode;
    this.palettierTypeId = params.palettierTypeId;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}

export class RuleStorageConditionPalettierEntity implements IRuleStorageConditionPalettier {
  public readonly id: number;
  public readonly configId: number;
  public readonly palettierId: number;

  constructor(params: IRuleStorageConditionPalettier) {
    this.id = params.id;
    this.configId = params.configId;
    this.palettierId = params.palettierId;
  }
}
