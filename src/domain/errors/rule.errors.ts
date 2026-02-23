import { ErrorCode, HttpResponseStatus } from "@domain/types";
import { BaseError } from "./base.error";

export class RuleNotFoundError extends BaseError {
  constructor(ruleId: number) {
    super(`Rule with ID ${String(ruleId)} not found`, {
      httpStatus: HttpResponseStatus.NOT_FOUND,
      code: ErrorCode.RESOURCE_NOT_FOUND,
      details: { ruleId },
    });
  }
}

export class RuleTypeMismatchError extends BaseError {
  constructor(ruleId: number, expectedType: string, actualType: string) {
    super(
      `Rule with ID ${String(ruleId)} has type "${actualType}" but expected "${expectedType}"`,
      {
        httpStatus: HttpResponseStatus.BAD_REQUEST,
        code: ErrorCode.DTO_VALIDATION_FAILED,
        details: { ruleId, expectedType, actualType },
      }
    );
  }
}

export class InvalidPalettierIdsError extends BaseError {
  constructor(invalidIds: number[]) {
    super(
      `The following palettier IDs do not exist: ${invalidIds.join(", ")}`,
      {
        httpStatus: HttpResponseStatus.BAD_REQUEST,
        code: ErrorCode.DTO_VALIDATION_FAILED,
        details: { invalidPalettierIds: invalidIds },
      }
    );
  }
}

export class InvalidProductIdsError extends BaseError {
  constructor(invalidIds: number[]) {
    super(`The following product IDs do not exist: ${invalidIds.join(", ")}`, {
      httpStatus: HttpResponseStatus.BAD_REQUEST,
      code: ErrorCode.DTO_VALIDATION_FAILED,
      details: { invalidProductIds: invalidIds },
    });
  }
}

export class InvalidPalettierTypeIdError extends BaseError {
  constructor(palettierTypeId: number) {
    super(`Palettier type with ID ${String(palettierTypeId)} does not exist`, {
      httpStatus: HttpResponseStatus.BAD_REQUEST,
      code: ErrorCode.DTO_VALIDATION_FAILED,
      details: { palettierTypeId },
    });
  }
}

export class BatchSizeLimitError extends BaseError {
  constructor(providedSize: number, maxSize: number) {
    super(
      `Batch size ${String(providedSize)} exceeds the maximum allowed size of ${String(maxSize)}`,
      {
        httpStatus: HttpResponseStatus.BAD_REQUEST,
        code: ErrorCode.DTO_VALIDATION_FAILED,
        details: { providedSize, maxSize },
      }
    );
  }
}
