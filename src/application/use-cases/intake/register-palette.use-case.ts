import { Injectable } from "@nestjs/common";
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

export interface RegisterPaletteItemInput {
  productId: number;
  lotReference: string | null;
  expiryDate: string | null;
  quantity: number;
}

export interface RegisterPaletteInput {
  palettierId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  items: RegisterPaletteItemInput[];
}

export interface RegisterPaletteOutputItem {
  lot: LotEntity;
  paletteLot: PaletteLotEntity;
  productName: string;
}

export interface RegisterPaletteOutput {
  palette: PaletteEntity;
  palettierName: string;
  items: RegisterPaletteOutputItem[];
}

@Injectable()
export class RegisterPaletteUseCase implements MutationUseCase<
  RegisterPaletteInput,
  RegisterPaletteOutput
> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly palettierRepository: PalettierRepository,
    private readonly paletteRepository: PaletteRepository,
    private readonly lotRepository: LotRepository,
    private readonly paletteLotRepository: PaletteLotRepository
  ) {}

  async execute(input: RegisterPaletteInput): Promise<RegisterPaletteOutput> {
    // --- Validation phase: verify all references exist before creating anything ---
    const palettier = await this.palettierRepository.findById(
      input.palettierId
    );
    if (!palettier) {
      throw new PalettierNotFoundError(input.palettierId);
    }

    if (
      input.positionX >= palettier.width ||
      input.positionY >= palettier.depth ||
      input.positionZ >= palettier.height ||
      input.positionX < 0 ||
      input.positionY < 0 ||
      input.positionZ < 0
    ) {
      throw new PositionOutOfBoundsError(
        input.palettierId,
        input.positionX,
        input.positionY,
        input.positionZ,
        palettier.width,
        palettier.depth,
        palettier.height
      );
    }

    const existingPalette =
      await this.paletteRepository.findByPalettierIdAndPosition(
        input.palettierId,
        input.positionX,
        input.positionY,
        input.positionZ
      );
    if (existingPalette) {
      throw new PositionOccupiedError(
        input.palettierId,
        input.positionX,
        input.positionY,
        input.positionZ
      );
    }

    // Batch-load all products to avoid N+1 queries
    const uniqueProductIds = [
      ...new Set(input.items.map((item) => item.productId)),
    ];
    const productsWithRules =
      await this.productRepository.findByIds(uniqueProductIds);

    const productMap = new Map<number, ProductWithRules>();
    for (const pwr of productsWithRules) {
      productMap.set(pwr.product.id, pwr);
    }

    // Validate all products exist
    for (const productId of uniqueProductIds) {
      if (!productMap.has(productId)) {
        throw new ProductNotFoundError(productId);
      }
    }

    // Pre-generate lot references before creation to minimise partial-write risk.
    // NOTE: This codebase does not yet have a cross-repository transaction abstraction.
    // The validate-first + pre-generate pattern reduces the failure window to DB write
    // errors only. A proper UnitOfWork / transactional wrapper should be added when the
    // architecture supports it.
    const lotReferences = new Map<number, string>();
    for (let i = 0; i < input.items.length; i++) {
      const item = input.items[i];
      const ref =
        item.lotReference ??
        (await this.lotRepository.generateReference(item.productId));
      lotReferences.set(i, ref);
    }

    // --- Creation phase: all validations passed, all references generated ---
    const palette = await this.paletteRepository.create({
      palettierId: input.palettierId,
      positionX: input.positionX,
      positionY: input.positionY,
      positionZ: input.positionZ,
    });

    const outputItems: RegisterPaletteOutputItem[] = [];

    for (let i = 0; i < input.items.length; i++) {
      const item = input.items[i];
      // Both maps are guaranteed populated by the validation + pre-generation above
      const productWithRules = productMap.get(item.productId);
      if (!productWithRules) {
        throw new ProductNotFoundError(item.productId);
      }
      const lotReference = lotReferences.get(i);
      if (lotReference === undefined) {
        throw new Error(`Lot reference for index ${String(i)} not found`);
      }

      const lot = await this.lotRepository.create({
        productId: item.productId,
        reference: lotReference,
        supplierName: "",
        totalQuantity: item.quantity,
        arrivalDate: new Date(),
        expirationDate: item.expiryDate ? new Date(item.expiryDate) : null,
      });

      const paletteLot = await this.paletteLotRepository.create({
        paletteId: palette.id,
        lotId: lot.id,
        quantity: item.quantity,
      });

      outputItems.push({
        lot,
        paletteLot,
        productName: productWithRules.product.name,
      });
    }

    return {
      palette,
      palettierName: palettier.name,
      items: outputItems,
    };
  }
}
