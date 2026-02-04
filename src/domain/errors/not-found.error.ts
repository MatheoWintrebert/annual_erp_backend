import { ErrorCode, HttpResponseStatus } from "@domain/types";
import { BaseError } from "./base.error";

export class NotFoundError extends BaseError {
  constructor(resource: string) {
    super(`${resource} not found`, {
      httpStatus: HttpResponseStatus.NOT_FOUND,
      code: ErrorCode.RESOURCE_NOT_FOUND,
      details: { resource },
    });
  }
}
