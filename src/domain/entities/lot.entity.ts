import { ILot } from "@domain/types";

export class LotEntity implements ILot {
  public readonly id: number;
  public readonly productId: number;
  public readonly reference: string;
  public readonly supplierName: string;
  public readonly totalQuantity: number;
  public readonly arrivalDate: Date;
  public readonly expirationDate: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt: Date | null;

  constructor(params: ILot) {
    this.id = params.id;
    this.productId = params.productId;
    this.reference = params.reference;
    this.supplierName = params.supplierName;
    this.totalQuantity = params.totalQuantity;
    this.arrivalDate = params.arrivalDate;
    this.expirationDate = params.expirationDate;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.deletedAt = params.deletedAt;
  }

  get isExpired(): boolean {
    if (!this.expirationDate) return false;
    return new Date() > this.expirationDate;
  }
}
