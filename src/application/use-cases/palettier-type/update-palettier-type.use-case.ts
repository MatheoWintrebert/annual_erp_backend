import { Injectable } from "@nestjs/common";
import { PalettierTypeEntity } from "@domain/entities";
import { NotFoundError, ValidationError } from "@domain/errors";
import { PalettierTypeRepository } from "@domain/repositories";
import { ErrorCode, QueryUseCase } from "@domain/types";

export interface UpdatePalettierTypeInput {
  id: number;
  name?: string;
  description?: string | null;
}

@Injectable()
export class UpdatePalettierTypeUseCase implements QueryUseCase<
  UpdatePalettierTypeInput,
  PalettierTypeEntity
> {
  constructor(
    private readonly palettierTypeRepository: PalettierTypeRepository
  ) {}

  async execute(input: UpdatePalettierTypeInput): Promise<PalettierTypeEntity> {
    const existingType = await this.palettierTypeRepository.findById(input.id);

    if (!existingType) {
      throw new NotFoundError(`Palettier type with ID ${String(input.id)}`);
    }

    if (input.name !== undefined && input.name !== existingType.name) {
      const typeWithSameName = await this.palettierTypeRepository.findByName(
        input.name
      );

      if (typeWithSameName && typeWithSameName.id !== input.id) {
        throw new ValidationError(
          `Palettier type with name "${input.name}" already exists`,
          {
            code: ErrorCode.DTO_VALIDATION_FAILED,
            details: {
              field: "name",
              existingId: typeWithSameName.id,
            },
          }
        );
      }
    }

    return this.palettierTypeRepository.update(input.id, {
      name: input.name,
      description: input.description,
    });
  }
}
