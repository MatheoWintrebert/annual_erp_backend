import { Injectable } from "@nestjs/common";
import { PaletteRepository, PickingListRepository } from "@domain/repositories";
import {
  InvalidPickingListStatusError,
  PickingListAlreadyCancelledError,
  PickingListAlreadyCompletedError,
  PickingListNotFoundError,
} from "@domain/errors";
import {
  CompletePickingListInput,
  MutationUseCase,
  PickingCompletionResult,
  PickingDiscrepancy,
  PickingListItemStatus,
  PickingListStatus,
  StockDeduction,
} from "@domain/types";

@Injectable()
export class CompletePickingListUseCase implements MutationUseCase<
  CompletePickingListInput,
  PickingCompletionResult
> {
  constructor(
    private readonly pickingListRepository: PickingListRepository,
    private readonly paletteRepository: PaletteRepository
  ) {}

  async execute(
    input: CompletePickingListInput
  ): Promise<PickingCompletionResult> {
    const pickingList = await this.pickingListRepository.findById(
      input.pickingListId
    );

    if (!pickingList) {
      throw new PickingListNotFoundError(input.pickingListId);
    }

    if (pickingList.status === PickingListStatus.COMPLETED) {
      throw new PickingListAlreadyCompletedError(input.pickingListId);
    }

    if (pickingList.status === PickingListStatus.CANCELLED) {
      throw new PickingListAlreadyCancelledError(input.pickingListId);
    }

    if (pickingList.status !== PickingListStatus.IN_PROGRESS) {
      throw new InvalidPickingListStatusError(
        input.pickingListId,
        pickingList.status,
        PickingListStatus.IN_PROGRESS
      );
    }

    const pickedItems = input.items.filter((item) => item.status === "picked");
    const skippedItems = input.items.filter(
      (item) => item.status === "skipped"
    );

    // Load palette lot details for response building
    const productIds = [
      ...new Set(pickingList.items.map((item) => item.productId)),
    ];
    const paletteLots =
      await this.paletteRepository.getPaletteLotsByProductIdsForFefo(
        productIds
      );
    const paletteLotMap = new Map(
      paletteLots.map((lot) => [lot.paletteLotId, lot])
    );

    // Deduct stock for picked items — atomic batch to avoid partial failures
    const stockDeductions = pickedItems
      .filter((item) => item.pickedQuantity > 0)
      .map((item) => ({
        paletteLotId: item.paletteLotId,
        quantity: item.pickedQuantity,
      }));

    if (stockDeductions.length > 0) {
      await this.paletteRepository.deductMultiplePaletteLotQuantities(
        stockDeductions
      );
    }

    const deductions: StockDeduction[] = pickedItems.map((item) => {
      const lotData = paletteLotMap.get(item.paletteLotId);
      return {
        paletteLotId: item.paletteLotId,
        productName: lotData?.productName ?? "Unknown",
        quantityDeducted: item.pickedQuantity,
        palettierName: lotData?.palettierName ?? "Unknown",
        positionX: lotData?.positionX ?? 0,
        positionY: lotData?.positionY ?? 0,
        positionZ: lotData?.positionZ ?? 0,
      };
    });

    // Build discrepancies for skipped items
    const discrepancies: PickingDiscrepancy[] = skippedItems.map((item) => {
      const lotData = paletteLotMap.get(item.paletteLotId);
      return {
        pickingListItemId: item.pickingListItemId,
        productName: lotData?.productName ?? "Unknown",
        palettierName: lotData?.palettierName ?? "Unknown",
        positionX: lotData?.positionX ?? 0,
        positionY: lotData?.positionY ?? 0,
        positionZ: lotData?.positionZ ?? 0,
        reason: "Item skipped — not found at location",
      };
    });

    // Update picking list items with status and picked quantity
    await this.pickingListRepository.updateItems(
      input.pickingListId,
      input.items.map((item) => ({
        id: item.pickingListItemId,
        status:
          item.status === "picked"
            ? PickingListItemStatus.PICKED
            : PickingListItemStatus.SKIPPED,
        pickedQuantity: item.pickedQuantity,
      }))
    );

    // Update picking list status to COMPLETED
    await this.pickingListRepository.updateStatus(
      input.pickingListId,
      PickingListStatus.COMPLETED
    );

    return {
      pickingListId: input.pickingListId,
      status: PickingListStatus.COMPLETED,
      totalItemsPicked: pickedItems.length,
      totalItemsSkipped: skippedItems.length,
      deductions,
      discrepancies,
    };
  }
}
