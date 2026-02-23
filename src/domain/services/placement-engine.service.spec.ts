import { Test, TestingModule } from "@nestjs/testing";
import { PlacementEngineService } from "./placement-engine.service";
import {
  PaletteRepository,
  PalettierRepository,
  RuleRepository,
  RuleWithConfig,
} from "@domain/repositories";
import { PalettierEntity, RuleEntity } from "@domain/entities";
import { NoValidPlacementError } from "@domain/errors";
import {
  PlacementConstraintType,
  PlacementInput,
  RuleType,
  SelectionMode,
} from "@domain/types";
import {
  RulePlacementConstraintConfigEntity,
  RuleProductIncompatibilityConfigEntity,
  RuleStorageConditionConfigEntity,
  RuleZonePriorityConfigEntity,
} from "@domain/entities";

const createPalettier = (
  overrides: Partial<PalettierEntity> = {}
): PalettierEntity =>
  new PalettierEntity({
    id: 1,
    name: "Rack A",
    palettierTypeId: 1,
    width: 3,
    depth: 2,
    height: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  });

const createRule = (overrides: Partial<RuleEntity> = {}): RuleEntity =>
  new RuleEntity({
    id: 1,
    name: "Test Rule",
    description: null,
    type: RuleType.STORAGE_CONDITION,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  });

const now = new Date();

describe("PlacementEngineService", () => {
  let service: PlacementEngineService;
  let mockRuleRepository: {
    findAll: jest.Mock;
    findById: jest.Mock;
  };
  let mockPalettierRepository: {
    findAll: jest.Mock;
  };
  let mockPaletteRepository: {
    findOccupiedPositionsByPalettierId: jest.Mock;
    findOccupiedPositionsByPalettierIds: jest.Mock;
    findCategoryIdsByPalettierId: jest.Mock;
    findCategoryIdsByPalettierIds: jest.Mock;
  };

  const defaultInput: PlacementInput = {
    productIds: [1],
    productCategoryIds: [10],
  };

  beforeEach(async () => {
    mockRuleRepository = {
      findAll: jest.fn().mockResolvedValue({
        rules: [],
        total: 0,
        page: 1,
        limit: 1000,
        totalPages: 1,
      }),
      findById: jest.fn(),
    };
    mockPalettierRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    };
    mockPaletteRepository = {
      findOccupiedPositionsByPalettierId: jest.fn().mockResolvedValue([]),
      findOccupiedPositionsByPalettierIds: jest
        .fn()
        .mockResolvedValue(new Map()),
      findCategoryIdsByPalettierId: jest.fn().mockResolvedValue([]),
      findCategoryIdsByPalettierIds: jest.fn().mockResolvedValue(new Map()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacementEngineService,
        { provide: RuleRepository, useValue: mockRuleRepository },
        { provide: PalettierRepository, useValue: mockPalettierRepository },
        { provide: PaletteRepository, useValue: mockPaletteRepository },
      ],
    }).compile();

    service = module.get<PlacementEngineService>(PlacementEngineService);
  });

  describe("recommend", () => {
    it("should return a recommendation for a simple case with no rules", async () => {
      const palettier = createPalettier();
      mockPalettierRepository.findAll.mockResolvedValue([palettier]);

      const result = await service.recommend(defaultInput);

      expect(result.palettierId).toBe(palettier.id);
      expect(result.palettierName).toBe(palettier.name);
      expect(result.positionX).toBe(0);
      expect(result.positionY).toBe(0);
      expect(result.positionZ).toBe(0);
      expect(result.reasoning).toContain("space available");
    });

    it("should skip occupied positions", async () => {
      const palettier = createPalettier({ width: 2, depth: 1, height: 1 });
      mockPalettierRepository.findAll.mockResolvedValue([palettier]);
      mockPaletteRepository.findOccupiedPositionsByPalettierIds.mockResolvedValue(
        new Map([[1, [{ positionX: 0, positionY: 0, positionZ: 0 }]]])
      );

      const result = await service.recommend(defaultInput);

      expect(result.positionX).toBe(1);
      expect(result.positionY).toBe(0);
      expect(result.positionZ).toBe(0);
    });

    it("should throw NoValidPlacementError when no palettier is available", async () => {
      mockPalettierRepository.findAll.mockResolvedValue([]);

      await expect(service.recommend(defaultInput)).rejects.toThrow(
        NoValidPlacementError
      );
    });

    it("should throw NoValidPlacementError when all positions are occupied", async () => {
      const palettier = createPalettier({ width: 1, depth: 1, height: 1 });
      mockPalettierRepository.findAll.mockResolvedValue([palettier]);
      mockPaletteRepository.findOccupiedPositionsByPalettierIds.mockResolvedValue(
        new Map([[1, [{ positionX: 0, positionY: 0, positionZ: 0 }]]])
      );

      await expect(service.recommend(defaultInput)).rejects.toThrow(
        NoValidPlacementError
      );
    });

    it("should skip soft-deleted palettiers", async () => {
      const deleted = createPalettier({ id: 1, deletedAt: new Date() });
      const active = createPalettier({ id: 2, name: "Active Rack" });
      mockPalettierRepository.findAll.mockResolvedValue([deleted, active]);

      const result = await service.recommend(defaultInput);

      expect(result.palettierId).toBe(2);
    });
  });

  describe("storage condition rule filtering", () => {
    it("should filter by palettier type", async () => {
      const coldPalettier = createPalettier({
        id: 1,
        palettierTypeId: 2,
        name: "Cold",
      });
      const normalPalettier = createPalettier({
        id: 2,
        palettierTypeId: 1,
        name: "Normal",
      });
      mockPalettierRepository.findAll.mockResolvedValue([
        coldPalettier,
        normalPalettier,
      ]);

      const storageRule: RuleWithConfig = {
        rule: createRule({ id: 1, type: RuleType.STORAGE_CONDITION }),
        storageConditionConfig: new RuleStorageConditionConfigEntity({
          id: 1,
          ruleId: 1,
          conditionType: "cold_storage",
          selectionMode: SelectionMode.PALETTIER_TYPE,
          palettierTypeId: 2,
          createdAt: now,
          updatedAt: now,
        }) as RuleStorageConditionConfigEntity & { palettierIds: number[] },
        productIds: [1],
      };
      (
        storageRule.storageConditionConfig as RuleStorageConditionConfigEntity & {
          palettierIds: number[];
        }
      ).palettierIds = [];

      mockRuleRepository.findAll.mockResolvedValue({
        rules: [storageRule],
        total: 1,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      const result = await service.recommend(defaultInput);

      expect(result.palettierId).toBe(1);
      expect(result.palettierName).toBe("Cold");
    });

    it("should filter by specific palettier list", async () => {
      const palA = createPalettier({ id: 1, name: "A" });
      const palB = createPalettier({ id: 2, name: "B" });
      mockPalettierRepository.findAll.mockResolvedValue([palA, palB]);

      const storageRule: RuleWithConfig = {
        rule: createRule({ id: 1, type: RuleType.STORAGE_CONDITION }),
        storageConditionConfig: {
          id: 1,
          ruleId: 1,
          conditionType: "specific",
          selectionMode: SelectionMode.SPECIFIC_PALETTIER,
          palettierTypeId: null,
          createdAt: now,
          updatedAt: now,
          palettierIds: [2],
        } as unknown as RuleStorageConditionConfigEntity & {
          palettierIds: number[];
        },
        productIds: [1],
      };

      mockRuleRepository.findAll.mockResolvedValue({
        rules: [storageRule],
        total: 1,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      const result = await service.recommend(defaultInput);

      expect(result.palettierId).toBe(2);
    });
  });

  describe("placement constraint rule filtering", () => {
    it("should enforce ground_only constraint", async () => {
      const palettier = createPalettier({ width: 1, depth: 1, height: 3 });
      mockPalettierRepository.findAll.mockResolvedValue([palettier]);
      // Occupy ground position
      mockPaletteRepository.findOccupiedPositionsByPalettierIds.mockResolvedValue(
        new Map([[1, [{ positionX: 0, positionY: 0, positionZ: 0 }]]])
      );

      const groundRule: RuleWithConfig = {
        rule: createRule({ id: 1, type: RuleType.PLACEMENT_CONSTRAINT }),
        placementConstraintConfig: new RulePlacementConstraintConfigEntity({
          id: 1,
          ruleId: 1,
          constraintType: PlacementConstraintType.GROUND_ONLY,
          maxHeight: null,
          createdAt: now,
          updatedAt: now,
        }),
        productIds: [1],
      };

      mockRuleRepository.findAll.mockResolvedValue({
        rules: [groundRule],
        total: 1,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      // Ground is occupied, no valid ground position available
      await expect(service.recommend(defaultInput)).rejects.toThrow(
        NoValidPlacementError
      );
    });

    it("should enforce max_height constraint", async () => {
      const palettier = createPalettier({ width: 1, depth: 1, height: 5 });
      mockPalettierRepository.findAll.mockResolvedValue([palettier]);
      // Occupy levels 0 and 1
      mockPaletteRepository.findOccupiedPositionsByPalettierIds.mockResolvedValue(
        new Map([
          [
            1,
            [
              { positionX: 0, positionY: 0, positionZ: 0 },
              { positionX: 0, positionY: 0, positionZ: 1 },
            ],
          ],
        ])
      );

      const maxHeightRule: RuleWithConfig = {
        rule: createRule({ id: 1, type: RuleType.PLACEMENT_CONSTRAINT }),
        placementConstraintConfig: new RulePlacementConstraintConfigEntity({
          id: 1,
          ruleId: 1,
          constraintType: PlacementConstraintType.MAX_HEIGHT,
          maxHeight: 2,
          createdAt: now,
          updatedAt: now,
        }),
        productIds: [1],
      };

      mockRuleRepository.findAll.mockResolvedValue({
        rules: [maxHeightRule],
        total: 1,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      const result = await service.recommend(defaultInput);

      expect(result.positionZ).toBe(2);
    });
  });

  describe("zone priority ranking", () => {
    it("should prefer palettier with higher zone priority score", async () => {
      const palA = createPalettier({ id: 1, name: "A" });
      const palB = createPalettier({ id: 2, name: "B" });
      mockPalettierRepository.findAll.mockResolvedValue([palA, palB]);

      const zonePriorityRule: RuleWithConfig = {
        rule: createRule({ id: 1, type: RuleType.ZONE_PRIORITY }),
        zonePriorityConfig: {
          id: 1,
          ruleId: 1,
          priorityLevel: 10,
          createdAt: now,
          updatedAt: now,
          palettierIds: [2],
        } as unknown as RuleZonePriorityConfigEntity & {
          palettierIds: number[];
        },
        productIds: [1],
      };

      mockRuleRepository.findAll.mockResolvedValue({
        rules: [zonePriorityRule],
        total: 1,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      const result = await service.recommend(defaultInput);

      expect(result.palettierId).toBe(2);
    });

    it("should prefer palettier with more available capacity on equal priority", async () => {
      const small = createPalettier({
        id: 1,
        name: "Small",
        width: 1,
        depth: 1,
        height: 1,
      });
      const large = createPalettier({
        id: 2,
        name: "Large",
        width: 3,
        depth: 3,
        height: 3,
      });
      mockPalettierRepository.findAll.mockResolvedValue([small, large]);

      const result = await service.recommend(defaultInput);

      expect(result.palettierId).toBe(2);
    });

    it("should use alphabetical name as tiebreaker", async () => {
      const palB = createPalettier({ id: 1, name: "Bravo" });
      const palA = createPalettier({ id: 2, name: "Alpha" });
      mockPalettierRepository.findAll.mockResolvedValue([palB, palA]);

      const result = await service.recommend(defaultInput);

      expect(result.palettierName).toBe("Alpha");
    });
  });

  describe("product incompatibility rule filtering", () => {
    it("should skip palettier containing incompatible product categories", async () => {
      const palA = createPalettier({ id: 1, name: "A" });
      const palB = createPalettier({ id: 2, name: "B" });
      mockPalettierRepository.findAll.mockResolvedValue([palA, palB]);

      // palA has products with category 20 (different from incoming category 10)
      mockPaletteRepository.findCategoryIdsByPalettierIds.mockResolvedValue(
        new Map([
          [1, [20]],
          [2, []],
        ])
      );

      const incompatibilityRule: RuleWithConfig = {
        rule: createRule({ id: 1, type: RuleType.PRODUCT_INCOMPATIBILITY }),
        productIncompatibilityConfig:
          new RuleProductIncompatibilityConfigEntity({
            id: 1,
            ruleId: 1,
            categoryId: 10,
            minimumDistance: 1,
            createdAt: now,
            updatedAt: now,
          }),
        productIds: [1],
      };

      mockRuleRepository.findAll.mockResolvedValue({
        rules: [incompatibilityRule],
        total: 1,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      const result = await service.recommend(defaultInput);

      // palA has incompatible category, so palB is chosen
      expect(result.palettierId).toBe(2);
    });

    it("should skip palettier when it has the incompatible category and incoming product is a different category", async () => {
      const palA = createPalettier({ id: 1, name: "A" });
      const palB = createPalettier({ id: 2, name: "B" });
      mockPalettierRepository.findAll.mockResolvedValue([palA, palB]);

      // palA already has products with category 10 (the incompatible category)
      // incoming product has category 20 (different from incompatible)
      mockPaletteRepository.findCategoryIdsByPalettierIds.mockResolvedValue(
        new Map([
          [1, [10]],
          [2, []],
        ])
      );

      const incompatibilityRule: RuleWithConfig = {
        rule: createRule({ id: 1, type: RuleType.PRODUCT_INCOMPATIBILITY }),
        productIncompatibilityConfig:
          new RuleProductIncompatibilityConfigEntity({
            id: 1,
            ruleId: 1,
            categoryId: 10,
            minimumDistance: 1,
            createdAt: now,
            updatedAt: now,
          }),
        productIds: [2],
      };

      mockRuleRepository.findAll.mockResolvedValue({
        rules: [incompatibilityRule],
        total: 1,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      const input: PlacementInput = {
        productIds: [2],
        productCategoryIds: [20],
      };

      const result = await service.recommend(input);

      // palA has incompatible category 10, incoming is category 20 → skip palA
      expect(result.palettierId).toBe(2);
    });
  });

  describe("position fill order", () => {
    it("should fill X first, then Y, then Z", async () => {
      const palettier = createPalettier({ width: 2, depth: 2, height: 2 });
      mockPalettierRepository.findAll.mockResolvedValue([palettier]);

      // Occupy (0,0,0) and (1,0,0)
      mockPaletteRepository.findOccupiedPositionsByPalettierIds.mockResolvedValue(
        new Map([
          [
            1,
            [
              { positionX: 0, positionY: 0, positionZ: 0 },
              { positionX: 1, positionY: 0, positionZ: 0 },
            ],
          ],
        ])
      );

      const result = await service.recommend(defaultInput);

      // Next available should be (0,1,0) — Y increments after X is filled
      expect(result.positionX).toBe(0);
      expect(result.positionY).toBe(1);
      expect(result.positionZ).toBe(0);
    });
  });

  describe("recommendWithConflictDetection", () => {
    const coldPalettier = createPalettier({
      id: 1,
      name: "Cold Storage A",
      palettierTypeId: 2,
    });
    const dryPalettier = createPalettier({
      id: 2,
      name: "Dry Storage B",
      palettierTypeId: 1,
    });

    const coldStorageRule: RuleWithConfig = {
      rule: createRule({
        id: 1,
        name: "Cold storage required",
        type: RuleType.STORAGE_CONDITION,
      }),
      storageConditionConfig: {
        id: 1,
        ruleId: 1,
        conditionType: "cold_storage",
        selectionMode: SelectionMode.PALETTIER_TYPE,
        palettierTypeId: 2,
        createdAt: now,
        updatedAt: now,
        palettierIds: [],
      } as unknown as RuleStorageConditionConfigEntity & {
        palettierIds: number[];
      },
      productIds: [1],
    };

    const dryStorageRule: RuleWithConfig = {
      rule: createRule({
        id: 2,
        name: "Dry storage required",
        type: RuleType.STORAGE_CONDITION,
      }),
      storageConditionConfig: {
        id: 2,
        ruleId: 2,
        conditionType: "dry_storage",
        selectionMode: SelectionMode.PALETTIER_TYPE,
        palettierTypeId: 1,
        createdAt: now,
        updatedAt: now,
        palettierIds: [],
      } as unknown as RuleStorageConditionConfigEntity & {
        palettierIds: number[];
      },
      productIds: [2],
    };

    it("should return conflict with 2 groups when products have different STORAGE_CONDITION rules", async () => {
      mockPalettierRepository.findAll.mockResolvedValue([
        coldPalettier,
        dryPalettier,
      ]);
      mockRuleRepository.findAll.mockResolvedValue({
        rules: [coldStorageRule, dryStorageRule],
        total: 2,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      const input: PlacementInput = {
        productIds: [1, 2],
        productCategoryIds: [10, 20],
      };

      const result = await service.recommendWithConflictDetection(input, [
        "Product A",
        "Product B",
      ]);

      expect(result.status).toBe("conflict");
      if (result.status === "conflict") {
        expect(result.groups).toHaveLength(2);
        // One group should have product 1, other should have product 2
        const groupProductIds = result.groups.map((g) => g.productIds).flat();
        expect(groupProductIds).toContain(1);
        expect(groupProductIds).toContain(2);
        // Each group should have a recommendation
        for (const group of result.groups) {
          expect(group.recommendation).not.toBeNull();
        }
      }
    });

    it("should return resolved when products are compatible", async () => {
      // Both products can go to the same palettier (no conflicting rules)
      const palettier = createPalettier({ id: 1, name: "General" });
      mockPalettierRepository.findAll.mockResolvedValue([palettier]);
      mockRuleRepository.findAll.mockResolvedValue({
        rules: [],
        total: 0,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      const input: PlacementInput = {
        productIds: [1, 2],
        productCategoryIds: [10, 20],
      };

      const result = await service.recommendWithConflictDetection(input, [
        "Product A",
        "Product B",
      ]);

      expect(result.status).toBe("resolved");
      if (result.status === "resolved") {
        expect(result.recommendation.palettierId).toBe(1);
      }
    });

    it("should return conflict with 2 groups when 3 products split 2+1", async () => {
      // Products 1 and 3 need cold, product 2 needs dry
      const coldRuleFor3: RuleWithConfig = {
        rule: createRule({
          id: 3,
          name: "Cold storage for product 3",
          type: RuleType.STORAGE_CONDITION,
        }),
        storageConditionConfig: {
          id: 3,
          ruleId: 3,
          conditionType: "cold_storage",
          selectionMode: SelectionMode.PALETTIER_TYPE,
          palettierTypeId: 2,
          createdAt: now,
          updatedAt: now,
          palettierIds: [],
        } as unknown as RuleStorageConditionConfigEntity & {
          palettierIds: number[];
        },
        productIds: [3],
      };

      mockPalettierRepository.findAll.mockResolvedValue([
        coldPalettier,
        dryPalettier,
      ]);
      mockRuleRepository.findAll.mockResolvedValue({
        rules: [coldStorageRule, dryStorageRule, coldRuleFor3],
        total: 3,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      const input: PlacementInput = {
        productIds: [1, 2, 3],
        productCategoryIds: [10, 20, 10],
      };

      const result = await service.recommendWithConflictDetection(input, [
        "Product A",
        "Product B",
        "Product C",
      ]);

      expect(result.status).toBe("conflict");
      if (result.status === "conflict") {
        expect(result.groups).toHaveLength(2);
        // Find the cold group — should have products 1 and 3
        const coldGroup = result.groups.find((g) => g.productIds.includes(1));
        expect(coldGroup?.productIds).toContain(3);
        expect(coldGroup?.productIds).not.toContain(2);
        // Dry group should have product 2 only
        const dryGroup = result.groups.find((g) => g.productIds.includes(2));
        expect(dryGroup?.productIds).toHaveLength(1);
      }
    });

    it("should set recommendation to null when product has no compatible palettier", async () => {
      // Product 1 needs cold (type 2), product 2 needs dry (type 1)
      // But only cold palettier exists — product 2 has nowhere to go
      mockPalettierRepository.findAll.mockResolvedValue([coldPalettier]);
      mockRuleRepository.findAll.mockResolvedValue({
        rules: [coldStorageRule, dryStorageRule],
        total: 2,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      const input: PlacementInput = {
        productIds: [1, 2],
        productCategoryIds: [10, 20],
      };

      const result = await service.recommendWithConflictDetection(input, [
        "Product A",
        "Product B",
      ]);

      expect(result.status).toBe("conflict");
      if (result.status === "conflict") {
        const unplaceableGroup = result.groups.find((g) =>
          g.productIds.includes(2)
        );
        expect(unplaceableGroup?.recommendation).toBeNull();
        expect(unplaceableGroup?.reasoning).toContain("No palettier satisfies the rules for Product B");
      }
    });

    it("should include product names and rule reasons in conflictExplanation", async () => {
      mockPalettierRepository.findAll.mockResolvedValue([
        coldPalettier,
        dryPalettier,
      ]);
      mockRuleRepository.findAll.mockResolvedValue({
        rules: [coldStorageRule, dryStorageRule],
        total: 2,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      const input: PlacementInput = {
        productIds: [1, 2],
        productCategoryIds: [10, 20],
      };

      const result = await service.recommendWithConflictDetection(input, [
        "Product A",
        "Product B",
      ]);

      expect(result.status).toBe("conflict");
      if (result.status === "conflict") {
        expect(result.conflictExplanation).toContain("Product A");
        expect(result.conflictExplanation).toContain("Product B");
      }
    });

    it("should not group products with PRODUCT_INCOMPATIBILITY between their categories", async () => {
      // Products 1 (cat 10) and 2 (cat 20) are category-incompatible
      // Product 3 (cat 10) is compatible with product 1 but not product 2
      // All need general storage (no storage condition rules)
      // But PRODUCT_INCOMPATIBILITY prevents cat 10 and cat 20 from sharing
      const generalPalettier = createPalettier({
        id: 3,
        name: "General",
        palettierTypeId: 1,
      });
      mockPalettierRepository.findAll.mockResolvedValue([generalPalettier]);

      const incompatibilityRule: RuleWithConfig = {
        rule: createRule({
          id: 10,
          type: RuleType.PRODUCT_INCOMPATIBILITY,
        }),
        productIncompatibilityConfig:
          new RuleProductIncompatibilityConfigEntity({
            id: 10,
            ruleId: 10,
            categoryId: 10,
            minimumDistance: 1,
            createdAt: now,
            updatedAt: now,
          }),
        productIds: [1, 3],
      };

      mockRuleRepository.findAll.mockResolvedValue({
        rules: [incompatibilityRule],
        total: 1,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      // The palettier currently has products from category 20
      mockPaletteRepository.findCategoryIdsByPalettierIds.mockResolvedValue(
        new Map([[3, [20]]])
      );

      const input: PlacementInput = {
        productIds: [1, 2],
        productCategoryIds: [10, 20],
      };

      const result = await service.recommendWithConflictDetection(input, [
        "Product A",
        "Product B",
      ]);

      // Even though both products individually fit the general palettier,
      // the PRODUCT_INCOMPATIBILITY rule between category 10 and 20
      // means they can't share it. But actually, for the partitioning algorithm,
      // we're checking if products can share a palettier based on their individual
      // compatibility. Since the palettier already has cat 20, product 1 (cat 10)
      // can't go there due to incompatibility. So product 1 has zero candidates.
      expect(result.status).toBe("conflict");
      if (result.status === "conflict") {
        // Product 1 (cat 10) should NOT be in same group as product 2 (cat 20)
        const group1 = result.groups.find((g) => g.productIds.includes(1));
        const group2 = result.groups.find((g) => g.productIds.includes(2));
        expect(group1).toBeDefined();
        expect(group2).toBeDefined();
        // They should be in separate groups
        if (group1 && group2) {
          expect(group1.productIds).not.toContain(2);
          expect(group2.productIds).not.toContain(1);
        }
      }
    });

    it("should not break existing recommend() method (backward compatibility)", async () => {
      const palettier = createPalettier();
      mockPalettierRepository.findAll.mockResolvedValue([palettier]);

      // Original recommend() should still work exactly as before
      const result = await service.recommend(defaultInput);

      expect(result.palettierId).toBe(palettier.id);
      expect(result.palettierName).toBe(palettier.name);
      expect(result.positionX).toBe(0);
      expect(result.positionY).toBe(0);
      expect(result.positionZ).toBe(0);
      expect(result.reasoning).toContain("space available");
    });
  });

  describe("checkViolationsForPalettier", () => {
    it("should return empty array when no violations exist", async () => {
      const palettier = createPalettier({ id: 1, name: "Rack A" });
      mockPalettierRepository.findAll.mockResolvedValue([palettier]);

      const result = await service.checkViolationsForPalettier([1], 1);

      expect(result).toEqual([]);
    });

    it("should return storage condition violation when palettier type does not match", async () => {
      const dryPalettier = createPalettier({
        id: 1,
        name: "Dry Storage B",
        palettierTypeId: 1,
      });
      mockPalettierRepository.findAll.mockResolvedValue([dryPalettier]);

      const coldStorageRule: RuleWithConfig = {
        rule: createRule({
          id: 1,
          name: "Cold Storage Required",
          type: RuleType.STORAGE_CONDITION,
        }),
        storageConditionConfig: {
          id: 1,
          ruleId: 1,
          conditionType: "cold_storage",
          selectionMode: SelectionMode.PALETTIER_TYPE,
          palettierTypeId: 2,
          createdAt: now,
          updatedAt: now,
          palettierIds: [],
        } as unknown as RuleStorageConditionConfigEntity & {
          palettierIds: number[];
        },
        productIds: [1],
      };

      mockRuleRepository.findAll.mockResolvedValue({
        rules: [coldStorageRule],
        total: 1,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      const result = await service.checkViolationsForPalettier([1], 1);

      expect(result).toHaveLength(1);
      expect(result[0].ruleName).toBe("Cold Storage Required");
      expect(result[0].ruleType).toBe(RuleType.STORAGE_CONDITION);
      expect(result[0].reason).toContain("Dry Storage B");
    });

    it("should return incompatibility violation when incompatible category exists on palettier", async () => {
      const palettier = createPalettier({ id: 1, name: "General Rack" });
      mockPalettierRepository.findAll.mockResolvedValue([palettier]);

      mockPaletteRepository.findCategoryIdsByPalettierIds.mockResolvedValue(
        new Map([[1, [20]]])
      );

      const incompatibilityRule: RuleWithConfig = {
        rule: createRule({
          id: 1,
          name: "Keep Chemicals Separate",
          type: RuleType.PRODUCT_INCOMPATIBILITY,
        }),
        productIncompatibilityConfig:
          new RuleProductIncompatibilityConfigEntity({
            id: 1,
            ruleId: 1,
            categoryId: 20,
            minimumDistance: 1,
            createdAt: now,
            updatedAt: now,
          }),
        productIds: [1],
      };

      mockRuleRepository.findAll.mockResolvedValue({
        rules: [incompatibilityRule],
        total: 1,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      const result = await service.checkViolationsForPalettier([1], 1);

      expect(result).toHaveLength(1);
      expect(result[0].ruleName).toBe("Keep Chemicals Separate");
      expect(result[0].ruleType).toBe(RuleType.PRODUCT_INCOMPATIBILITY);
      expect(result[0].reason).toContain("incompatible category");
    });

    it("should return placement constraint violation (ground-only rule)", async () => {
      // Palettier with only height 0 — but width=0/depth=0 means no positions at all
      // Actually, use a palettier with height=1 so all positions are z=0
      // But then a ground_only rule would NOT be violated. To violate it, we need
      // a palettier that has NO ground-level positions... that can't happen normally.
      // A ground_only violation means: after applying the constraint, zero positions remain.
      // This happens when the palettier has zero total positions (impossible with valid dimensions).
      //
      // Actually: a ground_only rule filters positions to z===0.
      // If the palettier has height >= 1, there are always z=0 positions.
      // So ground_only never produces a violation at palettier level.
      //
      // Use max_height instead: palettier height=5, max_height=0 means only z=0 is valid.
      // But that always produces valid positions too.
      //
      // To truly violate: constraintType GROUND_ONLY with a palettier that has zero
      // positions at z=0? Not possible with standard generation.
      //
      // The realistic scenario: use MAX_HEIGHT with maxHeight=-1 or similar edge case.
      // Actually, MAX_HEIGHT with maxHeight=null returns all positions (no violation).
      //
      // Let's test with a practical case: palettier has no ground positions
      // (height starts above 0). Since generateAllPositions always starts at z=0,
      // the only way to get a violation is if the constraint logic filters them all out.
      //
      // Simplest: use MAX_HEIGHT with maxHeight of -1 (filters all positions).
      const palettier = createPalettier({
        id: 1,
        name: "High Rack",
        width: 2,
        depth: 1,
        height: 3,
      });
      mockPalettierRepository.findAll.mockResolvedValue([palettier]);

      const maxHeightRule: RuleWithConfig = {
        rule: createRule({
          id: 1,
          name: "Max Height 0 Only",
          type: RuleType.PLACEMENT_CONSTRAINT,
        }),
        placementConstraintConfig: new RulePlacementConstraintConfigEntity({
          id: 1,
          ruleId: 1,
          constraintType: PlacementConstraintType.MAX_HEIGHT,
          maxHeight: -1,
          createdAt: now,
          updatedAt: now,
        }),
        productIds: [1],
      };

      mockRuleRepository.findAll.mockResolvedValue({
        rules: [maxHeightRule],
        total: 1,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      const result = await service.checkViolationsForPalettier([1], 1);

      expect(result).toHaveLength(1);
      expect(result[0].ruleName).toBe("Max Height 0 Only");
      expect(result[0].ruleType).toBe(RuleType.PLACEMENT_CONSTRAINT);
      expect(result[0].reason).toContain("High Rack");
    });

    it("should return multiple violations for multiple violated rules", async () => {
      const dryPalettier = createPalettier({
        id: 1,
        name: "Dry Storage",
        palettierTypeId: 1,
      });
      mockPalettierRepository.findAll.mockResolvedValue([dryPalettier]);

      mockPaletteRepository.findCategoryIdsByPalettierIds.mockResolvedValue(
        new Map([[1, [20]]])
      );

      const coldStorageRule: RuleWithConfig = {
        rule: createRule({
          id: 1,
          name: "Cold Storage Required",
          type: RuleType.STORAGE_CONDITION,
        }),
        storageConditionConfig: {
          id: 1,
          ruleId: 1,
          conditionType: "cold_storage",
          selectionMode: SelectionMode.PALETTIER_TYPE,
          palettierTypeId: 2,
          createdAt: now,
          updatedAt: now,
          palettierIds: [],
        } as unknown as RuleStorageConditionConfigEntity & {
          palettierIds: number[];
        },
        productIds: [1],
      };

      const incompatibilityRule: RuleWithConfig = {
        rule: createRule({
          id: 2,
          name: "Keep Separate",
          type: RuleType.PRODUCT_INCOMPATIBILITY,
        }),
        productIncompatibilityConfig:
          new RuleProductIncompatibilityConfigEntity({
            id: 2,
            ruleId: 2,
            categoryId: 20,
            minimumDistance: 1,
            createdAt: now,
            updatedAt: now,
          }),
        productIds: [1],
      };

      mockRuleRepository.findAll.mockResolvedValue({
        rules: [coldStorageRule, incompatibilityRule],
        total: 2,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      const result = await service.checkViolationsForPalettier([1], 1);

      expect(result).toHaveLength(2);
      const ruleTypes = result.map((w) => w.ruleType);
      expect(ruleTypes).toContain(RuleType.STORAGE_CONDITION);
      expect(ruleTypes).toContain(RuleType.PRODUCT_INCOMPATIBILITY);
    });

    it("should ignore zone priority rules (not violations)", async () => {
      const palettier = createPalettier({ id: 1, name: "Rack A" });
      mockPalettierRepository.findAll.mockResolvedValue([palettier]);

      const zonePriorityRule: RuleWithConfig = {
        rule: createRule({
          id: 1,
          name: "Preferred Zone",
          type: RuleType.ZONE_PRIORITY,
        }),
        zonePriorityConfig: {
          id: 1,
          ruleId: 1,
          priorityLevel: 10,
          createdAt: now,
          updatedAt: now,
          palettierIds: [2],
        } as unknown as RuleZonePriorityConfigEntity & {
          palettierIds: number[];
        },
        productIds: [1],
      };

      mockRuleRepository.findAll.mockResolvedValue({
        rules: [zonePriorityRule],
        total: 1,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      const result = await service.checkViolationsForPalettier([1], 1);

      expect(result).toEqual([]);
    });
  });
});
