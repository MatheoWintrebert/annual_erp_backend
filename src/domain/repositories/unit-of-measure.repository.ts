import { UnitOfMeasureEntity } from "@domain/entities";

export interface FindUnitsOfMeasureOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export interface FindUnitsOfMeasureResult {
  unitsOfMeasure: UnitOfMeasureEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUnitOfMeasureData {
  name: string;
  abbreviation: string;
}

export interface UpdateUnitOfMeasureData {
  name?: string;
  abbreviation?: string;
}

export abstract class UnitOfMeasureRepository {
  abstract findById(id: number): Promise<UnitOfMeasureEntity | null>;

  abstract findAll(
    options?: FindUnitsOfMeasureOptions
  ): Promise<FindUnitsOfMeasureResult>;

  abstract findByName(name: string): Promise<UnitOfMeasureEntity | null>;

  abstract findByAbbreviation(
    abbreviation: string
  ): Promise<UnitOfMeasureEntity | null>;

  abstract create(data: CreateUnitOfMeasureData): Promise<UnitOfMeasureEntity>;

  abstract update(
    id: number,
    data: UpdateUnitOfMeasureData
  ): Promise<UnitOfMeasureEntity>;

  abstract delete(id: number): Promise<void>;
}
