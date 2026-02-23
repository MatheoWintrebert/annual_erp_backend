import { BaseError } from "./base.error";
import { ErrorCode, HttpResponseStatus } from "@domain/types";

export class NoValidPlacementError extends BaseError {
  constructor(productId: number) {
    super(`No valid placement found for product with ID ${String(productId)}`, {
      httpStatus: HttpResponseStatus.UNPROCESSABLE_ENTITY,
      code: ErrorCode.NO_VALID_PLACEMENT,
      details: { productId },
    });
  }
}

export class PositionOccupiedError extends BaseError {
  constructor(
    palettierId: number,
    positionX: number,
    positionY: number,
    positionZ: number
  ) {
    super(
      `Position (${String(positionX)}, ${String(positionY)}, ${String(positionZ)}) in palettier ${String(palettierId)} is already occupied`,
      {
        httpStatus: HttpResponseStatus.CONFLICT,
        code: ErrorCode.POSITION_OCCUPIED,
        details: { palettierId, positionX, positionY, positionZ },
      }
    );
  }
}

export class PositionOutOfBoundsError extends BaseError {
  constructor(
    palettierId: number,
    positionX: number,
    positionY: number,
    positionZ: number,
    width: number,
    depth: number,
    height: number
  ) {
    super(
      `Position (${String(positionX)}, ${String(positionY)}, ${String(positionZ)}) exceeds palettier ${String(palettierId)} dimensions (${String(width)}×${String(depth)}×${String(height)})`,
      {
        httpStatus: HttpResponseStatus.UNPROCESSABLE_ENTITY,
        code: ErrorCode.POSITION_OUT_OF_BOUNDS,
        details: {
          palettierId,
          positionX,
          positionY,
          positionZ,
          width,
          depth,
          height,
        },
      }
    );
  }
}

export class PalettierNotFoundError extends BaseError {
  constructor(palettierId: number) {
    super(`Palettier with ID ${String(palettierId)} not found`, {
      httpStatus: HttpResponseStatus.NOT_FOUND,
      code: ErrorCode.PALETTIER_NOT_FOUND,
      details: { palettierId },
    });
  }
}

export class PaletteNotFoundError extends BaseError {
  constructor(paletteId: number) {
    super(`Palette with ID ${String(paletteId)} not found`, {
      httpStatus: HttpResponseStatus.NOT_FOUND,
      code: ErrorCode.PALETTE_NOT_FOUND,
      details: { paletteId },
    });
  }
}
