export interface PlacementRecommendation {
  palettierId: number;
  palettierName: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  reasoning: string;
}

export interface PlacementInput {
  productIds: number[];
  productCategoryIds: (number | null)[];
}
