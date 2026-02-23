import { Injectable } from "@nestjs/common";
import { CategoryEntity } from "@domain/entities";
import {
  CategoryNotFoundError,
  DuplicateCategoryNameError,
} from "@domain/errors";
import { CategoryRepository } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

export interface UpdateCategoryInput {
  id: number;
  name?: string;
}

@Injectable()
export class UpdateCategoryUseCase implements QueryUseCase<
  UpdateCategoryInput,
  CategoryEntity
> {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<CategoryEntity> {
    const existing = await this.categoryRepository.findById(input.id);
    if (!existing) {
      throw new CategoryNotFoundError(input.id);
    }

    if (input.name !== undefined && input.name !== existing.name) {
      const duplicate = await this.categoryRepository.findByName(input.name);
      if (duplicate) {
        throw new DuplicateCategoryNameError(input.name);
      }
    }

    return this.categoryRepository.update(input.id, { name: input.name });
  }
}
