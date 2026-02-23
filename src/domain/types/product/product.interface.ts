export interface IProduct {
  id: number;
  reference: string;
  name: string;
  unitOfMeasureId: number;
  categoryId: number | null;
  minimumStock: number | null;
  expiryAlertThreshold: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
