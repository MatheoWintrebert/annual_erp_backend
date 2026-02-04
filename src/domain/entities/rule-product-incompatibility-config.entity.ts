import { IRuleProductIncompatibilityConfig } from "@domain/types";

export class RuleProductIncompatibilityConfigEntity implements IRuleProductIncompatibilityConfig {
  public readonly id: number;
  public readonly ruleId: number;
  public readonly category: string;
  public readonly minimumDistance: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: IRuleProductIncompatibilityConfig) {
    this.id = params.id;
    this.ruleId = params.ruleId;
    this.category = params.category;
    this.minimumDistance = params.minimumDistance;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}
