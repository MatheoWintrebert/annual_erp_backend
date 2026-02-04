import { PalettierEntity } from "@domain/entities";
import { EntityManager } from "typeorm";

export interface CreatePalettierData {
  name: string;
  palettierTypeId: number | null;
  width: number;
  depth: number;
  height: number;
}

export interface UpdatePalettierData {
  name?: string;
  palettierTypeId?: number | null;
  width?: number;
  depth?: number;
  height?: number;
}

export abstract class PalettierRepository {
  abstract findById(id: number): Promise<PalettierEntity | null>;

  abstract findAll(): Promise<PalettierEntity[]>;

  abstract create(
    data: CreatePalettierData,
    transactionManager?: EntityManager
  ): Promise<PalettierEntity>;

  abstract createMany(
    data: CreatePalettierData[],
    transactionManager?: EntityManager
  ): Promise<PalettierEntity[]>;

  abstract update(
    id: number,
    data: UpdatePalettierData
  ): Promise<PalettierEntity>;
}
