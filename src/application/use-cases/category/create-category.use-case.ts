import { Injectable } from "@nestjs/common";
import { CategoryEntity } from "@domain/entities";
import { DuplicateCategoryNameError } from "@domain/errors";
import { CategoryRepository } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

export interface CreateCategoryInput {
  name: string;
}

@Injectable()
export class CreateCategoryUseCase implements QueryUseCase<
  CreateCategoryInput,
  CategoryEntity
> {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<CategoryEntity> {
    const existing = await this.categoryRepository.findByName(input.name);
    if (existing) {
      throw new DuplicateCategoryNameError(input.name);
    }

    return this.categoryRepository.create({ name: input.name });
  }
}
