export interface IRuleZonePriorityConfig {
  id: number;
  ruleId: number;
  priorityLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRuleZonePriorityPalettier {
  id: number;
  configId: number;
  palettierId: number;
}
