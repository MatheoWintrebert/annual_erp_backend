import type { EntityManager } from "typeorm";
import { PaletteLotEntity } from "@domain/entities";

export interface CreatePaletteLotData {
  paletteId: number;
  lotId: number;
  quantity: number;
}

export abstract class PaletteLotRepository {
  abstract create(
    data: CreatePaletteLotData,
    transactionManager?: EntityManager
  ): Promise<PaletteLotEntity>;
}
