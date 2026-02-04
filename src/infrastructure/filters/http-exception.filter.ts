import { Response } from "express";
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpException,
} from "@nestjs/common";
import { Environment, ErrorCode, HttpResponseStatus } from "@domain/types";
import { BaseError } from "@domain/errors";
import { HttpErrorDto } from "@infrastructure/dto";

@Catch(Error)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(HttpExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let httpStatusCode: number = HttpResponseStatus.INTERNAL_SERVER_ERROR;
    let message =
      process.env.NODE_ENV === Environment.Production
        ? "Internal Server Error"
        : `Error: ${exception.message} \n Stack: ${String(exception.stack)}`;
    let code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR;
    let details: Record<string, unknown> = {
      name: exception.name,
      error: exception.message,
      stack: String(exception.stack),
    };

    /**
     * if exception is instance of domain BaseError
     */
    if (exception instanceof BaseError) {
      httpStatusCode = exception.httpStatus;
      message = exception.message;
      code = exception.code;
      details = exception.details;
    }

    /**
     * if exception is instance of NestJS HttpException
     */
    if (exception instanceof HttpException) {
      httpStatusCode = exception.getStatus();
      message = exception.message;
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
