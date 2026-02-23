import { ArgumentsHost, HttpException } from "@nestjs/common";
import { HttpExceptionFilter } from "./http-exception.filter";
import { ErrorCode, HttpResponseStatus } from "@domain/types";
import { BaseError } from "@domain/errors";
import type { HttpErrorDto } from "@infrastructure/dto";

class TestDomainError extends BaseError {
  constructor() {
    super("Domain error message", {
      httpStatus: HttpResponseStatus.BAD_REQUEST,
      code: ErrorCode.DTO_VALIDATION_FAILED,
      details: { field: "name" },
    });
  }
}

interface MockHost {
  host: ArgumentsHost;
  getResponseBody: () => HttpErrorDto;
  getStatusCode: () => number;
}

const createMockHost = (): MockHost => {
  let capturedBody: HttpErrorDto | undefined;
  let capturedStatus: number | undefined;

  const jsonFn = (body: HttpErrorDto): void => {
    capturedBody = body;
  };
  const statusFn = (code: number): { json: typeof jsonFn } => {
    capturedStatus = code;
    return { json: jsonFn };
  };
  const host: ArgumentsHost = {
    switchToHttp: (): {
      getResponse: () => { status: typeof statusFn };
      getRequest: () => Record<string, unknown>;
    } => ({
      getResponse: (): { status: typeof statusFn } => ({ status: statusFn }),
      getRequest: (): Record<string, unknown> => ({}),
    }),
  } as unknown as ArgumentsHost;

  return {
    host,
    getResponseBody: (): HttpErrorDto => {
      if (!capturedBody) throw new Error("No response body captured");
      return capturedBody;
    },
    getStatusCode: (): number => {
      if (capturedStatus === undefined)
        throw new Error("No status code captured");
      return capturedStatus;
    },
  };
};

describe("HttpExceptionFilter", () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it("should return { statusCode, code, message, details } for domain errors", () => {
    const { host, getResponseBody, getStatusCode } = createMockHost();

    filter.catch(new TestDomainError(), host);

    expect(getStatusCode()).toBe(HttpResponseStatus.BAD_REQUEST);
    const body = getResponseBody();
    expect(body.statusCode).toBe(HttpResponseStatus.BAD_REQUEST);
    expect(body.code).toBe(ErrorCode.DTO_VALIDATION_FAILED);
    expect(body.message).toBe("Domain error message");
    expect(body.details).toEqual({ field: "name" });
  });

  it("should return { statusCode, code, message, details } for NestJS HttpException", () => {
    const { host, getResponseBody, getStatusCode } = createMockHost();

    filter.catch(new HttpException("Not Found", 404), host);

    expect(getStatusCode()).toBe(404);
    const body = getResponseBody();
    expect(body.statusCode).toBe(404);
    expect(body.code).toBe(ErrorCode.RESOURCE_NOT_FOUND);
    expect(body.message).toBe("Not Found");
    expect(body.details).toEqual({});
  });

  it("should return { statusCode, code, message, details } for generic errors", () => {
    const { host, getResponseBody, getStatusCode } = createMockHost();

    filter.catch(new Error("Something broke"), host);

    expect(getStatusCode()).toBe(500);
    const body = getResponseBody();
    expect(body.statusCode).toBe(500);
    expect(body.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("details");
  });
});
