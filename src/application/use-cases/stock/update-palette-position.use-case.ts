import { Injectable } from "@nestjs/common";
import { PaletteRepository } from "@domain/repositories";
import { PalettierRepository } from "@domain/repositories";
import { CommandUseCase } from "@domain/types";
import {
  PaletteNotFoundError,
  PalettierNotFoundError,
  PositionOutOfBoundsError,
  PositionOccupiedError,
} from "@domain/errors";

export interface UpdatePalettePositionInput {
  paletteId: number;
  palettierId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
}

@Injectable()
export class UpdatePalettePositionUseCase
  implements CommandUseCase<UpdatePalettePositionInput>
{
  constructor(
    private readonly paletteRepository: PaletteRepository,
    private readonly palettierRepository: PalettierRepository,
  ) {}

  async execute(input: UpdatePalettePositionInput): Promise<void> {
    const { paletteId, palettierId, positionX, positionY, positionZ } = input;

    // 1. Palette exists?
    const palette = await this.paletteRepository.findById(paletteId);
    if (!palette) {
      throw new PaletteNotFoundError(paletteId);
    }

    // 2. Target palettier exists?
    const palettier = await this.palettierRepository.findById(palettierId);
    if (!palettier) {
      throw new PalettierNotFoundError(palettierId);
    }

    // 3. Position in bounds?
    if (
      positionX < 0 ||
      positionY < 0 ||
      positionZ < 0 ||
      positionX >= palettier.width ||
      positionY >= palettier.depth ||
      positionZ >= palettier.height
    ) {
      throw new PositionOutOfBoundsError(
        palettierId,
        positionX,
        positionY,
        positionZ,
        palettier.width,
        palettier.depth,
        palettier.height,
      );
    }

    // 4. Position available? (same palette occupying its own spot is OK)
    const occupant = await this.paletteRepository.findByPalettierIdAndPosition(
      palettierId,
      positionX,
      positionY,
      positionZ,
    );
    if (occupant && occupant.id !== paletteId) {
      throw new PositionOccupiedError(palettierId, positionX, positionY, positionZ);
    }

    // 5. Update position
    await this.paletteRepository.updatePosition(
      paletteId,
      palettierId,
      positionX,
      positionY,
      positionZ,
    );
  }
}
