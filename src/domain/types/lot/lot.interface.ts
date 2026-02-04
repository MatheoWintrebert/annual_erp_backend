export interface ILot {
  id: number;
  productId: number;
  reference: string;
  supplierName: string;
  totalQuantity: number;
  arrivalDate: Date;
  expirationDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
