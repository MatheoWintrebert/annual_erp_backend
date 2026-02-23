import { Injectable } from "@nestjs/common";
import { PickingListRepository } from "@domain/repositories";
import { FefoService } from "@domain/services";
import {
  InvalidPickingListStatusError,
  PickingListNotFoundError,
} from "@domain/errors";
import {
  MutationUseCase,
  PickingListStatus,
  PickRouteItem,
} from "@domain/types";

@Injectable()
export class GeneratePickRouteUseCase
  implements MutationUseCase<number, PickRouteItem[]>
{
  constructor(
    private readonly pickingListRepository: PickingListRepository,
    private readonly fefoService: FefoService,
  ) {}

  async execute(pickingListId: number): Promise<PickRouteItem[]> {
    const pickingList =
      await this.pickingListRepository.findById(pickingListId);

    if (!pickingList) {
      throw new PickingListNotFoundError(pickingListId);
    }

    if (pickingList.status !== PickingListStatus.CREATED) {
      throw new InvalidPickingListStatusError(
        pickingListId,
        pickingList.status,
        PickingListStatus.CREATED,
      );
    }

    const itemIds = new Map(
      pickingList.items.map((item) => [item.productId, item.id]),
    );

    const items = pickingList.items.map((item) => ({
      productId: item.productId,
      requestedQuantity: item.requestedQuantity,
    }));

    const route = await this.fefoService.generatePickRoute(itemIds, items);

    await this.pickingListRepository.updateStatus(
      pickingListId,
      PickingListStatus.IN_PROGRESS,
    );

    return route;
  }
}
