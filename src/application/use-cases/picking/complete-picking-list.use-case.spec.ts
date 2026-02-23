import { CompletePickingListUseCase } from "./complete-picking-list.use-case";
import { PaletteRepository } from "@domain/repositories";
import { PickingListRepository } from "@domain/repositories";
import { PickingListEntity, PickingListItemEntity } from "@domain/entities";
import {
  PickingListAlreadyCancelledError,
  PickingListAlreadyCompletedError,
  PickingListNotFoundError,
} from "@domain/errors";
import {
  CompletePickingListInput,
  PaletteLotFefoData,
  PickingListItemStatus,
  PickingListStatus,
} from "@domain/types";

describe("CompletePickingListUseCase", () => {
  let useCase: CompletePickingListUseCase;
  let pickingListRepository: jest.Mocked<PickingListRepository>;
  let paletteRepository: jest.Mocked<PaletteRepository>;

  const now = new Date();

  const createMockPickingList = (
    status: PickingListStatus,
    items: { id: number; productId: number; requestedQuantity: number }[] = [],
  ): PickingListEntity =>
    new PickingListEntity({
      id: 1,
      status,
      createdAt: now,
      updatedAt: now,
      items: items.map(
        (item) =>
          new PickingListItemEntity({
            id: item.id,
            pickingListId: 1,
            productId: item.productId,
            productName: `Product ${String(item.productId)}`,
            requestedQuantity: item.requestedQuantity,
            createdAt: now,
            updatedAt: now,
          }),
      ),
    });

  const createMockPaletteLotData = (paletteLotId: number, productId: number): PaletteLotFefoData => ({
    paletteLotId,
    paletteId: 100,
    palettierId: 1,
    palettierName: "Cold Storage A",
    positionX: 1,
    positionY: 2,
    positionZ: 1,
    lotId: 10,
    lotReference: `LOT-${String(paletteLotId)}`,
    expiryDate: new Date("2026-06-01"),
    quantity: 50,
    productId,
    productName: `Product ${String(productId)}`,
    productReference: `REF-${String(productId)}`,
  });

  beforeEach(() => {
    pickingListRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      updateItems: jest.fn(),
    } as jest.Mocked<PickingListRepository>;

    paletteRepository = {
      getPaletteLotsByProductIdsForFefo: jest.fn(),
      deductPaletteLotQuantity: jest.fn(),
    } as unknown as jest.Mocked<PaletteRepository>;

    useCase = new CompletePickingListUseCase(
      pickingListRepository,
      paletteRepository,
    );
  });

  it("should complete picking list with all items picked", async () => {
    const pickingList = createMockPickingList(PickingListStatus.IN_PROGRESS, [
      { id: 1, productId: 10, requestedQuantity: 20 },
      { id: 2, productId: 20, requestedQuantity: 15 },
    ]);
    pickingListRepository.findById.mockResolvedValue(pickingList);
    paletteRepository.getPaletteLotsByProductIdsForFefo.mockResolvedValue([
      createMockPaletteLotData(101, 10),
      createMockPaletteLotData(102, 20),
    ]);

    const input: CompletePickingListInput = {
      pickingListId: 1,
      items: [
        { pickingListItemId: 1, paletteLotId: 101, status: "picked", pickedQuantity: 20 },
        { pickingListItemId: 2, paletteLotId: 102, status: "picked", pickedQuantity: 15 },
      ],
    };

    const result = await useCase.execute(input);

    expect(result.pickingListId).toBe(1);
    expect(result.status).toBe(PickingListStatus.COMPLETED);
    expect(result.totalItemsPicked).toBe(2);
    expect(result.totalItemsSkipped).toBe(0);
    expect(result.deductions).toHaveLength(2);
    expect(result.discrepancies).toHaveLength(0);
    expect(paletteRepository.deductPaletteLotQuantity).toHaveBeenCalledTimes(2);
    expect(paletteRepository.deductPaletteLotQuantity).toHaveBeenCalledWith(101, 20);
    expect(paletteRepository.deductPaletteLotQuantity).toHaveBeenCalledWith(102, 15);
    expect(pickingListRepository.updateStatus).toHaveBeenCalledWith(1, PickingListStatus.COMPLETED);
  });

  it("should complete picking list with some skipped items", async () => {
    const pickingList = createMockPickingList(PickingListStatus.IN_PROGRESS, [
      { id: 1, productId: 10, requestedQuantity: 20 },
      { id: 2, productId: 20, requestedQuantity: 15 },
    ]);
    pickingListRepository.findById.mockResolvedValue(pickingList);
    paletteRepository.getPaletteLotsByProductIdsForFefo.mockResolvedValue([
      createMockPaletteLotData(101, 10),
      createMockPaletteLotData(102, 20),
    ]);

    const input: CompletePickingListInput = {
      pickingListId: 1,
      items: [
        { pickingListItemId: 1, paletteLotId: 101, status: "picked", pickedQuantity: 20 },
        { pickingListItemId: 2, paletteLotId: 102, status: "skipped", pickedQuantity: 0 },
      ],
    };

    const result = await useCase.execute(input);

    expect(result.totalItemsPicked).toBe(1);
    expect(result.totalItemsSkipped).toBe(1);
    expect(result.deductions).toHaveLength(1);
    expect(result.discrepancies).toHaveLength(1);
    expect(result.discrepancies[0].reason).toBe("Item skipped — not found at location");
    expect(paletteRepository.deductPaletteLotQuantity).toHaveBeenCalledTimes(1);
    expect(paletteRepository.deductPaletteLotQuantity).toHaveBeenCalledWith(101, 20);
  });

  it("should throw PickingListNotFoundError for non-existent picking list", async () => {
    pickingListRepository.findById.mockResolvedValue(null);

    const input: CompletePickingListInput = {
      pickingListId: 999,
      items: [{ pickingListItemId: 1, paletteLotId: 101, status: "picked", pickedQuantity: 10 }],
    };

    await expect(useCase.execute(input)).rejects.toThrow(PickingListNotFoundError);
  });

  it("should throw PickingListAlreadyCompletedError for COMPLETED status", async () => {
    const pickingList = createMockPickingList(PickingListStatus.COMPLETED, []);
    pickingListRepository.findById.mockResolvedValue(pickingList);

    const input: CompletePickingListInput = {
      pickingListId: 1,
      items: [{ pickingListItemId: 1, paletteLotId: 101, status: "picked", pickedQuantity: 10 }],
    };

    await expect(useCase.execute(input)).rejects.toThrow(PickingListAlreadyCompletedError);
  });

  it("should throw PickingListAlreadyCancelledError for CANCELLED status", async () => {
    const pickingList = createMockPickingList(PickingListStatus.CANCELLED, []);
    pickingListRepository.findById.mockResolvedValue(pickingList);

    const input: CompletePickingListInput = {
      pickingListId: 1,
      items: [{ pickingListItemId: 1, paletteLotId: 101, status: "picked", pickedQuantity: 10 }],
    };

    await expect(useCase.execute(input)).rejects.toThrow(PickingListAlreadyCancelledError);
  });

  it("should report discrepancies for skipped items", async () => {
    const pickingList = createMockPickingList(PickingListStatus.IN_PROGRESS, [
      { id: 1, productId: 10, requestedQuantity: 20 },
    ]);
    pickingListRepository.findById.mockResolvedValue(pickingList);
    paletteRepository.getPaletteLotsByProductIdsForFefo.mockResolvedValue([
      createMockPaletteLotData(101, 10),
    ]);

    const input: CompletePickingListInput = {
      pickingListId: 1,
      items: [
        { pickingListItemId: 1, paletteLotId: 101, status: "skipped", pickedQuantity: 0 },
      ],
    };

    const result = await useCase.execute(input);

    expect(result.discrepancies).toHaveLength(1);
    expect(result.discrepancies[0]).toMatchObject({
      pickingListItemId: 1,
      productName: "Product 10",
      palettierName: "Cold Storage A",
      reason: "Item skipped — not found at location",
    });
  });

  it("should handle modified quantities (pickedQuantity < requestedQuantity)", async () => {
    const pickingList = createMockPickingList(PickingListStatus.IN_PROGRESS, [
      { id: 1, productId: 10, requestedQuantity: 20 },
    ]);
    pickingListRepository.findById.mockResolvedValue(pickingList);
    paletteRepository.getPaletteLotsByProductIdsForFefo.mockResolvedValue([
      createMockPaletteLotData(101, 10),
    ]);

    const input: CompletePickingListInput = {
      pickingListId: 1,
      items: [
        { pickingListItemId: 1, paletteLotId: 101, status: "picked", pickedQuantity: 10 },
      ],
    };

    const result = await useCase.execute(input);

    expect(result.deductions[0].quantityDeducted).toBe(10);
    expect(paletteRepository.deductPaletteLotQuantity).toHaveBeenCalledWith(101, 10);
    expect(pickingListRepository.updateItems).toHaveBeenCalledWith(1, [
      { id: 1, status: PickingListItemStatus.PICKED, pickedQuantity: 10 },
    ]);
  });

  it("should handle all items skipped — no deductions, status COMPLETED", async () => {
    const pickingList = createMockPickingList(PickingListStatus.IN_PROGRESS, [
      { id: 1, productId: 10, requestedQuantity: 20 },
      { id: 2, productId: 20, requestedQuantity: 15 },
    ]);
    pickingListRepository.findById.mockResolvedValue(pickingList);
    paletteRepository.getPaletteLotsByProductIdsForFefo.mockResolvedValue([
      createMockPaletteLotData(101, 10),
      createMockPaletteLotData(102, 20),
    ]);

    const input: CompletePickingListInput = {
      pickingListId: 1,
      items: [
        { pickingListItemId: 1, paletteLotId: 101, status: "skipped", pickedQuantity: 0 },
        { pickingListItemId: 2, paletteLotId: 102, status: "skipped", pickedQuantity: 0 },
      ],
    };

    const result = await useCase.execute(input);

    expect(result.status).toBe(PickingListStatus.COMPLETED);
    expect(result.totalItemsPicked).toBe(0);
    expect(result.totalItemsSkipped).toBe(2);
    expect(result.deductions).toHaveLength(0);
    expect(result.discrepancies).toHaveLength(2);
    expect(paletteRepository.deductPaletteLotQuantity).not.toHaveBeenCalled();
    expect(pickingListRepository.updateStatus).toHaveBeenCalledWith(1, PickingListStatus.COMPLETED);
  });
});
