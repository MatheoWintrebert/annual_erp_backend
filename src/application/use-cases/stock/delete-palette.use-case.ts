import { Injectable } from "@nestjs/common";
import { PaletteRepository } from "@domain/repositories";
import { CommandUseCase } from "@domain/types";

export interface DeletePaletteInput {
  paletteId: number;
}

@Injectable()
export class DeletePaletteUseCase implements CommandUseCase<DeletePaletteInput> {
  constructor(private readonly paletteRepository: PaletteRepository) {}

  async execute(input: DeletePaletteInput): Promise<void> {
    await this.paletteRepository.delete(input.paletteId);
  }
}
