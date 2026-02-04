import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { PalettierTypeEntity } from "@domain/entities";
import { NotFoundError } from "@domain/errors";
import {
  CreatePalettierTypeData,
  PalettierTypeRepository,
  UpdatePalettierTypeData,
} from "@domain/repositories";
import { PalettierTypeTypeormEntity } from "@infrastructure/entities";

@Injectable()
export class PalettierTypeMysqlRepository implements PalettierTypeRepository {
  constructor(
    @InjectRepository(PalettierTypeTypeormEntity)
    private readonly repository: Repository<PalettierTypeTypeormEntity>
  ) {}

  async findById(id: number): Promise<PalettierTypeEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });

    if (!entity) {
      return null;
    }

    return this.toDomainEntity(entity);
  }

  async findByName(name: string): Promise<PalettierTypeEntity | null> {
    const entity = await this.repository.findOne({ where: { name } });

    if (!entity) {
      return null;
    }

    return this.toDomainEntity(entity);
  }

  async findAll(): Promise<PalettierTypeEntity[]> {
    const entities = await this.repository.find({
      order: { createdAt: "DESC" },
    });

    return entities.map((entity) => this.toDomainEntity(entity));
  }

  async create(
    data: CreatePalettierTypeData,
    transactionManager?: EntityManager
  ): Promise<PalettierTypeEntity> {
    const repo = transactionManager
      ? transactionManager.getRepository(PalettierTypeTypeormEntity)
      : this.repository;

    const entity = repo.create({
      name: data.name,
      description: data.description ?? null,
    });
    const saved = await repo.save(entity);

    return this.toDomainEntity(saved);
  }

  async update(
    id: number,
    data: UpdatePalettierTypeData
  ): Promise<PalettierTypeEntity> {
    const entity = await this.repository.findOne({ where: { id } });

    if (!entity) {
      throw new NotFoundError(`Palettier type with ID ${String(id)}`);
    }

    if (data.name !== undefined) {
      entity.name = data.name;
    }
    if (data.description !== undefined) {
      entity.description = data.description;
    }

    const saved = await this.repository.save(entity);
    return this.toDomainEntity(saved);
  }

  private toDomainEntity(
    entity: PalettierTypeTypeormEntity
  ): PalettierTypeEntity {
    return new PalettierTypeEntity({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
