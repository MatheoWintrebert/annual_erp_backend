import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, In, IsNull, Repository } from "typeorm";
import { PalettierEntity } from "@domain/entities";
import { NotFoundError } from "@domain/errors";
import {
  CreatePalettierData,
  PalettierRepository,
  UpdatePalettierData,
} from "@domain/repositories";
import {
  PalettierTypeormEntity,
  PaletteTypeormEntity,
} from "@infrastructure/entities";

@Injectable()
export class PalettierMysqlRepository implements PalettierRepository {
  constructor(
    @InjectRepository(PalettierTypeormEntity)
    private readonly repository: Repository<PalettierTypeormEntity>,
    @InjectRepository(PaletteTypeormEntity)
    private readonly paletteRepository: Repository<PaletteTypeormEntity>
  ) {}

  async findById(id: number): Promise<PalettierEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });

    if (!entity) {
      return null;
    }

    return this.toDomainEntity(entity);
  }

  async findByIds(ids: number[]): Promise<PalettierEntity[]> {
    if (ids.length === 0) return [];

    const entities = await this.repository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => this.toDomainEntity(entity));
  }

  async findAll(): Promise<PalettierEntity[]> {
    const entities = await this.repository.find({
      order: { createdAt: "DESC" },
    });

    return entities.map((entity) => this.toDomainEntity(entity));
  }

  async create(
    data: CreatePalettierData,
    transactionManager?: EntityManager
  ): Promise<PalettierEntity> {
    const repo = transactionManager
      ? transactionManager.getRepository(PalettierTypeormEntity)
      : this.repository;

    const entity = repo.create({
      name: data.name,
      palettierTypeId: data.palettierTypeId,
      width: data.width,
      depth: data.depth,
      height: data.height,
    });
    const saved = await repo.save(entity);

    return this.toDomainEntity(saved);
  }

  async createMany(
    data: CreatePalettierData[],
    transactionManager?: EntityManager
  ): Promise<PalettierEntity[]> {
    const repo = transactionManager
      ? transactionManager.getRepository(PalettierTypeormEntity)
      : this.repository;

    const entities = data.map((d) =>
      repo.create({
        name: d.name,
        palettierTypeId: d.palettierTypeId,
        width: d.width,
        depth: d.depth,
        height: d.height,
      })
    );
    const saved = await repo.save(entities);

    return saved.map((e) => this.toDomainEntity(e));
  }

  async update(
    id: number,
    data: UpdatePalettierData
  ): Promise<PalettierEntity> {
    const entity = await this.repository.findOne({ where: { id } });

    if (!entity) {
      throw new NotFoundError(`Palettier with ID ${String(id)}`);
    }

    if (data.name !== undefined) {
      entity.name = data.name;
    }
    if (data.palettierTypeId !== undefined) {
      entity.palettierTypeId = data.palettierTypeId;
    }
    if (data.width !== undefined) {
      entity.width = data.width;
    }
    if (data.depth !== undefined) {
      entity.depth = data.depth;
    }
    if (data.height !== undefined) {
      entity.height = data.height;
    }

    const saved = await this.repository.save(entity);
    return this.toDomainEntity(saved);
  }

  async delete(id: number): Promise<void> {
    const entity = await this.repository.findOne({ where: { id } });

    if (!entity) {
      throw new NotFoundError(`Palettier with ID ${String(id)}`);
    }

    await this.repository.softRemove(entity);
  }

  async countPalettesByPalettierId(id: number): Promise<number> {
    return this.paletteRepository.count({
      where: { palettierId: id, deletedAt: IsNull() },
    });
  }

  async countPalettesByPalettierIds(
    ids: number[]
  ): Promise<Map<number, number>> {
    if (ids.length === 0) return new Map();

    const counts = await this.paletteRepository
      .createQueryBuilder("palette")
      .select("palette.palettier_id", "palettierId")
      .addSelect("COUNT(*)", "count")
      .where("palette.palettier_id IN (:...ids)", { ids })
      .groupBy("palette.palettier_id")
      .getRawMany<{ palettierId: number; count: string }>();

    const map = new Map<number, number>();
    for (const row of counts) {
      map.set(row.palettierId, Number(row.count));
    }
    return map;
  }

  async getCapacitySummary(): Promise<{
    count: number;
    totalCapacity: number;
  }> {
    const result = await this.repository
      .createQueryBuilder("palettier")
      .select("COUNT(*)", "count")
      .addSelect(
        "COALESCE(SUM(palettier.width * palettier.depth * palettier.height), 0)",
        "totalCapacity"
      )
      .where("palettier.deletedAt IS NULL")
      .getRawOne<{ count: string; totalCapacity: string }>();

    return {
      count: Number(result?.count ?? 0),
      totalCapacity: Number(result?.totalCapacity ?? 0),
    };
  }

  private toDomainEntity(entity: PalettierTypeormEntity): PalettierEntity {
    return new PalettierEntity({
      id: entity.id,
      palettierTypeId: entity.palettierTypeId,
      name: entity.name,
      width: entity.width,
      depth: entity.depth,
      height: entity.height,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }
}
