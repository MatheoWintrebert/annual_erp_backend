import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Like, Repository } from "typeorm";
import { CategoryEntity } from "@domain/entities";
import { CategoryNotFoundError } from "@domain/errors";
import {
  CategoryRepository,
  CreateCategoryData,
  FindCategoriesOptions,
  FindCategoriesResult,
  UpdateCategoryData,
} from "@domain/repositories";
import { CategoryTypeormEntity } from "@infrastructure/entities";

@Injectable()
export class CategoryMysqlRepository implements CategoryRepository {
  constructor(
    @InjectRepository(CategoryTypeormEntity)
    private readonly categoryRepo: Repository<CategoryTypeormEntity>
  ) {}

  async findById(id: number): Promise<CategoryEntity | null> {
    const category = await this.categoryRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!category) {
      return null;
    }

    return this.toCategoryEntity(category);
  }

  async findAll(
    options?: FindCategoriesOptions
  ): Promise<FindCategoriesResult> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    if (options?.search) {
      return this.findWithSearch(options.search, skip, limit);
    }

    const [categories, total] = await this.categoryRepo.findAndCount({
      where: { deletedAt: IsNull() },
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    return {
      categories: categories.map((c) => this.toCategoryEntity(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    const category = await this.categoryRepo.findOne({
      where: { name, deletedAt: IsNull() },
    });

    if (!category) {
      return null;
    }

    return this.toCategoryEntity(category);
  }

  async create(data: CreateCategoryData): Promise<CategoryEntity> {
    const entity = this.categoryRepo.create({ name: data.name });
    const saved = await this.categoryRepo.save(entity);
    return this.toCategoryEntity(saved);
  }

  async update(id: number, data: UpdateCategoryData): Promise<CategoryEntity> {
    const category = await this.categoryRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!category) {
      throw new CategoryNotFoundError(id);
    }

    if (data.name !== undefined) {
      category.name = data.name;
    }

    const saved = await this.categoryRepo.save(category);
    return this.toCategoryEntity(saved);
  }

  async softDelete(id: number): Promise<void> {
    const category = await this.categoryRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!category) {
      throw new CategoryNotFoundError(id);
    }

    await this.categoryRepo.softDelete(id);
  }

  private async findWithSearch(
    search: string,
    skip: number,
    limit: number
  ): Promise<FindCategoriesResult> {
    const [categories, total] = await this.categoryRepo.findAndCount({
      where: { name: Like(`%${search}%`), deletedAt: IsNull() },
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    const page = Math.floor(skip / limit) + 1;

    return {
      categories: categories.map((c) => this.toCategoryEntity(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private toCategoryEntity(entity: CategoryTypeormEntity): CategoryEntity {
    return new CategoryEntity({
      id: entity.id,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }
}
