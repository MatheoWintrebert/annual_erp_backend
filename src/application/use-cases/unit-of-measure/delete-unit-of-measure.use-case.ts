import { Injectable } from "@nestjs/common";
import { UnitOfMeasureNotFoundError } from "@domain/errors";
import { UnitOfMeasureRepository } from "@domain/repositories";
import { CommandUseCase } from "@domain/types";

export interface DeleteUnitOfMeasureInput {
  id: number;
}

@Injectable()
export class DeleteUnitOfMeasureUseCase implements CommandUseCase<DeleteUnitOfMeasureInput> {
  constructor(
    private readonly unitOfMeasureRepository: UnitOfMeasureRepository
  ) {}

  async execute(input: DeleteUnitOfMeasureInput): Promise<void> {
    const unitOfMeasure = await this.unitOfMeasureRepository.findById(input.id);

    if (!unitOfMeasure) {
      throw new UnitOfMeasureNotFoundError(input.id);
    }

    await this.unitOfMeasureRepository.delete(input.id);
  }
}
