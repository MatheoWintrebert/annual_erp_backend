import { Test, TestingModule } from "@nestjs/testing";
import {
  RuleViolationDetectorService,
  PaletteForViolationCheck,
} from "./rule-violation-detector.service";
import { RuleRepository, RuleWithConfig } from "@domain/repositories";
import { RuleEntity } from "@domain/entities";
import {
  PlacementConstraintType,
  RuleType,
  SelectionMode,
} from "@domain/types";

describe("RuleViolationDetectorService", () => {
  let service: RuleViolationDetectorService;
  let findByIdMock: jest.Mock;
  let findPalettesForViolationCheckMock: jest.Mock;

  const mockDate = new Date("2024-01-15T10:30:00.000Z");

  const createMockRule = (
    id: number,
    type: RuleType,
    isActive = true
  ): RuleEntity =>
    new RuleEntity({
      id,
      name: `Rule ${String(id)}`,
      description: null,
      type,
      isActive,
      createdAt: mockDate,
      updatedAt: mockDate,
      deletedAt: null,
    });

  const createMockPalette = (
    overrides: Partial<PaletteForViolationCheck> = {}
  ): PaletteForViolationCheck => ({
    paletteId: 1,
    palettierName: "Rack A1",
    palettierTypeId: 1,
    palettierId: 10,
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    productName: "Product A",
    ...overrides,
  });

  beforeEach(async () => {
    findByIdMock = jest.fn();
    findPalettesForViolationCheckMock = jest.fn();

    const mockRepository = {
      findById: findByIdMock,
      findAll: jest.fn(),
      createBatch: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      linkProducts: jest.fn(),
      unlinkProducts: jest.fn(),
      validatePalettierIds: jest.fn(),
      validateProductIds: jest.fn(),
      validatePalettierTypeId: jest.fn(),
      findPalettesForViolationCheck: findPalettesForViolationCheckMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RuleViolationDetectorService,
        {
          provide: RuleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RuleViolationDetectorService>(
      RuleViolationDetectorService
    );
  });

  describe("detectViolations", () => {
    it("should return empty array when rule is not found", async () => {
      findByIdMock.mockResolvedValue(null);

      const result = await service.detectViolations(999);

      expect(result).toEqual([]);
      expect(findPalettesForViolationCheckMock).not.toHaveBeenCalled();
    });

    it("should return empty array when rule is inactive", async () => {
      const rule = createMockRule(1, RuleType.STORAGE_CONDITION, false);
      findByIdMock.mockResolvedValue({ rule } satisfies RuleWithConfig);

      const result = await service.detectViolations(1);

      expect(result).toEqual([]);
      expect(findPalettesForViolationCheckMock).not.toHaveBeenCalled();
    });

    it("should return empty array when no palettes are affected", async () => {
      const rule = createMockRule(1, RuleType.STORAGE_CONDITION);
      const ruleWithConfig: RuleWithConfig = {
        rule,
        storageConditionConfig: {
          id: 1,
          ruleId: 1,
          conditionType: "refrigerated",
          selectionMode: SelectionMode.PALETTIER_TYPE,
          palettierTypeId: 2,
          palettierIds: [],
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      };
      findByIdMock.mockResolvedValue(ruleWithConfig);
      findPalettesForViolationCheckMock.mockResolvedValue([]);

      const result = await service.detectViolations(1);

      expect(result).toEqual([]);
    });
  });

  describe("storage_condition violations", () => {
    it("should detect palettier type mismatch", async () => {
      const rule = createMockRule(1, RuleType.STORAGE_CONDITION);
      const ruleWithConfig: RuleWithConfig = {
        rule,
        storageConditionConfig: {
          id: 1,
          ruleId: 1,
          conditionType: "refrigerated",
          selectionMode: SelectionMode.PALETTIER_TYPE,
          palettierTypeId: 2,
          palettierIds: [],
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      };
      findByIdMock.mockResolvedValue(ruleWithConfig);

      const palette = createMockPalette({ palettierTypeId: 1 });
      findPalettesForViolationCheckMock.mockResolvedValue([palette]);

      const result = await service.detectViolations(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        paletteId: 1,
        palettierName: "Rack A1",
        productName: "Product A",
        ruleName: "Rule 1",
        ruleType: RuleType.STORAGE_CONDITION,
      });
      expect(result[0].violationReason).toContain("wrong type");
    });

    it("should not flag palette when palettier type matches", async () => {
      const rule = createMockRule(1, RuleType.STORAGE_CONDITION);
      const ruleWithConfig: RuleWithConfig = {
        rule,
        storageConditionConfig: {
          id: 1,
          ruleId: 1,
          conditionType: "refrigerated",
          selectionMode: SelectionMode.PALETTIER_TYPE,
          palettierTypeId: 2,
          palettierIds: [],
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      };
      findByIdMock.mockResolvedValue(ruleWithConfig);

      const palette = createMockPalette({ palettierTypeId: 2 });
      findPalettesForViolationCheckMock.mockResolvedValue([palette]);

      const result = await service.detectViolations(1);

      expect(result).toHaveLength(0);
    });

    it("should detect palette not in allowed specific palettiers", async () => {
      const rule = createMockRule(1, RuleType.STORAGE_CONDITION);
      const ruleWithConfig: RuleWithConfig = {
        rule,
        storageConditionConfig: {
          id: 1,
          ruleId: 1,
          conditionType: "frozen",
          selectionMode: SelectionMode.SPECIFIC_PALETTIER,
          palettierTypeId: null,
          palettierIds: [10, 20],
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      };
      findByIdMock.mockResolvedValue(ruleWithConfig);

      const palette = createMockPalette({ palettierId: 30 });
      findPalettesForViolationCheckMock.mockResolvedValue([palette]);

      const result = await service.detectViolations(1);

      expect(result).toHaveLength(1);
      expect(result[0].violationReason).toContain(
        "not in an allowed palettier"
      );
    });

    it("should not flag palette in allowed specific palettiers", async () => {
      const rule = createMockRule(1, RuleType.STORAGE_CONDITION);
      const ruleWithConfig: RuleWithConfig = {
        rule,
        storageConditionConfig: {
          id: 1,
          ruleId: 1,
          conditionType: "frozen",
          selectionMode: SelectionMode.SPECIFIC_PALETTIER,
          palettierTypeId: null,
          palettierIds: [10, 20],
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      };
      findByIdMock.mockResolvedValue(ruleWithConfig);

      const palette = createMockPalette({ palettierId: 10 });
      findPalettesForViolationCheckMock.mockResolvedValue([palette]);

      const result = await service.detectViolations(1);

      expect(result).toHaveLength(0);
    });

    it("should return empty when no storage condition config exists", async () => {
      const rule = createMockRule(1, RuleType.STORAGE_CONDITION);
      findByIdMock.mockResolvedValue({ rule } satisfies RuleWithConfig);

      const palette = createMockPalette();
      findPalettesForViolationCheckMock.mockResolvedValue([palette]);

      const result = await service.detectViolations(1);

      expect(result).toHaveLength(0);
    });
  });

  describe("placement_constraint violations", () => {
    it("should detect ground_only violation when palette is not at Z=0", async () => {
      const rule = createMockRule(1, RuleType.PLACEMENT_CONSTRAINT);
      const ruleWithConfig: RuleWithConfig = {
        rule,
        placementConstraintConfig: {
          id: 1,
          ruleId: 1,
          constraintType: PlacementConstraintType.GROUND_ONLY,
          maxHeight: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      };
      findByIdMock.mockResolvedValue(ruleWithConfig);

      const palette = createMockPalette({ positionZ: 2 });
      findPalettesForViolationCheckMock.mockResolvedValue([palette]);

      const result = await service.detectViolations(1);

      expect(result).toHaveLength(1);
      expect(result[0].violationReason).toContain("ground level");
      expect(result[0].violationReason).toContain("Z=2");
    });

    it("should not flag palette at Z=0 for ground_only", async () => {
      const rule = createMockRule(1, RuleType.PLACEMENT_CONSTRAINT);
      const ruleWithConfig: RuleWithConfig = {
        rule,
        placementConstraintConfig: {
          id: 1,
          ruleId: 1,
          constraintType: PlacementConstraintType.GROUND_ONLY,
          maxHeight: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      };
      findByIdMock.mockResolvedValue(ruleWithConfig);

      const palette = createMockPalette({ positionZ: 0 });
      findPalettesForViolationCheckMock.mockResolvedValue([palette]);

      const result = await service.detectViolations(1);

      expect(result).toHaveLength(0);
    });

    it("should detect max_height violation", async () => {
      const rule = createMockRule(1, RuleType.PLACEMENT_CONSTRAINT);
      const ruleWithConfig: RuleWithConfig = {
        rule,
        placementConstraintConfig: {
          id: 1,
          ruleId: 1,
          constraintType: PlacementConstraintType.MAX_HEIGHT,
          maxHeight: 3,
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      };
      findByIdMock.mockResolvedValue(ruleWithConfig);

      const palette = createMockPalette({ positionZ: 5 });
      findPalettesForViolationCheckMock.mockResolvedValue([palette]);

      const result = await service.detectViolations(1);

      expect(result).toHaveLength(1);
      expect(result[0].violationReason).toContain("exceeds maximum height");
      expect(result[0].violationReason).toContain("max Z=3");
      expect(result[0].violationReason).toContain("Z=5");
    });

    it("should not flag palette at exactly max height", async () => {
      const rule = createMockRule(1, RuleType.PLACEMENT_CONSTRAINT);
      const ruleWithConfig: RuleWithConfig = {
        rule,
        placementConstraintConfig: {
          id: 1,
          ruleId: 1,
          constraintType: PlacementConstraintType.MAX_HEIGHT,
          maxHeight: 3,
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      };
      findByIdMock.mockResolvedValue(ruleWithConfig);

      const palette = createMockPalette({ positionZ: 3 });
      findPalettesForViolationCheckMock.mockResolvedValue([palette]);

      const result = await service.detectViolations(1);

      expect(result).toHaveLength(0);
    });

    it("should not flag palette below max height", async () => {
      const rule = createMockRule(1, RuleType.PLACEMENT_CONSTRAINT);
      const ruleWithConfig: RuleWithConfig = {
        rule,
        placementConstraintConfig: {
          id: 1,
          ruleId: 1,
          constraintType: PlacementConstraintType.MAX_HEIGHT,
          maxHeight: 3,
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      };
      findByIdMock.mockResolvedValue(ruleWithConfig);

      const palette = createMockPalette({ positionZ: 1 });
      findPalettesForViolationCheckMock.mockResolvedValue([palette]);

      const result = await service.detectViolations(1);

      expect(result).toHaveLength(0);
    });
  });

  describe("zone_priority violations", () => {
    it("should detect palette not in priority zone", async () => {
      const rule = createMockRule(1, RuleType.ZONE_PRIORITY);
      const ruleWithConfig: RuleWithConfig = {
        rule,
        zonePriorityConfig: {
          id: 1,
          ruleId: 1,
          priorityLevel: 1,
          palettierIds: [10, 20],
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      };
      findByIdMock.mockResolvedValue(ruleWithConfig);

      const palette = createMockPalette({ palettierId: 30 });
      findPalettesForViolationCheckMock.mockResolvedValue([palette]);

      const result = await service.detectViolations(1);

      expect(result).toHaveLength(1);
      expect(result[0].violationReason).toContain("advisory");
    });

    it("should not flag palette in priority zone", async () => {
      const rule = createMockRule(1, RuleType.ZONE_PRIORITY);
      const ruleWithConfig: RuleWithConfig = {
        rule,
        zonePriorityConfig: {
          id: 1,
          ruleId: 1,
          priorityLevel: 1,
          palettierIds: [10, 20],
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      };
      findByIdMock.mockResolvedValue(ruleWithConfig);

      const palette = createMockPalette({ palettierId: 10 });
      findPalettesForViolationCheckMock.mockResolvedValue([palette]);

      const result = await service.detectViolations(1);

      expect(result).toHaveLength(0);
    });
  });

  describe("product_incompatibility violations", () => {
    it("should flag all palettes returned by repository as violations", async () => {
      const rule = createMockRule(1, RuleType.PRODUCT_INCOMPATIBILITY);
      const ruleWithConfig: RuleWithConfig = {
        rule,
        productIncompatibilityConfig: {
          id: 1,
          ruleId: 1,
          categoryId: 5,
          minimumDistance: 2,
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      };
      findByIdMock.mockResolvedValue(ruleWithConfig);

      const palettes = [
        createMockPalette({ paletteId: 1, productName: "Chemical A" }),
        createMockPalette({ paletteId: 2, productName: "Chemical B" }),
      ];
      findPalettesForViolationCheckMock.mockResolvedValue(palettes);

      const result = await service.detectViolations(1);

      expect(result).toHaveLength(2);
      expect(result[0].violationReason).toContain("incompatible");
      expect(result[1].violationReason).toContain("incompatible");
    });
  });

  describe("multiple palettes", () => {
    it("should detect violations for some palettes and not others", async () => {
      const rule = createMockRule(1, RuleType.PLACEMENT_CONSTRAINT);
      const ruleWithConfig: RuleWithConfig = {
        rule,
        placementConstraintConfig: {
          id: 1,
          ruleId: 1,
          constraintType: PlacementConstraintType.MAX_HEIGHT,
          maxHeight: 2,
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      };
      findByIdMock.mockResolvedValue(ruleWithConfig);

      const palettes = [
        createMockPalette({ paletteId: 1, positionZ: 0 }),
        createMockPalette({ paletteId: 2, positionZ: 3 }),
        createMockPalette({ paletteId: 3, positionZ: 1 }),
        createMockPalette({ paletteId: 4, positionZ: 5 }),
      ];
      findPalettesForViolationCheckMock.mockResolvedValue(palettes);

      const result = await service.detectViolations(1);

      expect(result).toHaveLength(2);
      expect(result.map((v) => v.paletteId)).toEqual([2, 4]);
    });
  });
});
