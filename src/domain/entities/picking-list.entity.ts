import { IPickingList, PickingListStatus } from "@domain/types";
import { PickingListItemEntity } from "./picking-list-item.entity";

export class PickingListEntity implements IPickingList {
  public readonly id: number;
  public readonly status: PickingListStatus;
  public readonly items: PickingListItemEntity[];
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(
    params: IPickingList & { items?: PickingListItemEntity[] },
  ) {
    this.id = params.id;
    this.status = params.status;
    this.items = params.items ?? [];
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}
