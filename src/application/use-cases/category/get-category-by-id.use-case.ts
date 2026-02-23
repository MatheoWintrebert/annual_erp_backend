import { Injectable } from "@nestjs/common";
import { CategoryEntity } from "@domain/entities";
import { CategoryNotFoundError } from "@domain/errors";
import { CategoryRepository } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

export interface GetCategoryByIdInput {
  id: number;
}

@Injectable()
export class GetCategoryByIdUseCase implements QueryUseCase<
  GetCategoryByIdInput,
  CategoryEntity
> {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: GetCategoryByIdInput): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findById(input.id);

    if (!category) {
      throw new CategoryNotFoundError(input.id);
    }

    return category;
  }
}
