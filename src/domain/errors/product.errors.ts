import { ErrorCode, HttpResponseStatus } from "@domain/types";
import { BaseError } from "./base.error";

export class ProductNotFoundError extends BaseError {
  constructor(productId: number) {
    super(`Product with ID ${String(productId)} not found`, {
      httpStatus: HttpResponseStatus.NOT_FOUND,
      code: ErrorCode.RESOURCE_NOT_FOUND,
      details: { productId },
    });
  }
}

export class DuplicateProductReferenceError extends BaseError {
  constructor(reference: string) {
    super(`A product with reference "${reference}" already exists`, {
      httpStatus: HttpResponseStatus.CONFLICT,
      code: ErrorCode.DUPLICATE_PRODUCT_REFERENCE,
      details: { reference },
    });
  }
}

export class InvalidUnitOfMeasureIdError extends BaseError {
  constructor(unitOfMeasureId: number) {
    super(`Unit of measure with ID ${String(unitOfMeasureId)} does not exist`, {
      httpStatus: HttpResponseStatus.BAD_REQUEST,
      code: ErrorCode.DTO_VALIDATION_FAILED,
      details: { unitOfMeasureId },
    });
  }
}

export class InvalidCategoryIdError extends BaseError {
  constructor(categoryId: number) {
    super(`Category with ID ${String(categoryId)} does not exist`, {
      httpStatus: HttpResponseStatus.BAD_REQUEST,
      code: ErrorCode.DTO_VALIDATION_FAILED,
      details: { categoryId },
    });
  }
}

export class InvalidRuleIdsError extends BaseError {
  constructor(invalidIds: number[]) {
    super(`The following rule IDs do not exist: ${invalidIds.join(", ")}`, {
      httpStatus: HttpResponseStatus.BAD_REQUEST,
      code: ErrorCode.DTO_VALIDATION_FAILED,
      details: { invalidRuleIds: invalidIds },
    });
  }
}

export class ProductHasActivePalettesError extends BaseError {
  constructor(productId: number, paletteCount: number) {
    super(
      `Cannot delete product with ID ${String(productId)}: it is on ${String(paletteCount)} active palette${paletteCount !== 1 ? "s" : ""}`,
      {
        httpStatus: HttpResponseStatus.CONFLICT,
        code: ErrorCode.PRODUCT_HAS_ACTIVE_PALETTES,
        details: { productId, activePaletteCount: paletteCount },
      }
    );
  }
}
