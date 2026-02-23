import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import type { LotEntity, PaletteLotEntity } from "@domain/entities";
import { PaletteEntity } from "@domain/entities";
import {
  PalettierNotFoundError,
  PositionOccupiedError,
  PositionOutOfBoundsError,
  ProductNotFoundError,
} from "@domain/errors";
import {
  LotRepository,
  PaletteRepository,
  PaletteLotRepository,
  PalettierRepository,
  ProductRepository,
} from "@domain/repositories";
import type { ProductWithRules } from "@domain/repositories";
import { MutationUseCase } from "@domain/types";

export interface RegisterConflictResolutionItemInput {
  productId: number;
  lotReference: string | null;
  expiryDate: string | null;
  quantity: number;
}

export interface RegisterConflictResolutionGroupInput {
  palettierId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  items: RegisterConflictResolutionItemInput[];
}

export interface RegisterConflictResolutionInput {
  groups: RegisterConflictResolutionGroupInput[];
}

export interface RegisterConflictResolutionOutputItem {
  lot: LotEntity;
  paletteLot: PaletteLotEntity;
  productName: string;
}

export interface RegisterConflictResolutionOutputPalette {
  palette: PaletteEntity;
  palettierName: string;
  items: RegisterConflictResolutionOutputItem[];
}

export interface RegisterConflictResolutionOutput {
  palettes: RegisterConflictResolutionOutputPalette[];
}

@Injectable()
export class RegisterConflictResolutionUseCase
  implements
    MutationUseCase<
      RegisterConflictResolutionInput,
      RegisterConflictResolutionOutput
    >
{
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly palettierRepository: PalettierRepository,
    private readonly paletteRepository: PaletteRepository,
    private readonly lotRepository: LotRepository,
    private readonly paletteLotRepository: PaletteLotRepository,
    private readonly dataSource: DataSource
  ) {}

  async execute(
    input: RegisterConflictResolutionInput
  ): Promise<RegisterConflictResolutionOutput> {
    // --- Validation phase: verify ALL references before creating anything ---

    // Validate no two groups target the same position
    const positionKeys = new Set<string>();
    for (const group of input.groups) {
      const key = `${String(group.palettierId)}:${String(group.positionX)},${String(group.positionY)},${String(group.positionZ)}`;
      if (positionKeys.has(key)) {
        throw new PositionOccupiedError(
          group.palettierId,
          group.positionX,
          group.positionY,
          group.positionZ
        );
      }
      positionKeys.add(key);
    }

    // Batch-load all palettiers
    const uniquePalettierIds = [
      ...new Set(input.groups.map((g) => g.palettierId)),
    ];
    const palettiers =
      await this.palettierRepository.findByIds(uniquePalettierIds);
    const palettierMap = new Map(palettiers.map((p) => [p.id, p]));

    // Validate each palettier exists and positions are within bounds
    for (const group of input.groups) {
      const palettier = palettierMap.get(group.palettierId);
      if (!palettier) {
        throw new PalettierNotFoundError(group.palettierId);
      }

      if (
        group.positionX >= palettier.width ||
        group.positionY >= palettier.depth ||
        group.positionZ >= palettier.height ||
        group.positionX < 0 ||
        group.positionY < 0 ||
        group.positionZ < 0
      ) {
        throw new PositionOutOfBoundsError(
          group.palettierId,
          group.positionX,
          group.positionY,
          group.positionZ,
          palettier.width,
          palettier.depth,
          palettier.height
        );
      }
    }

    // H1 fix: Batch-load occupied positions for all palettiers instead of N+1 queries
    const occupiedPositionsMap =
      await this.paletteRepository.findOccupiedPositionsByPalettierIds(
        uniquePalettierIds
      );
    for (const group of input.groups) {
      const occupied = occupiedPositionsMap.get(group.palettierId) ?? [];
      const isOccupied = occupied.some(
        (p) =>
          p.positionX === group.positionX &&
          p.positionY === group.positionY &&
          p.positionZ === group.positionZ
      );
      if (isOccupied) {
        throw new PositionOccupiedError(
          group.palettierId,
          group.positionX,
          group.positionY,
          group.positionZ
        );
      }
    }

    // Batch-load all products
    const allProductIds = input.groups.flatMap((g) =>
      g.items.map((item) => item.productId)
    );
    const uniqueProductIds = [...new Set(allProductIds)];
    const productsWithRules =
      await this.productRepository.findByIds(uniqueProductIds);
    const productMap = new Map<number, ProductWithRules>();
    for (const pwr of productsWithRules) {
      productMap.set(pwr.product.id, pwr);
    }

    for (const productId of uniqueProductIds) {
      if (!productMap.has(productId)) {
        throw new ProductNotFoundError(productId);
      }
    }

    // M1 fix: Batch-generate lot references using Promise.all instead of sequential awaits
    const lotReferences: string[][] = await Promise.all(
      input.groups.map((group) =>
        Promise.all(
          group.items.map((item) =>
            item.lotReference != null
              ? Promise.resolve(item.lotReference)
              : this.lotRepository.generateReference(item.productId)
          )
        )
      )
    );

    // --- Creation phase: all validations passed ---
    // H3 fix: Wrap creation in a database transaction for atomicity
    // H4 note: Full TOCTOU protection requires a UNIQUE constraint on
    // (palettier_id, position_x, position_y, position_z) in a migration.
    // The transaction provides atomicity but not serialized position checking.
    return this.dataSource.transaction(async (transactionManager) => {
      const palettes: RegisterConflictResolutionOutputPalette[] = [];

      for (let gi = 0; gi < input.groups.length; gi++) {
        const group = input.groups[gi];
        const palettier = palettierMap.get(group.palettierId);

        const palette = await this.paletteRepository.create(
          {
            palettierId: group.palettierId,
            positionX: group.positionX,
            positionY: group.positionY,
            positionZ: group.positionZ,
          },
          transactionManager
        );

        const outputItems: RegisterConflictResolutionOutputItem[] = [];

        for (let ii = 0; ii < group.items.length; ii++) {
          const item = group.items[ii];
          const productWithRules = productMap.get(item.productId);
          const lotReference = lotReferences[gi][ii];

          const lot = await this.lotRepository.create(
            {
              productId: item.productId,
              reference: lotReference,
              supplierName: "",
              totalQuantity: item.quantity,
              arrivalDate: new Date(),
              expirationDate: item.expiryDate
                ? new Date(item.expiryDate)
                : null,
            },
            transactionManager
          );

          const paletteLot = await this.paletteLotRepository.create(
            {
              paletteId: palette.id,
              lotId: lot.id,
              quantity: item.quantity,
            },
            transactionManager
          );

          outputItems.push({
            lot,
            paletteLot,
            productName: productWithRules?.product.name ?? "",
          });
        }

        palettes.push({
          palette,
          palettierName: palettier?.name ?? "",
          items: outputItems,
        });
      }

      return { palettes };
    });
  }
}
