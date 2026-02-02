
import { ErrorCode, HttpResponseStatus } from '@domain/types';


export interface BaseErrorOptions {
  httpStatus: HttpResponseStatus;
  code?: ErrorCode;
  details?: Record<string, any>;
}

export abstract class BaseError extends Error {
  public readonly message: string;
  public readonly httpStatus: HttpResponseStatus;
  public readonly code: ErrorCode;
  public readonly details: Record<string, any>;

  constructor(message: string, options: BaseErrorOptions) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.httpStatus = options.httpStatus;
    this.code = options.code ?? ErrorCode.INTERNAL_SERVER_ERROR;
    this.details = options.details ?? {};
  }
}