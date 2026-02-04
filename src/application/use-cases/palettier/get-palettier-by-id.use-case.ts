import { Injectable } from "@nestjs/common";
import { PalettierEntity } from "@domain/entities";
import { NotFoundError } from "@domain/errors";
import { PalettierRepository } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

export interface GetPalettierByIdInput {
  id: number;
}

@Injectable()
export class GetPalettierByIdUseCase implements QueryUseCase<
  GetPalettierByIdInput,
  PalettierEntity
> {
  constructor(private readonly palettierRepository: PalettierRepository) {}

  async execute(input: GetPalettierByIdInput): Promise<PalettierEntity> {
    const palettier = await this.palettierRepository.findById(input.id);

    if (!palettier) {
      throw new NotFoundError(`Palettier with ID ${String(input.id)}`);
    }

    return palettier;
  }
}
