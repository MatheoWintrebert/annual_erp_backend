import { UpdatePalettePositionUseCase } from "./update-palette-position.use-case";
import { PaletteRepository } from "@domain/repositories";
import { PalettierRepository } from "@domain/repositories";
import { PaletteEntity, PalettierEntity } from "@domain/entities";
import {
  PaletteNotFoundError,
  PalettierNotFoundError,
  PositionOutOfBoundsError,
  PositionOccupiedError,
} from "@domain/errors";

describe("UpdatePalettePositionUseCase", () => {
  let useCase: UpdatePalettePositionUseCase;
  let paletteRepository: jest.Mocked<PaletteRepository>;
  let palettierRepository: jest.Mocked<PalettierRepository>;
  let updatePositionMock: jest.Mock;

  const mockPalettier = new PalettierEntity({
    id: 5,
    palettierTypeId: null,
    name: "Rack A",
    width: 3,
    depth: 2,
    height: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const mockPalette = new PaletteEntity({
    id: 42,
    palettierId: 5,
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  beforeEach(() => {
    updatePositionMock = jest.fn();

    paletteRepository = {
      findById: jest.fn(),
      findByPalettierIdAndPosition: jest.fn(),
      updatePosition: updatePositionMock,
    } as unknown as jest.Mocked<PaletteRepository>;

    palettierRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<PalettierRepository>;

    useCase = new UpdatePalettePositionUseCase(
      paletteRepository,
      palettierRepository,
    );
  });

  it("should successfully update position to a free location", async () => {
    paletteRepository.findById.mockResolvedValue(mockPalette);
    palettierRepository.findById.mockResolvedValue(mockPalettier);
    paletteRepository.findByPalettierIdAndPosition.mockResolvedValue(null);
    paletteRepository.updatePosition.mockResolvedValue();

    await useCase.execute({
      paletteId: 42,
      palettierId: 5,
      positionX: 1,
      positionY: 1,
      positionZ: 2,
    });

    expect(updatePositionMock).toHaveBeenCalledWith(42, 5, 1, 1, 2);
  });

  it("should successfully update position to a different palettier", async () => {
    const differentPalettier = new PalettierEntity({
      id: 10,
      palettierTypeId: null,
      name: "Rack B",
      width: 4,
      depth: 3,
      height: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    paletteRepository.findById.mockResolvedValue(mockPalette);
    palettierRepository.findById.mockResolvedValue(differentPalettier);
    paletteRepository.findByPalettierIdAndPosition.mockResolvedValue(null);
    paletteRepository.updatePosition.mockResolvedValue();

    await useCase.execute({
      paletteId: 42,
      palettierId: 10,
      positionX: 2,
      positionY: 1,
      positionZ: 0,
    });

    expect(updatePositionMock).toHaveBeenCalledWith(42, 10, 2, 1, 0);
  });

  it("should throw PaletteNotFoundError when palette doesn't exist", async () => {
    paletteRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        paletteId: 999,
        palettierId: 5,
        positionX: 0,
        positionY: 0,
        positionZ: 0,
      }),
    ).rejects.toThrow(PaletteNotFoundError);
  });

  it("should throw PalettierNotFoundError when target palettier doesn't exist", async () => {
    paletteRepository.findById.mockResolvedValue(mockPalette);
    palettierRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        paletteId: 42,
        palettierId: 999,
        positionX: 0,
        positionY: 0,
        positionZ: 0,
      }),
    ).rejects.toThrow(PalettierNotFoundError);
  });

  it("should throw PositionOutOfBoundsError when position exceeds palettier dimensions", async () => {
    paletteRepository.findById.mockResolvedValue(mockPalette);
    palettierRepository.findById.mockResolvedValue(mockPalettier);

    // mockPalettier dimensions: width=3, depth=2, height=4
    // positionX=3 is out of bounds (0-indexed, max is 2)
    await expect(
      useCase.execute({
        paletteId: 42,
        palettierId: 5,
        positionX: 3,
        positionY: 0,
        positionZ: 0,
      }),
    ).rejects.toThrow(PositionOutOfBoundsError);
  });

  it("should throw PositionOccupiedError when target position is occupied by another palette", async () => {
    const otherPalette = new PaletteEntity({
      id: 99,
      palettierId: 5,
      positionX: 1,
      positionY: 1,
      positionZ: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    paletteRepository.findById.mockResolvedValue(mockPalette);
    palettierRepository.findById.mockResolvedValue(mockPalettier);
    paletteRepository.findByPalettierIdAndPosition.mockResolvedValue(otherPalette);

    await expect(
      useCase.execute({
        paletteId: 42,
        palettierId: 5,
        positionX: 1,
        positionY: 1,
        positionZ: 1,
      }),
    ).rejects.toThrow(PositionOccupiedError);
  });

  it("should allow updating to same position (palette occupies its own spot)", async () => {
    paletteRepository.findById.mockResolvedValue(mockPalette);
    palettierRepository.findById.mockResolvedValue(mockPalettier);
    // Same palette returned — it occupies its own position
    paletteRepository.findByPalettierIdAndPosition.mockResolvedValue(mockPalette);
    paletteRepository.updatePosition.mockResolvedValue();

    await useCase.execute({
      paletteId: 42,
      palettierId: 5,
      positionX: 0,
      positionY: 0,
      positionZ: 0,
    });

    expect(updatePositionMock).toHaveBeenCalledWith(42, 5, 0, 0, 0);
  });

  it("should allow moving within same palettier when new position is free", async () => {
    paletteRepository.findById.mockResolvedValue(mockPalette);
    palettierRepository.findById.mockResolvedValue(mockPalettier);
    paletteRepository.findByPalettierIdAndPosition.mockResolvedValue(null);
    paletteRepository.updatePosition.mockResolvedValue();

    await useCase.execute({
      paletteId: 42,
      palettierId: 5,
      positionX: 2,
      positionY: 0,
      positionZ: 3,
    });

    expect(updatePositionMock).toHaveBeenCalledWith(42, 5, 2, 0, 3);
  });
});
