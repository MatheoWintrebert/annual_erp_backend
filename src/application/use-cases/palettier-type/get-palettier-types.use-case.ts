import { Injectable } from "@nestjs/common";
import { PalettierTypeEntity } from "@domain/entities";
import { PalettierTypeRepository } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

@Injectable()
export class GetPalettierTypesUseCase implements QueryUseCase<
  void,
  PalettierTypeEntity[]
> {
  constructor(
    private readonly palettierTypeRepository: PalettierTypeRepository
  ) {}

  async execute(): Promise<PalettierTypeEntity[]> {
    return this.palettierTypeRepository.findAll();
  }
}
