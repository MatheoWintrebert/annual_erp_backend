import { GeneratePickRouteUseCase } from "./generate-pick-route.use-case";
import { PickingListRepository } from "@domain/repositories";
import { FefoService } from "@domain/services";
import { PickingListEntity, PickingListItemEntity } from "@domain/entities";
import { PickingListStatus, PickRouteItem } from "@domain/types";
import {
  InvalidPickingListStatusError,
  PickingListNotFoundError,
} from "@domain/errors";

describe("GeneratePickRouteUseCase", () => {
  let useCase: GeneratePickRouteUseCase;
  let pickingListRepository: jest.Mocked<PickingListRepository>;
  let fefoService: jest.Mocked<FefoService>;

  const now = new Date();

  const createMockPickingList = (
    status: PickingListStatus,
    items: { productId: number; requestedQuantity: number }[] = [
      { productId: 1, requestedQuantity: 10 },
    ]
  ): PickingListEntity =>
    new PickingListEntity({
      id: 1,
      status,
      createdAt: now,
      updatedAt: now,
      items: items.map(
        (item, index) =>
          new PickingListItemEntity({
            id: index + 1,
            pickingListId: 1,
            productId: item.productId,
            productName: `Product ${String(item.productId)}`,
            requestedQuantity: item.requestedQuantity,
            createdAt: now,
            updatedAt: now,
          })
      ),
    });

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
    quantityToPick: 10,
    expiryDate: new Date("2026-03-01"),
    lotReference: "LOT-001",
    ...overrides,
  });

  beforeEach(() => {
    pickingListRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      updateItems: jest.fn(),
    } as jest.Mocked<PickingListRepository>;

    fefoService = {
      generatePickRoute: jest.fn(),
    } as unknown as jest.Mocked<FefoService>;

    useCase = new GeneratePickRouteUseCase(pickingListRepository, fefoService);
  });

  it("should generate pick route for valid picking list with CREATED status", async () => {
    const pickingList = createMockPickingList(PickingListStatus.CREATED);
    const expectedRoute = [createMockRouteItem()];

    pickingListRepository.findById.mockResolvedValue(pickingList);
    fefoService.generatePickRoute.mockResolvedValue(expectedRoute);
    pickingListRepository.updateStatus.mockResolvedValue(undefined);

    const result = await useCase.execute(1);

    expect(result).toEqual(expectedRoute);
    expect(pickingListRepository.findById).toHaveBeenCalledWith(1);
    expect(fefoService.generatePickRoute).toHaveBeenCalledWith(
      new Map([[1, 1]]),
      [{ productId: 1, requestedQuantity: 10 }]
    );
  });

  it("should throw PickingListNotFoundError for non-existent picking list", async () => {
    pickingListRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(
      PickingListNotFoundError
    );
    expect(fefoService.generatePickRoute).not.toHaveBeenCalled();
  });

  it("should throw InvalidPickingListStatusError for non-CREATED status", async () => {
    const pickingList = createMockPickingList(PickingListStatus.IN_PROGRESS);
    pickingListRepository.findById.mockResolvedValue(pickingList);

    await expect(useCase.execute(1)).rejects.toThrow(
      InvalidPickingListStatusError
    );
    expect(fefoService.generatePickRoute).not.toHaveBeenCalled();
  });

  it("should update picking list status to IN_PROGRESS after route generation", async () => {
    const pickingList = createMockPickingList(PickingListStatus.CREATED);
    pickingListRepository.findById.mockResolvedValue(pickingList);
    fefoService.generatePickRoute.mockResolvedValue([createMockRouteItem()]);
    pickingListRepository.updateStatus.mockResolvedValue(undefined);

    await useCase.execute(1);

    expect(pickingListRepository.updateStatus).toHaveBeenCalledWith(
      1,
      PickingListStatus.IN_PROGRESS
    );
  });

  it("should return empty route for picking list with no items", async () => {
    const pickingList = createMockPickingList(PickingListStatus.CREATED, []);
    pickingListRepository.findById.mockResolvedValue(pickingList);
    fefoService.generatePickRoute.mockResolvedValue([]);
    pickingListRepository.updateStatus.mockResolvedValue(undefined);

    const result = await useCase.execute(1);

    expect(result).toEqual([]);
  });
});
