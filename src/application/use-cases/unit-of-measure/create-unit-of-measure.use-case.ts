import { Injectable } from "@nestjs/common";
import { UnitOfMeasureEntity } from "@domain/entities";
import {
  DuplicateUnitOfMeasureAbbreviationError,
  DuplicateUnitOfMeasureNameError,
} from "@domain/errors";
import { UnitOfMeasureRepository } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

export interface CreateUnitOfMeasureInput {
  name: string;
  abbreviation: string;
}

@Injectable()
export class CreateUnitOfMeasureUseCase implements QueryUseCase<
  CreateUnitOfMeasureInput,
  UnitOfMeasureEntity
> {
  constructor(
    private readonly unitOfMeasureRepository: UnitOfMeasureRepository
  ) {}

  async execute(input: CreateUnitOfMeasureInput): Promise<UnitOfMeasureEntity> {
    const existingByName = await this.unitOfMeasureRepository.findByName(
      input.name
    );
    if (existingByName) {
      throw new DuplicateUnitOfMeasureNameError(input.name);
    }

    const existingByAbbreviation =
      await this.unitOfMeasureRepository.findByAbbreviation(input.abbreviation);
    if (existingByAbbreviation) {
      throw new DuplicateUnitOfMeasureAbbreviationError(input.abbreviation);
    }

    return this.unitOfMeasureRepository.create({
      name: input.name,
      abbreviation: input.abbreviation,
    });
  }
}
