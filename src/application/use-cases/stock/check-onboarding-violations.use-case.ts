import { Injectable } from "@nestjs/common";
import { PlacementEngineService } from "@domain/services/placement-engine.service";
import { PalettierRepository } from "@domain/repositories";
import { PalettierNotFoundError } from "@domain/errors";
import { PlacementViolationWarning, QueryUseCase } from "@domain/types";
import { ValidationError } from "@domain/errors";

export interface CheckOnboardingViolationsInput {
  productIds: number[];
  palettierId: number;
}

@Injectable()
export class CheckOnboardingViolationsUseCase implements QueryUseCase<
  CheckOnboardingViolationsInput,
  PlacementViolationWarning[]
> {
  constructor(
    private readonly placementEngineService: PlacementEngineService,
    private readonly palettierRepository: PalettierRepository
  ) {}

  async execute(
    input: CheckOnboardingViolationsInput
  ): Promise<PlacementViolationWarning[]> {
    if (input.productIds.length === 0) {
      throw new ValidationError("productIds must not be empty");
    }

    const palettier = await this.palettierRepository.findById(
      input.palettierId
    );
    if (!palettier) {
      throw new PalettierNotFoundError(input.palettierId);
    }

    return this.placementEngineService.checkViolationsForPalettier(
      input.productIds,
      input.palettierId
    );
  }
}
