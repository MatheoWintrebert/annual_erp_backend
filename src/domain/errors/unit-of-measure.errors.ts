import { ErrorCode, HttpResponseStatus } from "@domain/types";
import { BaseError } from "./base.error";

export class UnitOfMeasureNotFoundError extends BaseError {
  constructor(unitOfMeasureId: number) {
    super(`Unit of measure with ID ${String(unitOfMeasureId)} not found`, {
      httpStatus: HttpResponseStatus.NOT_FOUND,
      code: ErrorCode.RESOURCE_NOT_FOUND,
      details: { unitOfMeasureId },
    });
  }
}

export class DuplicateUnitOfMeasureNameError extends BaseError {
  constructor(name: string) {
    super(`A unit of measure with name "${name}" already exists`, {
      httpStatus: HttpResponseStatus.CONFLICT,
      code: ErrorCode.DTO_VALIDATION_FAILED,
      details: { name },
    });
  }
}

export class DuplicateUnitOfMeasureAbbreviationError extends BaseError {
  constructor(abbreviation: string) {
    super(
      `A unit of measure with abbreviation "${abbreviation}" already exists`,
      {
        httpStatus: HttpResponseStatus.CONFLICT,
        code: ErrorCode.DTO_VALIDATION_FAILED,
        details: { abbreviation },
      }
    );
  }
}
