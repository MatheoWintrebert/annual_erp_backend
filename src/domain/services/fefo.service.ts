import { Injectable } from "@nestjs/common";
import { PaletteRepository } from "@domain/repositories";
import {
  PaletteLotFefoData,
  PickRouteInput,
  PickRouteItem,
} from "@domain/types";

@Injectable()
export class FefoService {
  constructor(private readonly paletteRepository: PaletteRepository) {}

  async generatePickRoute(
    pickingListItemIds: Map<number, number>,
    items: PickRouteInput[]
  ): Promise<PickRouteItem[]> {
    if (items.length === 0) {
      return [];
    }

    const productIds = items.map((item) => item.productId);
    const paletteLots =
      await this.paletteRepository.getPaletteLotsByProductIdsForFefo(
        productIds
      );

    // Group palette lots by product ID
    const lotsByProduct = new Map<number, PaletteLotFefoData[]>();
    for (const lot of paletteLots) {
      const existing = lotsByProduct.get(lot.productId) ?? [];
      existing.push(lot);
      lotsByProduct.set(lot.productId, existing);
    }

    const route: PickRouteItem[] = [];

    for (const item of items) {
      const pickingListItemId = pickingListItemIds.get(item.productId) ?? 0;
      const availableLots = lotsByProduct.get(item.productId) ?? [];
      let remaining = item.requestedQuantity;

      for (const lot of availableLots) {
        if (remaining <= 0) break;

        const quantityToPick = Math.min(remaining, lot.quantity);
        route.push({
          pickingListItemId,
          productId: lot.productId,
          productName: lot.productName,
          productReference: lot.productReference,
          palettierName: lot.palettierName,
          paletteId: lot.paletteId,
          paletteLotId: lot.paletteLotId,
          positionX: lot.positionX,
          positionY: lot.positionY,
          positionZ: lot.positionZ,
          quantityToPick,
          expiryDate: lot.expiryDate,
          lotReference: lot.lotReference,
        });

        remaining -= quantityToPick;
      }
    }

    return route;
  }
}
