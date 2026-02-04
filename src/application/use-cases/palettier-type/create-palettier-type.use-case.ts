import { Injectable } from "@nestjs/common";
import { PalettierTypeEntity } from "@domain/entities";
import { ValidationError } from "@domain/errors";
import { PalettierTypeRepository } from "@domain/repositories";
import { ErrorCode, QueryUseCase } from "@domain/types";

export interface CreatePalettierTypeInput {
  name: string;
  description?: string;
}

@Injectable()
export class CreatePalettierTypeUseCase implements QueryUseCase<
  CreatePalettierTypeInput,
  PalettierTypeEntity
> {
  constructor(
    private readonly palettierTypeRepository: PalettierTypeRepository
  ) {}

  async execute(input: CreatePalettierTypeInput): Promise<PalettierTypeEntity> {
    const existingType = await this.palettierTypeRepository.findByName(
      input.name
    );

    if (existingType) {
      throw new ValidationError(
        `Palettier type with name "${input.name}" already exists`,
        {
          code: ErrorCode.DTO_VALIDATION_FAILED,
          details: {
            field: "name",
            existingId: existingType.id,
          },
        }
      );
    }

    return this.palettierTypeRepository.create({
      name: input.name,
      description: input.description ?? null,
    });
  }
}
