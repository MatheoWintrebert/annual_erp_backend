import { CreatePickingListUseCase } from "./create-picking-list.use-case";
import { PaletteRepository, PickingListRepository } from "@domain/repositories";
import { PickingListEntity, PickingListItemEntity } from "@domain/entities";
import { PickingListStatus, ProductStock } from "@domain/types";
import {
  DuplicateProductInListError,
  EmptyPickingListError,
  InsufficientStockError,
} from "@domain/errors";

describe("CreatePickingListUseCase", () => {
  let useCase: CreatePickingListUseCase;
  let pickingListRepository: jest.Mocked<PickingListRepository>;
  let paletteRepository: jest.Mocked<PaletteRepository>;

  const now = new Date();

  const createMockPickingList = (
    items: { productId: number; requestedQuantity: number }[]
  ): PickingListEntity =>
    new PickingListEntity({
      id: 1,
      status: PickingListStatus.CREATED,
      createdAt: now,
      updatedAt: now,
      items: items.map(
        (item, index) =>
          new PickingListItemEntity({
            id: index + 1,
            pickingListId: 1,
            productId: item.productId,
            requestedQuantity: item.requestedQuantity,
            createdAt: now,
            updatedAt: now,
          })
      ),
    });

  const createMockStock = (
    entries: { productId: number; available: number }[]
  ): ProductStock[] =>
    entries.map((e) => ({
      productId: e.productId,
      productName: `Product ${String(e.productId)}`,
      productReference: `REF-${String(e.productId)}`,
      availableQuantity: e.available,
      unitOfMeasureName: "pcs",
    }));

  beforeEach(() => {
    pickingListRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      updateItems: jest.fn(),
    } as jest.Mocked<PickingListRepository>;

    paletteRepository = {
      getAvailableStockByProductIds: jest.fn(),
    } as unknown as jest.Mocked<PaletteRepository>;

    useCase = new CreatePickingListUseCase(
      pickingListRepository,
      paletteRepository
    );
  });

  it("should create picking list with valid items", async () => {
    const input = {
      items: [
        { productId: 1, requestedQuantity: 10 },
        { productId: 2, requestedQuantity: 5 },
      ],
    };

    paletteRepository.getAvailableStockByProductIds.mockResolvedValue(
      createMockStock([
        { productId: 1, available: 100 },
        { productId: 2, available: 50 },
      ])
    );

    const mockResult = createMockPickingList(input.items);
    pickingListRepository.create.mockResolvedValue(mockResult);

    const result = await useCase.execute(input);

    expect(result).toEqual(mockResult);
    expect(pickingListRepository.create).toHaveBeenCalledWith(input);
  });

  it("should throw EmptyPickingListError for empty items", async () => {
    await expect(useCase.execute({ items: [] })).rejects.toThrow(
      EmptyPickingListError
    );

    expect(pickingListRepository.create).not.toHaveBeenCalled();
  });

  it("should throw DuplicateProductInListError for duplicate products", async () => {
    const input = {
      items: [
        { productId: 1, requestedQuantity: 10 },
        { productId: 1, requestedQuantity: 5 },
      ],
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      DuplicateProductInListError
    );

    expect(pickingListRepository.create).not.toHaveBeenCalled();
  });

  it("should throw InsufficientStockError when quantity exceeds stock (with product details)", async () => {
    const input = {
      items: [{ productId: 1, requestedQuantity: 200 }],
    };

    paletteRepository.getAvailableStockByProductIds.mockResolvedValue(
      createMockStock([{ productId: 1, available: 100 }])
    );

    try {
      await useCase.execute(input);
      fail("Expected InsufficientStockError");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(InsufficientStockError);
      const err = error as InsufficientStockError;
      const items = err.details.items as {
        productId: number;
        requestedQuantity: number;
        availableQuantity: number;
      }[];
      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe(1);
      expect(items[0].requestedQuantity).toBe(200);
      expect(items[0].availableQuantity).toBe(100);
    }
  });

  it("should throw InsufficientStockError listing ALL insufficient products (not just first)", async () => {
    const input = {
      items: [
        { productId: 1, requestedQuantity: 200 },
        { productId: 2, requestedQuantity: 100 },
      ],
    };

    paletteRepository.getAvailableStockByProductIds.mockResolvedValue(
      createMockStock([
        { productId: 1, available: 50 },
        { productId: 2, available: 10 },
      ])
    );

    try {
      await useCase.execute(input);
      fail("Expected InsufficientStockError");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(InsufficientStockError);
      const err = error as InsufficientStockError;
      const items = err.details.items as { productId: number }[];
      expect(items).toHaveLength(2);
      expect(items[0].productId).toBe(1);
      expect(items[1].productId).toBe(2);
    }
  });
});
