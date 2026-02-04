import {
  IRulePlacementConstraintConfig,
  PlacementConstraintType,
} from "@domain/types";

export class RulePlacementConstraintConfigEntity implements IRulePlacementConstraintConfig {
  public readonly id: number;
  public readonly ruleId: number;
  public readonly constraintType: PlacementConstraintType;
  public readonly maxHeight: number | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: IRulePlacementConstraintConfig) {
    this.id = params.id;
    this.ruleId = params.ruleId;
    this.constraintType = params.constraintType;
    this.maxHeight = params.maxHeight;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}
