import { Injectable } from "@nestjs/common";
import { CategoryNotFoundError } from "@domain/errors";
import { CategoryRepository } from "@domain/repositories";
import { CommandUseCase } from "@domain/types";

export interface DeleteCategoryInput {
  id: number;
}

@Injectable()
export class DeleteCategoryUseCase implements CommandUseCase<DeleteCategoryInput> {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: DeleteCategoryInput): Promise<void> {
    const category = await this.categoryRepository.findById(input.id);

    if (!category) {
      throw new CategoryNotFoundError(input.id);
    }

    await this.categoryRepository.softDelete(input.id);
  }
}
