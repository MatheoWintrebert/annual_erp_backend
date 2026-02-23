import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Repository } from "typeorm";
import { UnitOfMeasureEntity } from "@domain/entities";
import { UnitOfMeasureNotFoundError } from "@domain/errors";
import {
  CreateUnitOfMeasureData,
  FindUnitsOfMeasureOptions,
  FindUnitsOfMeasureResult,
  UnitOfMeasureRepository,
  UpdateUnitOfMeasureData,
} from "@domain/repositories";
import { UnitOfMeasureTypeormEntity } from "@infrastructure/entities";

@Injectable()
export class UnitOfMeasureMysqlRepository implements UnitOfMeasureRepository {
  constructor(
    @InjectRepository(UnitOfMeasureTypeormEntity)
    private readonly unitOfMeasureRepo: Repository<UnitOfMeasureTypeormEntity>
  ) {}

  async findById(id: number): Promise<UnitOfMeasureEntity | null> {
    const unitOfMeasure = await this.unitOfMeasureRepo.findOne({
      where: { id },
    });

    if (!unitOfMeasure) {
      return null;
    }

    return this.toUnitOfMeasureEntity(unitOfMeasure);
  }

  async findAll(
    options?: FindUnitsOfMeasureOptions
  ): Promise<FindUnitsOfMeasureResult> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    if (options?.search) {
      return this.findWithSearch(options.search, skip, limit);
    }

    const [unitsOfMeasure, total] = await this.unitOfMeasureRepo.findAndCount({
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    return {
      unitsOfMeasure: unitsOfMeasure.map((u) => this.toUnitOfMeasureEntity(u)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByName(name: string): Promise<UnitOfMeasureEntity | null> {
    const unitOfMeasure = await this.unitOfMeasureRepo.findOne({
      where: { name },
    });

    if (!unitOfMeasure) {
      return null;
    }

    return this.toUnitOfMeasureEntity(unitOfMeasure);
  }

  async findByAbbreviation(
    abbreviation: string
  ): Promise<UnitOfMeasureEntity | null> {
    const unitOfMeasure = await this.unitOfMeasureRepo.findOne({
      where: { abbreviation },
    });

    if (!unitOfMeasure) {
      return null;
    }

    return this.toUnitOfMeasureEntity(unitOfMeasure);
  }

  async create(data: CreateUnitOfMeasureData): Promise<UnitOfMeasureEntity> {
    const entity = this.unitOfMeasureRepo.create({
      name: data.name,
      abbreviation: data.abbreviation,
    });
    const saved = await this.unitOfMeasureRepo.save(entity);
    return this.toUnitOfMeasureEntity(saved);
  }

  async update(
    id: number,
    data: UpdateUnitOfMeasureData
  ): Promise<UnitOfMeasureEntity> {
    const unitOfMeasure = await this.unitOfMeasureRepo.findOne({
      where: { id },
    });

    if (!unitOfMeasure) {
      throw new UnitOfMeasureNotFoundError(id);
    }

    if (data.name !== undefined) {
      unitOfMeasure.name = data.name;
    }

    if (data.abbreviation !== undefined) {
      unitOfMeasure.abbreviation = data.abbreviation;
    }

    const saved = await this.unitOfMeasureRepo.save(unitOfMeasure);
    return this.toUnitOfMeasureEntity(saved);
  }

  async delete(id: number): Promise<void> {
    const unitOfMeasure = await this.unitOfMeasureRepo.findOne({
      where: { id },
    });

    if (!unitOfMeasure) {
      throw new UnitOfMeasureNotFoundError(id);
    }

    await this.unitOfMeasureRepo.remove(unitOfMeasure);
  }

  private async findWithSearch(
    search: string,
    skip: number,
    limit: number
  ): Promise<FindUnitsOfMeasureResult> {
    const [unitsOfMeasure, total] = await this.unitOfMeasureRepo.findAndCount({
      where: [
        { name: Like(`%${search}%`) },
        { abbreviation: Like(`%${search}%`) },
      ],
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    const page = Math.floor(skip / limit) + 1;

    return {
      unitsOfMeasure: unitsOfMeasure.map((u) => this.toUnitOfMeasureEntity(u)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private toUnitOfMeasureEntity(
    entity: UnitOfMeasureTypeormEntity
  ): UnitOfMeasureEntity {
    return new UnitOfMeasureEntity({
      id: entity.id,
      name: entity.name,
      abbreviation: entity.abbreviation,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
