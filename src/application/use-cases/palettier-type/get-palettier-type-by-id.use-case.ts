import { Injectable } from "@nestjs/common";
import { PalettierTypeEntity } from "@domain/entities";
import { NotFoundError } from "@domain/errors";
import { PalettierTypeRepository } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

export interface GetPalettierTypeByIdInput {
  id: number;
}

@Injectable()
export class GetPalettierTypeByIdUseCase implements QueryUseCase<
  GetPalettierTypeByIdInput,
  PalettierTypeEntity
> {
  constructor(
    private readonly palettierTypeRepository: PalettierTypeRepository
  ) {}

  async execute(
    input: GetPalettierTypeByIdInput
  ): Promise<PalettierTypeEntity> {
    const palettierType = await this.palettierTypeRepository.findById(input.id);

    if (!palettierType) {
      throw new NotFoundError(`Palettier type with ID ${String(input.id)}`);
    }

    return palettierType;
  }
}
