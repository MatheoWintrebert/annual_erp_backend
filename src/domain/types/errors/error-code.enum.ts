export enum ErrorCode {
    DTO_VALIDATION_FAILED = 'DTO_VALIDATION_FAILED',
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  }
  
  export const ERRORS = {
    [ErrorCode.DTO_VALIDATION_FAILED]: {
      code: ErrorCode.DTO_VALIDATION_FAILED,
      message: 'Validation errors',
    },
  };
  
  export function createSwaggerErrorCodesDescription(codes: ErrorCode[]): string {
    const description = ['Possible error codes:'];
  
    for (const code of codes) {
      const data = ERRORS[code];
  
      description.push(`<code>"code": "${code}"</code> - ${data.message}`);
    }
  
    return description.join('\n\n');
  }