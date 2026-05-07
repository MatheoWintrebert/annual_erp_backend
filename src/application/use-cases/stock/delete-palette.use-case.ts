import { Injectable } from "@nestjs/common";
import { PaletteRepository } from "@domain/repositories";
import { CommandUseCase } from "@domain/types";
import { PaletteNotFoundError } from "@domain/errors";

export interface DeletePaletteInput {
  paletteId: number;
}

@Injectable()
export class DeletePaletteUseCase implements CommandUseCase<DeletePaletteInput> {
  constructor(private readonly paletteRepository: PaletteRepository) {}

  async execute(input: DeletePaletteInput): Promise<void> {
    const palette = await this.paletteRepository.findById(input.paletteId);
    if (!palette) {
      throw new PaletteNotFoundError(input.paletteId);
    }

    await this.paletteRepository.delete(input.paletteId);
  }
}
