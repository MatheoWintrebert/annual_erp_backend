import { PlacementRecommendation } from "./placement-result.interface";

export interface ConflictGroup {
  productIds: number[];
  productNames: string[];
  recommendation: PlacementRecommendation | null;
  reasoning: string;
}

export interface ResolvedPlacementResult {
  status: "resolved";
  recommendation: PlacementRecommendation;
}

export interface ConflictPlacementResult {
  status: "conflict";
  conflictExplanation: string;
  groups: ConflictGroup[];
}

export type PlacementResult = ResolvedPlacementResult | ConflictPlacementResult;
