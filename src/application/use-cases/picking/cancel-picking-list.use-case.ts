import { Injectable } from "@nestjs/common";
import { PickingListRepository } from "@domain/repositories";
import {
  PickingListAlreadyCancelledError,
  PickingListAlreadyCompletedError,
  PickingListNotFoundError,
} from "@domain/errors";
import {
  CancelPickingListResult,
  MutationUseCase,
  PickingListStatus,
} from "@domain/types";

@Injectable()
export class CancelPickingListUseCase implements MutationUseCase<
  number,
  CancelPickingListResult
> {
  constructor(private readonly pickingListRepository: PickingListRepository) {}

  async execute(pickingListId: number): Promise<CancelPickingListResult> {
    const pickingList =
      await this.pickingListRepository.findById(pickingListId);

    if (!pickingList) {
      throw new PickingListNotFoundError(pickingListId);
    }

    if (pickingList.status === PickingListStatus.COMPLETED) {
      throw new PickingListAlreadyCompletedError(pickingListId);
    }

    if (pickingList.status === PickingListStatus.CANCELLED) {
      throw new PickingListAlreadyCancelledError(pickingListId);
    }

    await this.pickingListRepository.updateStatus(
      pickingListId,
      PickingListStatus.CANCELLED
    );

    return {
      pickingListId,
      status: PickingListStatus.CANCELLED,
    };
  }
}
