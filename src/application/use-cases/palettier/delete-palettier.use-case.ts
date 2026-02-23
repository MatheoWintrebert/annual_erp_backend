import { Injectable } from "@nestjs/common";
import { NotFoundError, ValidationError } from "@domain/errors";
import { PalettierRepository } from "@domain/repositories";
import { CommandUseCase, ErrorCode } from "@domain/types";

export interface DeletePalettierInput {
  id: number;
}

@Injectable()
export class DeletePalettierUseCase implements CommandUseCase<DeletePalettierInput> {
  constructor(private readonly palettierRepository: PalettierRepository) {}

  async execute(input: DeletePalettierInput): Promise<void> {
    const palettier = await this.palettierRepository.findById(input.id);

    if (!palettier) {
      throw new NotFoundError(`Palettier with ID ${String(input.id)}`);
    }

    const paletteCount =
      await this.palettierRepository.countPalettesByPalettierId(input.id);

    if (paletteCount > 0) {
      throw new ValidationError(
        `Cannot delete palettier "${palettier.name}" because it contains ${String(paletteCount)} palette${paletteCount !== 1 ? "s" : ""}`,
        {
          code: ErrorCode.DELETION_BLOCKED_PALETTES_EXIST,
          details: {
            palettierName: palettier.name,
            paletteCount,
          },
        }
      );
    }

    await this.palettierRepository.delete(input.id);
  }
}
