export enum ErrorCode {
  DTO_VALIDATION_FAILED = "DTO_VALIDATION_FAILED",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
}

interface ErrorInfo {
  code: ErrorCode;
  message: string;
}

export const ERRORS: Record<ErrorCode, ErrorInfo> = {
  [ErrorCode.DTO_VALIDATION_FAILED]: {
    code: ErrorCode.DTO_VALIDATION_FAILED,
    message: "Validation errors",
  },
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: "Internal server error",
  },
  [ErrorCode.RESOURCE_NOT_FOUND]: {
    code: ErrorCode.RESOURCE_NOT_FOUND,
    message: "Resource not found",
  },
};

export function createSwaggerErrorCodesDescription(codes: ErrorCode[]): string {
  const description = ["Possible error codes:"];

  for (const code of codes) {
    const data = ERRORS[code];

    description.push(`<code>"code": "${code}"</code> - ${data.message}`);
  }

  return description.join("\n\n");
}
