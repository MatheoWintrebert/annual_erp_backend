import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { type EntityManager, Repository } from "typeorm";
import { PaletteLotEntity } from "@domain/entities";
import {
  CreatePaletteLotData,
  PaletteLotRepository,
} from "@domain/repositories";
import { PaletteLotTypeormEntity } from "@infrastructure/entities";

@Injectable()
export class PaletteLotMysqlRepository implements PaletteLotRepository {
  constructor(
    @InjectRepository(PaletteLotTypeormEntity)
    private readonly paletteLotRepo: Repository<PaletteLotTypeormEntity>
  ) {}

  async create(
    data: CreatePaletteLotData,
    transactionManager?: EntityManager
  ): Promise<PaletteLotEntity> {
    const repo = transactionManager
      ? transactionManager.getRepository(PaletteLotTypeormEntity)
      : this.paletteLotRepo;
    const entity = repo.create({
      paletteId: data.paletteId,
      lotId: data.lotId,
      quantity: data.quantity,
    });
    const saved = await repo.save(entity);
    return this.toPaletteLotEntity(saved);
  }

  private toPaletteLotEntity(
    entity: PaletteLotTypeormEntity
  ): PaletteLotEntity {
    return new PaletteLotEntity({
      id: entity.id,
      paletteId: entity.paletteId,
      lotId: entity.lotId,
      quantity: entity.quantity,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
