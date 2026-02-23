export interface PickRouteInput {
  productId: number;
  requestedQuantity: number;
}

export interface PickRouteItem {
  pickingListItemId: number;
  productId: number;
  productName: string;
  productReference: string;
  palettierName: string;
  paletteId: number;
  paletteLotId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  quantityToPick: number;
  expiryDate: Date | null;
  lotReference: string;
}

export interface PaletteLotFefoData {
  paletteLotId: number;
  paletteId: number;
  palettierId: number;
  palettierName: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  lotId: number;
  lotReference: string;
  expiryDate: Date | null;
  quantity: number;
  productId: number;
  productName: string;
  productReference: string;
}
