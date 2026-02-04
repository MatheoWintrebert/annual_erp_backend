import {
  IRuleZonePriorityConfig,
  IRuleZonePriorityPalettier,
} from "@domain/types";

export class RuleZonePriorityConfigEntity implements IRuleZonePriorityConfig {
  public readonly id: number;
  public readonly ruleId: number;
  public readonly priorityLevel: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: IRuleZonePriorityConfig) {
    this.id = params.id;
    this.ruleId = params.ruleId;
    this.priorityLevel = params.priorityLevel;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}

export class RuleZonePriorityPalettierEntity implements IRuleZonePriorityPalettier {
  public readonly id: number;
  public readonly configId: number;
  public readonly palettierId: number;

  constructor(params: IRuleZonePriorityPalettier) {
    this.id = params.id;
    this.configId = params.configId;
    this.palettierId = params.palettierId;
  }
}
