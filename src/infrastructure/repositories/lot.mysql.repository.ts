import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { type EntityManager, Repository } from "typeorm";
import { LotEntity } from "@domain/entities";
import { CreateLotData, LotRepository } from "@domain/repositories";
import { LotTypeormEntity } from "@infrastructure/entities";

@Injectable()
export class LotMysqlRepository implements LotRepository {
  constructor(
    @InjectRepository(LotTypeormEntity)
    private readonly lotRepo: Repository<LotTypeormEntity>
  ) {}

  async create(
    data: CreateLotData,
    transactionManager?: EntityManager
  ): Promise<LotEntity> {
    const repo = transactionManager
      ? transactionManager.getRepository(LotTypeormEntity)
      : this.lotRepo;
    const entity = repo.create({
      productId: data.productId,
      reference: data.reference,
      supplierName: data.supplierName,
      totalQuantity: data.totalQuantity,
      arrivalDate: data.arrivalDate,
      expirationDate: data.expirationDate,
    });
    const saved = await repo.save(entity);
    return this.toLotEntity(saved);
  }

  // productId reserved for future per-product reference schemes
  async generateReference(_productId: number): Promise<string> {
    const today = new Date();
    const dateStr = this.formatDate(today);
    const prefix = `LOT-${dateStr}-`;

    const escapedPrefix = this.escapeLikeString(prefix);

    const lastLot = await this.lotRepo
      .createQueryBuilder("lot")
      .where("lot.reference LIKE :pattern", {
        pattern: `${escapedPrefix}%`,
      })
      .orderBy("lot.reference", "DESC")
      .getOne();

    if (!lastLot) {
      return `${prefix}0001`;
    }

    const lastSequence = lastLot.reference.slice(prefix.length);
    const nextNumber = parseInt(lastSequence, 10) + 1;
    return `${prefix}${String(nextNumber).padStart(4, "0")}`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${String(year)}${month}${day}`;
  }

  private escapeLikeString(value: string): string {
    return value.replace(/[%_\\]/g, "\\$&");
  }

  private toLotEntity(entity: LotTypeormEntity): LotEntity {
    return new LotEntity({
      id: entity.id,
      productId: entity.productId,
      reference: entity.reference,
      supplierName: entity.supplierName,
      totalQuantity: entity.totalQuantity,
      arrivalDate: entity.arrivalDate,
      expirationDate: entity.expirationDate,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }
}
