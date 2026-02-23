import { Injectable } from "@nestjs/common";
import { UnitOfMeasureEntity } from "@domain/entities";
import {
  DuplicateUnitOfMeasureAbbreviationError,
  DuplicateUnitOfMeasureNameError,
  UnitOfMeasureNotFoundError,
} from "@domain/errors";
import { UnitOfMeasureRepository } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

export interface UpdateUnitOfMeasureInput {
  id: number;
  name?: string;
  abbreviation?: string;
}

@Injectable()
export class UpdateUnitOfMeasureUseCase implements QueryUseCase<
  UpdateUnitOfMeasureInput,
  UnitOfMeasureEntity
> {
  constructor(
    private readonly unitOfMeasureRepository: UnitOfMeasureRepository
  ) {}

  async execute(input: UpdateUnitOfMeasureInput): Promise<UnitOfMeasureEntity> {
    const existing = await this.unitOfMeasureRepository.findById(input.id);
    if (!existing) {
      throw new UnitOfMeasureNotFoundError(input.id);
    }

    if (input.name !== undefined && input.name !== existing.name) {
      const duplicate = await this.unitOfMeasureRepository.findByName(
        input.name
      );
      if (duplicate) {
        throw new DuplicateUnitOfMeasureNameError(input.name);
      }
    }

    if (
      input.abbreviation !== undefined &&
      input.abbreviation !== existing.abbreviation
    ) {
      const duplicate = await this.unitOfMeasureRepository.findByAbbreviation(
        input.abbreviation
      );
      if (duplicate) {
        throw new DuplicateUnitOfMeasureAbbreviationError(input.abbreviation);
      }
    }

    return this.unitOfMeasureRepository.update(input.id, {
      name: input.name,
      abbreviation: input.abbreviation,
    });
  }
}
