import { IPalettierType } from "@domain/types";

export class PalettierTypeEntity implements IPalettierType {
  public readonly id: number;
  public readonly name: string;
  public readonly description: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: IPalettierType) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}
