import { IPickingListItem, PickingListItemStatus } from "@domain/types";

export class PickingListItemEntity implements IPickingListItem {
  public readonly id: number;
  public readonly pickingListId: number;
  public readonly productId: number;
  public readonly productName?: string;
  public readonly requestedQuantity: number;
  public readonly pickedQuantity: number | null;
  public readonly status: PickingListItemStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: IPickingListItem) {
    this.id = params.id;
    this.pickingListId = params.pickingListId;
    this.productId = params.productId;
    this.productName = params.productName;
    this.requestedQuantity = params.requestedQuantity;
    this.pickedQuantity = params.pickedQuantity ?? null;
    this.status = params.status ?? PickingListItemStatus.PENDING;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}
