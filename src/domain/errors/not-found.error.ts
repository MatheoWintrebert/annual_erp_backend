import { BaseError, BaseErrorOptions } from '@domain/errors/base.error';
import { HttpResponseStatus } from '@domain/types';

export type NotFoundErrorOption = Pick<BaseErrorOptions, 'code' | 'details'>;

export class NotFoundError extends BaseError {
  constructor(message: string, options?: NotFoundErrorOption) {
    super(message, {
      httpStatus: HttpResponseStatus.NOT_FOUND,
      code: options?.code,
      details: options?.details,
    });
  }
}
