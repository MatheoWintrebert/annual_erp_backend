import { IUnitOfMeasure } from "@domain/types";

export class UnitOfMeasureEntity implements IUnitOfMeasure {
  public readonly id: number;
  public readonly name: string;
  public readonly abbreviation: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: IUnitOfMeasure) {
    this.id = params.id;
    this.name = params.name;
    this.abbreviation = params.abbreviation;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}
