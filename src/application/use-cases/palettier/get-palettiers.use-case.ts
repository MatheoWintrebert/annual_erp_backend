import { Injectable } from "@nestjs/common";
import { PalettierEntity } from "@domain/entities";
import { PalettierRepository } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

@Injectable()
export class GetPalettiersUseCase implements QueryUseCase<
  void,
  PalettierEntity[]
> {
  constructor(private readonly palettierRepository: PalettierRepository) {}

  async execute(): Promise<PalettierEntity[]> {
    return this.palettierRepository.findAll();
  }
}
