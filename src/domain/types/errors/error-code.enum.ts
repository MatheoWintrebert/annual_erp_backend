export enum ErrorCode {
  DTO_VALIDATION_FAILED = "DTO_VALIDATION_FAILED",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  DELETION_BLOCKED_PALETTES_EXIST = "DELETION_BLOCKED_PALETTES_EXIST",
  PRODUCT_HAS_ACTIVE_PALETTES = "PRODUCT_HAS_ACTIVE_PALETTES",
  DUPLICATE_PRODUCT_REFERENCE = "DUPLICATE_PRODUCT_REFERENCE",
  RULE_VIOLATIONS_DETECTED = "RULE_VIOLATIONS_DETECTED",
  NO_VALID_PLACEMENT = "NO_VALID_PLACEMENT",
  POSITION_OCCUPIED = "POSITION_OCCUPIED",
  PALETTIER_NOT_FOUND = "PALETTIER_NOT_FOUND",
  POSITION_OUT_OF_BOUNDS = "POSITION_OUT_OF_BOUNDS",
  PLACEMENT_CONFLICT = "PLACEMENT_CONFLICT",
  PALETTE_NOT_FOUND = "PALETTE_NOT_FOUND",
  INSUFFICIENT_STOCK = "INSUFFICIENT_STOCK",
  EMPTY_PICKING_LIST = "EMPTY_PICKING_LIST",
  DUPLICATE_PRODUCT_IN_LIST = "DUPLICATE_PRODUCT_IN_LIST",
  PICKING_LIST_NOT_FOUND = "PICKING_LIST_NOT_FOUND",
  INVALID_PICKING_LIST_STATUS = "INVALID_PICKING_LIST_STATUS",
  PICKING_LIST_ALREADY_COMPLETED = "PICKING_LIST_ALREADY_COMPLETED",
  PICKING_LIST_ALREADY_CANCELLED = "PICKING_LIST_ALREADY_CANCELLED",
  STOCK_DEDUCTION_FAILED = "STOCK_DEDUCTION_FAILED",
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
  [ErrorCode.DELETION_BLOCKED_PALETTES_EXIST]: {
    code: ErrorCode.DELETION_BLOCKED_PALETTES_EXIST,
    message: "Cannot delete palettier that contains palettes",
  },
  [ErrorCode.PRODUCT_HAS_ACTIVE_PALETTES]: {
    code: ErrorCode.PRODUCT_HAS_ACTIVE_PALETTES,
    message: "Cannot delete product that is on active palettes",
  },
  [ErrorCode.DUPLICATE_PRODUCT_REFERENCE]: {
    code: ErrorCode.DUPLICATE_PRODUCT_REFERENCE,
    message: "A product with this reference already exists",
  },
  [ErrorCode.RULE_VIOLATIONS_DETECTED]: {
    code: ErrorCode.RULE_VIOLATIONS_DETECTED,
    message: "Rule violations detected on existing palettes",
  },
  [ErrorCode.NO_VALID_PLACEMENT]: {
    code: ErrorCode.NO_VALID_PLACEMENT,
    message: "No valid placement found for the given product",
  },
  [ErrorCode.POSITION_OCCUPIED]: {
    code: ErrorCode.POSITION_OCCUPIED,
    message: "The specified position is already occupied",
  },
  [ErrorCode.PALETTIER_NOT_FOUND]: {
    code: ErrorCode.PALETTIER_NOT_FOUND,
    message: "Palettier not found",
  },
  [ErrorCode.POSITION_OUT_OF_BOUNDS]: {
    code: ErrorCode.POSITION_OUT_OF_BOUNDS,
    message: "Position exceeds palettier dimensions",
  },
  [ErrorCode.PLACEMENT_CONFLICT]: {
    code: ErrorCode.PLACEMENT_CONFLICT,
    message:
      "Products have incompatible placement rules and require separate palettiers",
  },
  [ErrorCode.PALETTE_NOT_FOUND]: {
    code: ErrorCode.PALETTE_NOT_FOUND,
    message: "Palette not found",
  },
  [ErrorCode.INSUFFICIENT_STOCK]: {
    code: ErrorCode.INSUFFICIENT_STOCK,
    message: "Requested quantities exceed available stock",
  },
  [ErrorCode.EMPTY_PICKING_LIST]: {
    code: ErrorCode.EMPTY_PICKING_LIST,
    message: "Picking list must contain at least one product",
  },
  [ErrorCode.DUPLICATE_PRODUCT_IN_LIST]: {
    code: ErrorCode.DUPLICATE_PRODUCT_IN_LIST,
    message: "Picking list contains duplicate products",
  },
  [ErrorCode.PICKING_LIST_NOT_FOUND]: {
    code: ErrorCode.PICKING_LIST_NOT_FOUND,
    message: "Picking list not found",
  },
  [ErrorCode.INVALID_PICKING_LIST_STATUS]: {
    code: ErrorCode.INVALID_PICKING_LIST_STATUS,
    message: "Picking list has an invalid status for this operation",
  },
  [ErrorCode.PICKING_LIST_ALREADY_COMPLETED]: {
    code: ErrorCode.PICKING_LIST_ALREADY_COMPLETED,
    message: "Picking list has already been completed",
  },
  [ErrorCode.PICKING_LIST_ALREADY_CANCELLED]: {
    code: ErrorCode.PICKING_LIST_ALREADY_CANCELLED,
    message: "Picking list has already been cancelled",
  },
  [ErrorCode.STOCK_DEDUCTION_FAILED]: {
    code: ErrorCode.STOCK_DEDUCTION_FAILED,
    message: "Stock deduction failed due to insufficient quantity",
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
