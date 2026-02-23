import { ErrorCode, HttpResponseStatus } from "@domain/types";
import { BaseError } from "./base.error";

export class CategoryNotFoundError extends BaseError {
  constructor(categoryId: number) {
    super(`Category with ID ${String(categoryId)} not found`, {
      httpStatus: HttpResponseStatus.NOT_FOUND,
      code: ErrorCode.RESOURCE_NOT_FOUND,
      details: { categoryId },
    });
  }
}

export class DuplicateCategoryNameError extends BaseError {
  constructor(name: string) {
    super(`A category with name "${name}" already exists`, {
      httpStatus: HttpResponseStatus.CONFLICT,
      code: ErrorCode.DTO_VALIDATION_FAILED,
      details: { name },
    });
  }
}
