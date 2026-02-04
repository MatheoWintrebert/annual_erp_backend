import { IPalettier } from "@domain/types";

export class PalettierEntity implements IPalettier {
  public readonly id: number;
  public readonly palettierTypeId: number | null;
  public readonly name: string;
  public readonly width: number;
  public readonly depth: number;
  public readonly height: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt: Date | null;

  constructor(params: IPalettier) {
    this.id = params.id;
    this.palettierTypeId = params.palettierTypeId;
    this.name = params.name;
    this.width = params.width;
    this.depth = params.depth;
    this.height = params.height;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.deletedAt = params.deletedAt;
  }

  get totalCapacity(): number {
    return this.width * this.depth * this.height;
  }
}
