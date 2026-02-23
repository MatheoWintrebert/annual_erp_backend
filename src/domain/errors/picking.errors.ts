import { ErrorCode, HttpResponseStatus, PickingListStatus } from "@domain/types";
import { BaseError } from "./base.error";

export interface InsufficientStockDetail {
  productId: number;
  productName: string;
  requestedQuantity: number;
  availableQuantity: number;
}

export class InsufficientStockError extends BaseError {
  constructor(details: InsufficientStockDetail[]) {
    super("Requested quantities exceed available stock", {
      httpStatus: HttpResponseStatus.BAD_REQUEST,
      code: ErrorCode.INSUFFICIENT_STOCK,
      details: { items: details },
    });
  }
}

export class EmptyPickingListError extends BaseError {
  constructor() {
    super("Picking list must contain at least one product", {
      httpStatus: HttpResponseStatus.BAD_REQUEST,
      code: ErrorCode.EMPTY_PICKING_LIST,
    });
  }
}

export class DuplicateProductInListError extends BaseError {
  constructor(duplicateProductIds: number[]) {
    super("Picking list contains duplicate products", {
      httpStatus: HttpResponseStatus.BAD_REQUEST,
      code: ErrorCode.DUPLICATE_PRODUCT_IN_LIST,
      details: { duplicateProductIds },
    });
  }
}

export class PickingListNotFoundError extends BaseError {
  constructor(id: number) {
    super(`Picking list with ID ${String(id)} not found`, {
      httpStatus: HttpResponseStatus.NOT_FOUND,
      code: ErrorCode.PICKING_LIST_NOT_FOUND,
    });
  }
}

export class InvalidPickingListStatusError extends BaseError {
  constructor(id: number, currentStatus: PickingListStatus, expectedStatus: PickingListStatus) {
    super(
      `Picking list ${String(id)} has status '${currentStatus}', expected '${expectedStatus}'`,
      {
        httpStatus: HttpResponseStatus.BAD_REQUEST,
        code: ErrorCode.INVALID_PICKING_LIST_STATUS,
        details: { currentStatus, expectedStatus },
      },
    );
  }
}

export class PickingListAlreadyCompletedError extends BaseError {
  constructor(id: number) {
    super(`Picking list ${String(id)} has already been completed`, {
      httpStatus: HttpResponseStatus.BAD_REQUEST,
      code: ErrorCode.PICKING_LIST_ALREADY_COMPLETED,
    });
  }
}

export class PickingListAlreadyCancelledError extends BaseError {
  constructor(id: number) {
    super(`Picking list ${String(id)} has already been cancelled`, {
      httpStatus: HttpResponseStatus.BAD_REQUEST,
      code: ErrorCode.PICKING_LIST_ALREADY_CANCELLED,
    });
  }
}

export class StockDeductionFailedError extends BaseError {
  constructor(paletteLotId: number, requestedQuantity: number) {
    super(
      `Failed to deduct ${String(requestedQuantity)} from palette lot ${String(paletteLotId)} — insufficient quantity`,
      {
        httpStatus: HttpResponseStatus.CONFLICT,
        code: ErrorCode.STOCK_DEDUCTION_FAILED,
        details: { paletteLotId, requestedQuantity },
      },
    );
  }
}
