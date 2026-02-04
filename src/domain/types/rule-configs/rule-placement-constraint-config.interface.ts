import { PlacementConstraintType } from "@domain/types/enums";

export interface IRulePlacementConstraintConfig {
  id: number;
  ruleId: number;
  constraintType: PlacementConstraintType;
  maxHeight: number | null;
  createdAt: Date;
  updatedAt: Date;
}
