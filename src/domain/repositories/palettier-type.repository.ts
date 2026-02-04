import { PalettierTypeEntity } from "@domain/entities";
import { EntityManager } from "typeorm";

export interface CreatePalettierTypeData {
  name: string;
  description?: string | null;
}

export interface UpdatePalettierTypeData {
  name?: string;
  description?: string | null;
}

export abstract class PalettierTypeRepository {
  abstract findById(id: number): Promise<PalettierTypeEntity | null>;

  abstract findByName(name: string): Promise<PalettierTypeEntity | null>;

  abstract findAll(): Promise<PalettierTypeEntity[]>;

  abstract create(
    data: CreatePalettierTypeData,
    transactionManager?: EntityManager
  ): Promise<PalettierTypeEntity>;

  abstract update(
    id: number,
    data: UpdatePalettierTypeData
  ): Promise<PalettierTypeEntity>;
}
