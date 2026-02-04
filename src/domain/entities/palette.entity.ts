import { IPalette } from "@domain/types";

export class PaletteEntity implements IPalette {
  public readonly id: number;
  public readonly palettierId: number;
  public readonly positionX: number;
  public readonly positionY: number;
  public readonly positionZ: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt: Date | null;

  constructor(params: IPalette) {
    this.id = params.id;
    this.palettierId = params.palettierId;
    this.positionX = params.positionX;
    this.positionY = params.positionY;
    this.positionZ = params.positionZ;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.deletedAt = params.deletedAt;
  }

  get position(): { x: number; y: number; z: number } {
    return {
      x: this.positionX,
      y: this.positionY,
      z: this.positionZ,
    };
  }
}
