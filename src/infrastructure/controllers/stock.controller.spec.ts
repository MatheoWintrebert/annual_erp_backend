import { Test, TestingModule } from "@nestjs/testing";
import { StockController } from "./stock.controller";
import {
  GetPalettesUseCase,
  GetPaletteViolationsUseCase,
  CheckOnboardingViolationsUseCase,
  UpdatePalettePositionUseCase,
} from "@application/use-cases/stock";
import { DeletePaletteUseCase } from "@application/use-cases/stock/delete-palette.use-case";
import type { RuleViolation } from "@domain/types";

describe("StockController", () => {
  let controller: StockController;
  let getPalettesExecuteMock: jest.Mock;
  let getViolationsExecuteMock: jest.Mock;
  let checkOnboardingViolationsExecuteMock: jest.Mock;
  let updatePositionExecuteMock: jest.Mock;

  beforeEach(async () => {
    getPalettesExecuteMock = jest.fn();
    getViolationsExecuteMock = jest.fn();
    checkOnboardingViolationsExecuteMock = jest.fn();
    updatePositionExecuteMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        {
          provide: GetPalettesUseCase,
          useValue: { execute: getPalettesExecuteMock },
        },
        {
          provide: GetPaletteViolationsUseCase,
          useValue: { execute: getViolationsExecuteMock },
        },
        {
          provide: CheckOnboardingViolationsUseCase,
          useValue: { execute: checkOnboardingViolationsExecuteMock },
        },
        {
          provide: UpdatePalettePositionUseCase,
          useValue: { execute: updatePositionExecuteMock },
        },
        {
          provide: DeletePaletteUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<StockController>(StockController);
  });

  describe("getViolations", () => {
    const mockViolations: RuleViolation[] = [
      {
        paletteId: 1,
        palettierName: "Cold Storage A",
        positionX: 1,
        positionY: 2,
        positionZ: 0,
        productName: "Whole Milk",
        ruleName: "Ground Only",
        ruleType: "placement_constraint",
        violationReason:
          "Palette must be on ground level (position Z=0), currently at Z=2",
      },
      {
        paletteId: 3,
        palettierName: "Dry Storage B",
        positionX: 0,
        positionY: 0,
        positionZ: 1,
        productName: "Frozen Fish",
        ruleName: "Cold Storage Required",
        ruleType: "storage_condition",
        violationReason: "Product requires cold storage",
      },
    ];

    it("should return violation response DTOs mapped from domain", async () => {
      getViolationsExecuteMock.mockResolvedValue(mockViolations);

      const result = await controller.getViolations();

      expect(result).toHaveLength(2);
      expect(result[0].paletteId).toBe(1);
      expect(result[0].palettierName).toBe("Cold Storage A");
      expect(result[0].positionX).toBe(1);
      expect(result[0].positionY).toBe(2);
      expect(result[0].positionZ).toBe(0);
      expect(result[0].productName).toBe("Whole Milk");
      expect(result[0].ruleName).toBe("Ground Only");
      expect(result[0].ruleType).toBe("placement_constraint");
      expect(result[0].violationReason).toContain("ground level");
      expect(result[1].paletteId).toBe(3);
      expect(getViolationsExecuteMock).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no violations", async () => {
      getViolationsExecuteMock.mockResolvedValue([]);

      const result = await controller.getViolations();

      expect(result).toEqual([]);
      expect(getViolationsExecuteMock).toHaveBeenCalledTimes(1);
    });

    it("should propagate errors from use case", async () => {
      getViolationsExecuteMock.mockRejectedValue(
        new Error("Database connection lost")
      );

      await expect(controller.getViolations()).rejects.toThrow(
        "Database connection lost"
      );
    });
  });
});
