import {
  CheckOnboardingViolationsUseCase,
  CheckOnboardingViolationsInput,
} from "./check-onboarding-violations.use-case";
import { PlacementEngineService } from "@domain/services/placement-engine.service";
import { PalettierRepository } from "@domain/repositories";
import { PalettierEntity } from "@domain/entities";
import { PalettierNotFoundError } from "@domain/errors";
import { ValidationError } from "@domain/errors";
import { PlacementViolationWarning, RuleType } from "@domain/types";

describe("CheckOnboardingViolationsUseCase", () => {
  let useCase: CheckOnboardingViolationsUseCase;
  let placementEngineService: jest.Mocked<
    Pick<PlacementEngineService, "checkViolationsForPalettier">
  >;
  let palettierRepository: jest.Mocked<Pick<PalettierRepository, "findById">>;

  const mockPalettier = new PalettierEntity({
    id: 3,
    palettierTypeId: 1,
    name: "Cold Storage A",
    width: 3,
    depth: 2,
    height: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  beforeEach(() => {
    placementEngineService = {
      checkViolationsForPalettier: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<
      Pick<PlacementEngineService, "checkViolationsForPalettier">
    >;

    palettierRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<Pick<PalettierRepository, "findById">>;

    useCase = new CheckOnboardingViolationsUseCase(
      placementEngineService as unknown as PlacementEngineService,
      palettierRepository as unknown as PalettierRepository
    );
  });

  it("should return violations from PlacementEngineService", async () => {
    const violations: PlacementViolationWarning[] = [
      {
        ruleName: "Cold Storage Required",
        ruleType: RuleType.STORAGE_CONDITION,
        reason:
          'Storage condition "Cold Storage Required" is not satisfied by palettier "Dry Storage B"',
      },
    ];

    palettierRepository.findById.mockResolvedValue(mockPalettier);
    placementEngineService.checkViolationsForPalettier.mockResolvedValue(
      violations
    );

    const input: CheckOnboardingViolationsInput = {
      productIds: [1, 5],
      palettierId: 3,
    };

    const result = await useCase.execute(input);

    expect(result).toEqual(violations);
    expect(
      placementEngineService.checkViolationsForPalettier
    ).toHaveBeenCalledWith([1, 5], 3);
  });

  it("should return empty array when no violations exist", async () => {
    palettierRepository.findById.mockResolvedValue(mockPalettier);
    placementEngineService.checkViolationsForPalettier.mockResolvedValue([]);

    const result = await useCase.execute({
      productIds: [1],
      palettierId: 3,
    });

    expect(result).toEqual([]);
  });

  it("should throw PalettierNotFoundError when palettier does not exist", async () => {
    palettierRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        productIds: [1],
        palettierId: 999,
      })
    ).rejects.toThrow(PalettierNotFoundError);

    expect(
      placementEngineService.checkViolationsForPalettier
    ).not.toHaveBeenCalled();
  });

  it("should throw ValidationError when productIds is empty", async () => {
    await expect(
      useCase.execute({
        productIds: [],
        palettierId: 3,
      })
    ).rejects.toThrow(ValidationError);

    expect(palettierRepository.findById).not.toHaveBeenCalled();
    expect(
      placementEngineService.checkViolationsForPalettier
    ).not.toHaveBeenCalled();
  });
});
