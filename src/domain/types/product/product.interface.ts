export interface IProduct {
  id: number;
  reference: string;
  name: string;
  unitOfMeasureId: number;
  minimumStock: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
