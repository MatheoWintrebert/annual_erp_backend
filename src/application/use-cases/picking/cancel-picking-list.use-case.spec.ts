import { CancelPickingListUseCase } from "./cancel-picking-list.use-case";
import { PickingListRepository } from "@domain/repositories";
import { PickingListEntity } from "@domain/entities";
import {
  PickingListAlreadyCancelledError,
  PickingListAlreadyCompletedError,
  PickingListNotFoundError,
} from "@domain/errors";
import { PickingListStatus } from "@domain/types";

describe("CancelPickingListUseCase", () => {
  let useCase: CancelPickingListUseCase;
  let pickingListRepository: jest.Mocked<PickingListRepository>;

  const now = new Date();

  const createMockPickingList = (status: PickingListStatus): PickingListEntity =>
    new PickingListEntity({
      id: 1,
      status,
      createdAt: now,
      updatedAt: now,
      items: [],
    });

  beforeEach(() => {
    pickingListRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      updateItems: jest.fn(),
    } as jest.Mocked<PickingListRepository>;

    useCase = new CancelPickingListUseCase(pickingListRepository);
  });

  it("should cancel picking list with CREATED status", async () => {
    const pickingList = createMockPickingList(PickingListStatus.CREATED);
    pickingListRepository.findById.mockResolvedValue(pickingList);

    const result = await useCase.execute(1);

    expect(result.pickingListId).toBe(1);
    expect(result.status).toBe(PickingListStatus.CANCELLED);
    expect(pickingListRepository.updateStatus).toHaveBeenCalledWith(1, PickingListStatus.CANCELLED);
  });

  it("should cancel picking list with IN_PROGRESS status", async () => {
    const pickingList = createMockPickingList(PickingListStatus.IN_PROGRESS);
    pickingListRepository.findById.mockResolvedValue(pickingList);

    const result = await useCase.execute(1);

    expect(result.pickingListId).toBe(1);
    expect(result.status).toBe(PickingListStatus.CANCELLED);
    expect(pickingListRepository.updateStatus).toHaveBeenCalledWith(1, PickingListStatus.CANCELLED);
  });

  it("should throw PickingListNotFoundError for non-existent picking list", async () => {
    pickingListRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(PickingListNotFoundError);
  });

  it("should throw PickingListAlreadyCompletedError for COMPLETED status", async () => {
    const pickingList = createMockPickingList(PickingListStatus.COMPLETED);
    pickingListRepository.findById.mockResolvedValue(pickingList);

    await expect(useCase.execute(1)).rejects.toThrow(PickingListAlreadyCompletedError);
  });

  it("should throw PickingListAlreadyCancelledError for CANCELLED status", async () => {
    const pickingList = createMockPickingList(PickingListStatus.CANCELLED);
    pickingListRepository.findById.mockResolvedValue(pickingList);

    await expect(useCase.execute(1)).rejects.toThrow(PickingListAlreadyCancelledError);
  });

  it("should not call any stock deduction method", async () => {
    const pickingList = createMockPickingList(PickingListStatus.IN_PROGRESS);
    pickingListRepository.findById.mockResolvedValue(pickingList);

    await useCase.execute(1);

    // Verify no stock-related operations were called
    expect(pickingListRepository.updateItems).not.toHaveBeenCalled();
  });
});
