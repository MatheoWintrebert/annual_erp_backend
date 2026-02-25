import { Test, TestingModule } from "@nestjs/testing";
import { PickingController } from "./picking.controller";
import {
  GetAvailableStockUseCase,
  CreatePickingListUseCase,
  GeneratePickRouteUseCase,
  CompletePickingListUseCase,
  CancelPickingListUseCase,
} from "@application/use-cases";
import { PickingListEntity, PickingListItemEntity } from "@domain/entities";
import {
  PickingCompletionResult,
  PickingListStatus,
  PickRouteItem,
  ProductStock,
} from "@domain/types";
import {
  EmptyPickingListError,
  InvalidPickingListStatusError,
  PickingListAlreadyCancelledError,
  PickingListAlreadyCompletedError,
  PickingListNotFoundError,
} from "@domain/errors";

describe("PickingController", () => {
  let controller: PickingController;
  let getAvailableStockExecuteMock: jest.Mock;
  let createPickingListExecuteMock: jest.Mock;
  let generatePickRouteExecuteMock: jest.Mock;
  let completePickingListExecuteMock: jest.Mock;
  let cancelPickingListExecuteMock: jest.Mock;

  const now = new Date();

  beforeEach(async () => {
    getAvailableStockExecuteMock = jest.fn();
    createPickingListExecuteMock = jest.fn();
    generatePickRouteExecuteMock = jest.fn();
    completePickingListExecuteMock = jest.fn();
    cancelPickingListExecuteMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PickingController],
      providers: [
        {
          provide: GetAvailableStockUseCase,
          useValue: { execute: getAvailableStockExecuteMock },
        },
        {
          provide: CreatePickingListUseCase,
          useValue: { execute: createPickingListExecuteMock },
        },
        {
          provide: GeneratePickRouteUseCase,
          useValue: { execute: generatePickRouteExecuteMock },
        },
        {
          provide: CompletePickingListUseCase,
          useValue: { execute: completePickingListExecuteMock },
        },
        {
          provide: CancelPickingListUseCase,
          useValue: { execute: cancelPickingListExecuteMock },
        },
      ],
    }).compile();

    controller = module.get<PickingController>(PickingController);
  });

  describe("getAvailableStock", () => {
    it("should return stock for given productIds", async () => {
      const mockStock: ProductStock[] = [
        {
          productId: 1,
          productName: "Whole Milk",
          productReference: "WM-001",
          availableQuantity: 150,
          unitOfMeasureName: "L",
        },
        {
          productId: 2,
          productName: "Cable Ties",
          productReference: "CT-100",
          availableQuantity: 45,
          unitOfMeasureName: "pcs",
        },
      ];

      getAvailableStockExecuteMock.mockResolvedValue(mockStock);

      const result = await controller.getAvailableStock({
        productIds: [1, 2],
      });

      expect(result).toHaveLength(2);
      expect(result[0].productId).toBe(1);
      expect(result[0].availableQuantity).toBe(150);
      expect(result[1].productId).toBe(2);
      expect(getAvailableStockExecuteMock).toHaveBeenCalledWith([1, 2]);
    });

    it("should return empty array for empty productIds", async () => {
      getAvailableStockExecuteMock.mockResolvedValue([]);

      const result = await controller.getAvailableStock({ productIds: [] });

      expect(result).toEqual([]);
      expect(getAvailableStockExecuteMock).toHaveBeenCalledWith([]);
    });
  });

  describe("create", () => {
    it("should create a picking list and return 201", async () => {
      const mockList = new PickingListEntity({
        id: 1,
        status: PickingListStatus.CREATED,
        createdAt: now,
        updatedAt: now,
        items: [
          new PickingListItemEntity({
            id: 1,
            pickingListId: 1,
            productId: 1,
            productName: "Whole Milk",
            requestedQuantity: 20,
            createdAt: now,
            updatedAt: now,
          }),
        ],
      });

      createPickingListExecuteMock.mockResolvedValue(mockList);

      const result = await controller.create({
        items: [{ productId: 1, requestedQuantity: 20 }],
      });

      expect(result.id).toBe(1);
      expect(result.status).toBe("created");
      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe(1);
      expect(result.items[0].productName).toBe("Whole Milk");
      expect(result.items[0].requestedQuantity).toBe(20);
      expect(createPickingListExecuteMock).toHaveBeenCalledWith({
        items: [{ productId: 1, requestedQuantity: 20 }],
      });
    });

    it("should propagate EmptyPickingListError for empty items array", async () => {
      createPickingListExecuteMock.mockRejectedValue(
        new EmptyPickingListError()
      );

      await expect(controller.create({ items: [] })).rejects.toThrow(
        EmptyPickingListError
      );
    });
  });

  describe("generateRoute", () => {
    const createMockRouteItem = (
      overrides: Partial<PickRouteItem> = {}
    ): PickRouteItem => ({
      pickingListItemId: 1,
      productId: 1,
      productName: "Whole Milk",
      productReference: "WM-001",
      palettierName: "Cold Storage A",
      paletteId: 5,
      paletteLotId: 12,
      positionX: 1,
      positionY: 2,
      positionZ: 1,
      quantityToPick: 20,
      expiryDate: new Date("2026-03-01"),
      lotReference: "LOT-2026-001",
      ...overrides,
    });

    it("should return FEFO-ordered pick route (200)", async () => {
      const mockRoute = [
        createMockRouteItem(),
        createMockRouteItem({
          pickingListItemId: 2,
          productId: 2,
          productName: "Cable Ties",
          productReference: "CT-100",
          expiryDate: null,
        }),
      ];

      generatePickRouteExecuteMock.mockResolvedValue(mockRoute);

      const result = await controller.generateRoute(1);

      expect(result).toHaveLength(2);
      expect(result[0].productId).toBe(1);
      expect(result[0].expiryDate).toBe("2026-03-01T00:00:00.000Z");
      expect(result[1].expiryDate).toBeNull();
      expect(generatePickRouteExecuteMock).toHaveBeenCalledWith(1);
    });

    it("should propagate PickingListNotFoundError (404)", async () => {
      generatePickRouteExecuteMock.mockRejectedValue(
        new PickingListNotFoundError(999)
      );

      await expect(controller.generateRoute(999)).rejects.toThrow(
        PickingListNotFoundError
      );
    });

    it("should propagate InvalidPickingListStatusError (400)", async () => {
      generatePickRouteExecuteMock.mockRejectedValue(
        new InvalidPickingListStatusError(
          1,
          PickingListStatus.IN_PROGRESS,
          PickingListStatus.CREATED
        )
      );

      await expect(controller.generateRoute(1)).rejects.toThrow(
        InvalidPickingListStatusError
      );
    });
  });

  describe("complete", () => {
    it("should complete picking list and return deductions (200)", async () => {
      const mockResult: PickingCompletionResult = {
        pickingListId: 1,
        status: PickingListStatus.COMPLETED,
        totalItemsPicked: 2,
        totalItemsSkipped: 0,
        deductions: [
          {
            paletteLotId: 12,
            productName: "Whole Milk",
            quantityDeducted: 20,
            palettierName: "Cold Storage A",
            positionX: 1,
            positionY: 2,
            positionZ: 1,
          },
        ],
        discrepancies: [],
      };

      completePickingListExecuteMock.mockResolvedValue(mockResult);

      const result = await controller.complete(1, {
        items: [
          {
            pickingListItemId: 1,
            paletteLotId: 12,
            status: "picked",
            pickedQuantity: 20,
          },
        ],
      });

      expect(result.pickingListId).toBe(1);
      expect(result.status).toBe(PickingListStatus.COMPLETED);
      expect(result.totalItemsPicked).toBe(2);
      expect(result.deductions).toHaveLength(1);
      expect(result.discrepancies).toHaveLength(0);
      expect(completePickingListExecuteMock).toHaveBeenCalledWith({
        pickingListId: 1,
        items: [
          {
            pickingListItemId: 1,
            paletteLotId: 12,
            status: "picked",
            pickedQuantity: 20,
          },
        ],
      });
    });

    it("should propagate PickingListNotFoundError (404)", async () => {
      completePickingListExecuteMock.mockRejectedValue(
        new PickingListNotFoundError(999)
      );

      await expect(
        controller.complete(999, {
          items: [
            {
              pickingListItemId: 1,
              paletteLotId: 12,
              status: "picked",
              pickedQuantity: 10,
            },
          ],
        })
      ).rejects.toThrow(PickingListNotFoundError);
    });

    it("should propagate PickingListAlreadyCompletedError (400)", async () => {
      completePickingListExecuteMock.mockRejectedValue(
        new PickingListAlreadyCompletedError(1)
      );

      await expect(
        controller.complete(1, {
          items: [
            {
              pickingListItemId: 1,
              paletteLotId: 12,
              status: "picked",
              pickedQuantity: 10,
            },
          ],
        })
      ).rejects.toThrow(PickingListAlreadyCompletedError);
    });
  });

  describe("cancel", () => {
    it("should cancel picking list and return 200", async () => {
      cancelPickingListExecuteMock.mockResolvedValue({
        pickingListId: 1,
        status: PickingListStatus.CANCELLED,
      });

      const result = await controller.cancel(1);

      expect(result.pickingListId).toBe(1);
      expect(result.status).toBe(PickingListStatus.CANCELLED);
      expect(cancelPickingListExecuteMock).toHaveBeenCalledWith(1);
    });

    it("should propagate PickingListNotFoundError (404)", async () => {
      cancelPickingListExecuteMock.mockRejectedValue(
        new PickingListNotFoundError(999)
      );

      await expect(controller.cancel(999)).rejects.toThrow(
        PickingListNotFoundError
      );
    });

    it("should propagate error for already completed/cancelled (400)", async () => {
      cancelPickingListExecuteMock.mockRejectedValue(
        new PickingListAlreadyCancelledError(1)
      );

      await expect(controller.cancel(1)).rejects.toThrow(
        PickingListAlreadyCancelledError
      );
    });
  });
});
