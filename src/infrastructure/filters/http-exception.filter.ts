import { Response } from 'express';
import { ExceptionFilter, Catch, ArgumentsHost, Logger, HttpException } from '@nestjs/common';
import { Environment, ErrorCode, HttpResponseStatus } from '@domain/types';
import { BaseError } from '@domain/errors';
import { HttpErrorDto } from '@infrastructure/dto';

@Catch(Error)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(HttpExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let httpStatusCode = HttpResponseStatus.INTERNAL_SERVER_ERROR;
    let message =
      process.env.NODE_ENV === Environment.Production
        ? 'Internal Server Error'
        : `Error: ${exception.message} \n Stack: ${exception.stack}`;
    let code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR;
    let details: any = `${exception.name} \n Error: ${exception.message} \n Stack: ${exception.stack}`;

    /**
     * if exception is instance of domain BaseError
     */
    if (exception instanceof BaseError) {
      httpStatusCode = (exception as BaseError).httpStatus ?? httpStatusCode;
      message = (exception as BaseError).message ?? message;
      code = (exception as BaseError).code ?? code;
      details = (exception as BaseError).details ?? details;
    }

    /**
     * if exception is instance of NestJS HttpException
     */
    if (exception instanceof HttpException) {
      httpStatusCode = (exception as HttpException).getStatus();
      message = (exception as HttpException).message;
    }

    if (httpStatusCode >= 500) {
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.log(exception.message);
    }

    const responseBody: HttpErrorDto = {
      message,
      code,
      details,
    };

    response.status(httpStatusCode).json(responseBody);
  }
}