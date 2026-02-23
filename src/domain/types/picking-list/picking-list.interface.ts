import { PickingListItemStatus } from "./picking-list-item-status.enum";
import { PickingListStatus } from "./picking-list-status.enum";

export interface IPickingList {
  id: number;
  status: PickingListStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPickingListItem {
  id: number;
  pickingListId: number;
  productId: number;
  productName?: string;
  requestedQuantity: number;
  pickedQuantity?: number | null;
  status?: PickingListItemStatus;
  createdAt: Date;
  updatedAt: Date;
}
