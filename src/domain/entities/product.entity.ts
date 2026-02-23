import { IProduct } from "@domain/types";

export class ProductEntity implements IProduct {
  public readonly id: number;
  public readonly reference: string;
  public readonly name: string;
  public readonly unitOfMeasureId: number;
  public readonly categoryId: number | null;
  public readonly minimumStock: number | null;
  public readonly expiryAlertThreshold: number | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt: Date | null;

  constructor(params: IProduct) {
    this.id = params.id;
    this.reference = params.reference;
    this.name = params.name;
    this.unitOfMeasureId = params.unitOfMeasureId;
    this.categoryId = params.categoryId;
    this.minimumStock = params.minimumStock;
    this.expiryAlertThreshold = params.expiryAlertThreshold;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.deletedAt = params.deletedAt;
  }
}
