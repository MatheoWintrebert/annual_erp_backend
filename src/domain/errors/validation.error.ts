import { HttpResponseStatus } from "@domain/types/http";
import { BaseError, BaseErrorOptions } from "./base.error";

export type ValidationErrorOption = Pick<BaseErrorOptions, "code" | "details">;

export class ValidationError extends BaseError {
  constructor(message: string, options?: ValidationErrorOption) {
    super(message, {
      httpStatus: HttpResponseStatus.BAD_REQUEST,
      code: options?.code,
      details: options?.details,
    });
  }
}
