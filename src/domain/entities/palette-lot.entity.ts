import { IPaletteLot } from "@domain/types";

export class PaletteLotEntity implements IPaletteLot {
  public readonly id: number;
  public readonly paletteId: number;
  public readonly lotId: number;
  public readonly quantity: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: IPaletteLot) {
    this.id = params.id;
    this.paletteId = params.paletteId;
    this.lotId = params.lotId;
    this.quantity = params.quantity;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}
