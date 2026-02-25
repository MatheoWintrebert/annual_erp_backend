import type { EntityManager } from "typeorm";
import { PaletteEntity } from "@domain/entities";
import {
  PaletteLotFefoData,
  PaletteWithDetails,
  ProductStock,
} from "@domain/types";

export interface CreatePaletteData {
  palettierId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
}

export abstract class PaletteRepository {
  abstract create(
    data: CreatePaletteData,
    transactionManager?: EntityManager
  ): Promise<PaletteEntity>;

  abstract findByPalettierIdAndPosition(
    palettierId: number,
    x: number,
    y: number,
    z: number
  ): Promise<PaletteEntity | null>;

  abstract findOccupiedPositionsByPalettierId(
    palettierId: number
  ): Promise<{ positionX: number; positionY: number; positionZ: number }[]>;

  abstract findOccupiedPositionsByPalettierIds(
    palettierIds: number[]
  ): Promise<
    Map<number, { positionX: number; positionY: number; positionZ: number }[]>
  >;

  abstract findCategoryIdsByPalettierId(palettierId: number): Promise<number[]>;

  abstract findCategoryIdsByPalettierIds(
    palettierIds: number[]
  ): Promise<Map<number, number[]>>;

  abstract findById(id: number): Promise<PaletteEntity | null>;

  abstract updatePosition(
    id: number,
    palettierId: number,
    positionX: number,
    positionY: number,
    positionZ: number
  ): Promise<void>;

  abstract findAllWithDetails(filters?: {
    palettierId?: number;
    productSearch?: string;
  }): Promise<PaletteWithDetails[]>;

  abstract getAvailableStockByProductIds(
    productIds: number[]
  ): Promise<ProductStock[]>;

  abstract getPaletteLotsByProductIdsForFefo(
    productIds: number[]
  ): Promise<PaletteLotFefoData[]>;

  abstract deductPaletteLotQuantity(
    paletteLotId: number,
    quantity: number,
    transactionManager?: EntityManager
  ): Promise<void>;

  abstract getStockWithExpiryByProductIds(
    productIds: number[]
  ): Promise<
    {
      productId: number;
      lotId: number;
      quantity: number;
      expiryDate: Date | null;
    }[]
  >;

  abstract getStockQuantityByProductIds(
    productIds: number[]
  ): Promise<{ productId: number; totalQuantity: number }[]>;

  abstract countActivePalettes(): Promise<number>;

  abstract countPalettesCreatedBetween(
    startDate: Date,
    endDate: Date
  ): Promise<number>;
}
