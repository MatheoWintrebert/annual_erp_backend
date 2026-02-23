import { Injectable } from "@nestjs/common";
import { CategoryRepository, FindCategoriesResult } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

export interface GetCategoriesInput {
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class GetCategoriesUseCase implements QueryUseCase<
  GetCategoriesInput,
  FindCategoriesResult
> {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: GetCategoriesInput): Promise<FindCategoriesResult> {
    return this.categoryRepository.findAll({
      search: input.search,
      page: input.page ?? 1,
      limit: input.limit ?? 20,
    });
  }
}
