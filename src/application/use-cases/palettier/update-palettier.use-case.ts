import { Injectable } from "@nestjs/common";
import { PalettierEntity } from "@domain/entities";
import { NotFoundError } from "@domain/errors";
import {
  PalettierRepository,
  PalettierTypeRepository,
} from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

export interface UpdatePalettierInput {
  id: number;
  name?: string;
  palettierTypeId?: number | null;
  width?: number;
  depth?: number;
  height?: number;
}

@Injectable()
export class UpdatePalettierUseCase implements QueryUseCase<
  UpdatePalettierInput,
  PalettierEntity
> {
  constructor(
    private readonly palettierRepository: PalettierRepository,
    private readonly palettierTypeRepository: PalettierTypeRepository
  ) {}

  async execute(input: UpdatePalettierInput): Promise<PalettierEntity> {
    const existingPalettier = await this.palettierRepository.findById(input.id);

    if (!existingPalettier) {
      throw new NotFoundError(`Palettier with ID ${String(input.id)}`);
    }

    if (input.palettierTypeId !== undefined && input.palettierTypeId !== null) {
      const palettierType = await this.palettierTypeRepository.findById(
        input.palettierTypeId
      );

      if (!palettierType) {
        throw new NotFoundError(
          `Palettier type with ID ${String(input.palettierTypeId)}`
        );
      }
    }

    return this.palettierRepository.update(input.id, {
      name: input.name,
      palettierTypeId: input.palettierTypeId,
      width: input.width,
      depth: input.depth,
      height: input.height,
    });
  }
}
