export interface PlacementViolationWarning {
  ruleName: string;
  ruleType: string;
  reason: string;
}

export interface PaletteItemDetail {
  productId: number;
  productName: string;
  productReference: string;
  lotReference: string;
  quantity: number;
  expiryDate: Date | null;
  unitOfMeasureName: string;
}

export interface PaletteWithDetails {
  id: number;
  palettierId: number;
  palettierName: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  createdAt: Date;
  items: PaletteItemDetail[];
}
