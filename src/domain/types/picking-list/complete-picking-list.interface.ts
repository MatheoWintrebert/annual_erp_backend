export interface CompletePickingListInput {
  pickingListId: number;
  items: CompletePickingListItemInput[];
}

export interface CompletePickingListItemInput {
  pickingListItemId: number;
  paletteLotId: number;
  status: "picked" | "skipped";
  pickedQuantity: number; // 0 for skipped items
}

export interface PickingCompletionResult {
  pickingListId: number;
  status: string;
  totalItemsPicked: number;
  totalItemsSkipped: number;
  deductions: StockDeduction[];
  discrepancies: PickingDiscrepancy[];
}

export interface StockDeduction {
  paletteLotId: number;
  productName: string;
  quantityDeducted: number;
  palettierName: string;
  positionX: number;
  positionY: number;
  positionZ: number;
}

export interface PickingDiscrepancy {
  pickingListItemId: number;
  productName: string;
  palettierName: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  reason: string;
}
