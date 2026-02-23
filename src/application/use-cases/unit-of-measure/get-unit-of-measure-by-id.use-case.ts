import { Injectable } from "@nestjs/common";
import { UnitOfMeasureEntity } from "@domain/entities";
import { UnitOfMeasureNotFoundError } from "@domain/errors";
import { UnitOfMeasureRepository } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

export interface GetUnitOfMeasureByIdInput {
  id: number;
}

@Injectable()
export class GetUnitOfMeasureByIdUseCase implements QueryUseCase<
  GetUnitOfMeasureByIdInput,
  UnitOfMeasureEntity
> {
  constructor(
    private readonly unitOfMeasureRepository: UnitOfMeasureRepository
  ) {}

  async execute(
    input: GetUnitOfMeasureByIdInput
  ): Promise<UnitOfMeasureEntity> {
    const unitOfMeasure = await this.unitOfMeasureRepository.findById(input.id);

    if (!unitOfMeasure) {
      throw new UnitOfMeasureNotFoundError(input.id);
    }

    return unitOfMeasure;
  }
}
