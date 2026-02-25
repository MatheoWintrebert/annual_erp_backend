import { Injectable } from "@nestjs/common";
import { PaletteRepository, PickingListRepository } from "@domain/repositories";
import { CreatePickingListInput, MutationUseCase } from "@domain/types";
import { PickingListEntity } from "@domain/entities";
import {
  DuplicateProductInListError,
  EmptyPickingListError,
  InsufficientStockError,
  InsufficientStockDetail,
} from "@domain/errors";

@Injectable()
export class CreatePickingListUseCase implements MutationUseCase<
  CreatePickingListInput,
  PickingListEntity
> {
  constructor(
    private readonly pickingListRepository: PickingListRepository,
    private readonly paletteRepository: PaletteRepository
  ) {}

  async execute(input: CreatePickingListInput): Promise<PickingListEntity> {
    // 1. Items array must not be empty
    if (input.items.length === 0) {
      throw new EmptyPickingListError();
    }

    // 2. No duplicate productIds
    const productIds = input.items.map((item) => item.productId);
    const uniqueIds = new Set(productIds);
    if (uniqueIds.size !== productIds.length) {
      const seen = new Set<number>();
      const duplicates: number[] = [];
      for (const id of productIds) {
        if (seen.has(id)) {
          if (!duplicates.includes(id)) {
            duplicates.push(id);
          }
        }
        seen.add(id);
      }
      throw new DuplicateProductInListError(duplicates);
    }

    // 3. Check available stock for all products
    const stockList =
      await this.paletteRepository.getAvailableStockByProductIds(productIds);

    const stockMap = new Map(stockList.map((s) => [s.productId, s]));

    const insufficientItems: InsufficientStockDetail[] = [];
    for (const item of input.items) {
      const stock = stockMap.get(item.productId);
      const available = stock?.availableQuantity ?? 0;
      if (item.requestedQuantity > available) {
        insufficientItems.push({
          productId: item.productId,
          productName:
            stock?.productName ?? `Product ${String(item.productId)}`,
          requestedQuantity: item.requestedQuantity,
          availableQuantity: available,
        });
      }
    }

    if (insufficientItems.length > 0) {
      throw new InsufficientStockError(insufficientItems);
    }

    // 4. Create picking list
    return this.pickingListRepository.create(input);
  }
}
