import { Test, TestingModule } from "@nestjs/testing";
import { RecommendPlacementUseCase } from "./recommend-placement.use-case";
import { ProductRepository } from "@domain/repositories";
import { PlacementEngineService } from "@domain/services";
import { ProductEntity } from "@domain/entities";
import { ProductNotFoundError } from "@domain/errors";
import { PlacementRecommendation, PlacementResult } from "@domain/types";

const now = new Date();

const mockProduct = new ProductEntity({
  id: 1,
  reference: "REF-001",
  name: "Widget A",
  unitOfMeasureId: 1,
  categoryId: 10,
  minimumStock: null,
  expiryAlertThreshold: null,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});

const mockProduct2 = new ProductEntity({
  id: 2,
  reference: "REF-002",
  name: "Widget B",
  unitOfMeasureId: 1,
  categoryId: 20,
  minimumStock: null,
  expiryAlertThreshold: null,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});

const mockRecommendation: PlacementRecommendation = {
  palettierId: 1,
  palettierName: "Rack A",
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  reasoning: "Cold storage — space available",
};

const mockResolvedResult: PlacementResult = {
  status: "resolved",
  recommendation: mockRecommendation,
};

const mockConflictResult: PlacementResult = {
  status: "conflict",
  conflictExplanation:
    "Widget A needs Cold storage required, Widget B needs Dry storage required",
  groups: [
    {
      productIds: [1],
      productNames: ["Widget A"],
      recommendation: mockRecommendation,
      reasoning: "Cold storage — space available",
    },
    {
      productIds: [2],
      productNames: ["Widget B"],
      recommendation: {
        palettierId: 2,
        palettierName: "Dry Storage B",
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        reasoning: "Dry storage — space available",
      },
      reasoning: "Dry storage — space available",
    },
  ],
};

describe("RecommendPlacementUseCase", () => {
  let useCase: RecommendPlacementUseCase;
  let mockProductRepo: Record<string, jest.Mock>;
  let mockPlacementEngine: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockProductRepo = {
      findByIds: jest
        .fn()
        .mockResolvedValue([{ product: mockProduct, ruleIds: [1] }]),
    };
    mockPlacementEngine = {
      recommendWithConflictDetection: jest
        .fn()
        .mockResolvedValue(mockResolvedResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendPlacementUseCase,
        { provide: ProductRepository, useValue: mockProductRepo },
        { provide: PlacementEngineService, useValue: mockPlacementEngine },
      ],
    }).compile();

    useCase = module.get<RecommendPlacementUseCase>(RecommendPlacementUseCase);
  });

  it("should return a resolved placement result for a single product", async () => {
    const result = await useCase.execute({ productIds: [1] });

    expect(result.status).toBe("resolved");
    if (result.status === "resolved") {
      expect(result.recommendation).toEqual(mockRecommendation);
    }
    expect(mockProductRepo.findByIds).toHaveBeenCalledWith([1]);
    expect(
      mockPlacementEngine.recommendWithConflictDetection
    ).toHaveBeenCalledWith(
      { productIds: [1], productCategoryIds: [10] },
      ["Widget A"]
    );
  });

  it("should return a resolved placement result for multiple products", async () => {
    mockProductRepo.findByIds.mockResolvedValue([
      { product: mockProduct, ruleIds: [1] },
      { product: mockProduct2, ruleIds: [2] },
    ]);

    const result = await useCase.execute({ productIds: [1, 2] });

    expect(result.status).toBe("resolved");
    expect(mockProductRepo.findByIds).toHaveBeenCalledWith([1, 2]);
    expect(
      mockPlacementEngine.recommendWithConflictDetection
    ).toHaveBeenCalledWith(
      { productIds: [1, 2], productCategoryIds: [10, 20] },
      ["Widget A", "Widget B"]
    );
  });

  it("should throw ProductNotFoundError when a product is not found", async () => {
    mockProductRepo.findByIds.mockResolvedValue([]);

    await expect(useCase.execute({ productIds: [999] })).rejects.toThrow(
      ProductNotFoundError
    );
  });

  it("should pass null categoryId when product has no category", async () => {
    const productNoCategory = new ProductEntity({
      id: mockProduct.id,
      reference: mockProduct.reference,
      name: mockProduct.name,
      unitOfMeasureId: mockProduct.unitOfMeasureId,
      categoryId: null,
      minimumStock: mockProduct.minimumStock,
      expiryAlertThreshold: mockProduct.expiryAlertThreshold,
      createdAt: mockProduct.createdAt,
      updatedAt: mockProduct.updatedAt,
      deletedAt: mockProduct.deletedAt,
    });
    mockProductRepo.findByIds.mockResolvedValue([
      { product: productNoCategory, ruleIds: [] },
    ]);

    await useCase.execute({ productIds: [1] });

    expect(
      mockPlacementEngine.recommendWithConflictDetection
    ).toHaveBeenCalledWith(
      { productIds: [1], productCategoryIds: [null] },
      ["Widget A"]
    );
  });

  it("should return a conflict result when products have incompatible rules", async () => {
    mockProductRepo.findByIds.mockResolvedValue([
      { product: mockProduct, ruleIds: [1] },
      { product: mockProduct2, ruleIds: [2] },
    ]);
    mockPlacementEngine.recommendWithConflictDetection.mockResolvedValue(
      mockConflictResult
    );

    const result = await useCase.execute({ productIds: [1, 2] });

    expect(result.status).toBe("conflict");
    if (result.status === "conflict") {
      expect(result.groups).toHaveLength(2);
      expect(result.conflictExplanation).toContain("Widget A");
      expect(result.conflictExplanation).toContain("Widget B");
    }
  });
});
