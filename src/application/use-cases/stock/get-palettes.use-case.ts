import { Injectable } from "@nestjs/common";
import { PaletteRepository } from "@domain/repositories";
import { PaletteWithDetails, QueryUseCase } from "@domain/types";

export interface GetPalettesInput {
  palettierId?: number;
  search?: string;
}

function escapeLikeInput(input: string): string {
  return input.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

@Injectable()
export class GetPalettesUseCase implements QueryUseCase<
  GetPalettesInput,
  PaletteWithDetails[]
> {
  constructor(private readonly paletteRepository: PaletteRepository) {}

  async execute(input: GetPalettesInput): Promise<PaletteWithDetails[]> {
    return this.paletteRepository.findAllWithDetails({
      palettierId: input.palettierId,
      productSearch: input.search ? escapeLikeInput(input.search) : undefined,
    });
  }
}
