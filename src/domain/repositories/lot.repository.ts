import type { EntityManager } from "typeorm";
import { LotEntity } from "@domain/entities";

export interface CreateLotData {
  productId: number;
  reference: string;
  supplierName: string;
  totalQuantity: number;
  arrivalDate: Date;
  expirationDate: Date | null;
}

export abstract class LotRepository {
  abstract create(
    data: CreateLotData,
    transactionManager?: EntityManager
  ): Promise<LotEntity>;

  abstract generateReference(productId: number): Promise<string>;
}
