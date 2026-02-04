import { SelectionMode } from "@domain/types/enums";

export interface IRuleStorageConditionConfig {
  id: number;
  ruleId: number;
  conditionType: string;
  selectionMode: SelectionMode;
  palettierTypeId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRuleStorageConditionPalettier {
  id: number;
  configId: number;
  palettierId: number;
}
