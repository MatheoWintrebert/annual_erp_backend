import {
  CreatePickingListInput,
  PickingListItemStatus,
  PickingListStatus,
} from "@domain/types";
import { PickingListEntity } from "@domain/entities";

export abstract class PickingListRepository {
  abstract create(input: CreatePickingListInput): Promise<PickingListEntity>;
  abstract findById(id: number): Promise<PickingListEntity | null>;
  abstract updateStatus(id: number, status: PickingListStatus): Promise<void>;
  abstract updateItems(
    pickingListId: number,
    items: {
      id: number;
      status: PickingListItemStatus;
      pickedQuantity: number | null;
    }[]
  ): Promise<void>;
}
