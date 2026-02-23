import { Test, TestingModule } from "@nestjs/testing";
import { DeletePalettierUseCase } from "./delete-palettier.use-case";
import { PalettierRepository } from "@domain/repositories";
import { PalettierEntity } from "@domain/entities";
import { NotFoundError, ValidationError } from "@domain/errors";
import { ErrorCode } from "@domain/types";

describe("DeletePalettierUseCase", () => {
  let useCase: DeletePalettierUseCase;
  let findByIdMock: jest.Mock;
  let deleteMock: jest.Mock;
  let countPalettesMock: jest.Mock;

  const createMockPalettier = (id: number): PalettierEntity =>
    new PalettierEntity({
      id,
      name: `Palettier ${String(id)}`,
      palettierTypeId: 1,
      width: 5,
      depth: 3,
      height: 4,
      createdAt: new Date("2024-01-15T10:30:00.000Z"),
      updatedAt: new Date("2024-01-20T14:45:00.000Z"),
      deletedAt: null,
    });

  beforeEach(async () => {
    findByIdMock = jest.fn();
    deleteMock = jest.fn();
    countPalettesMock = jest.fn();

    const mockRepository = {
      findById: findByIdMock,
      findAll: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: deleteMock,
      countPalettesByPalettierId: countPalettesMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePalettierUseCase,
        {
          provide: PalettierRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeletePalettierUseCase>(DeletePalettierUseCase);
  });

  describe("execute", () => {
    it("should delete palettier when it exists and has no palettes", async () => {
      // Arrange
      const palettier = createMockPalettier(1);
      findByIdMock.mockResolvedValue(palettier);
      countPalettesMock.mockResolvedValue(0);
      deleteMock.mockResolvedValue(undefined);

      // Act
      await useCase.execute({ id: 1 });

      // Assert
      expect(findByIdMock).toHaveBeenCalledWith(1);
      expect(countPalettesMock).toHaveBeenCalledWith(1);
      expect(deleteMock).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundError when palettier does not exist", async () => {
      // Arrange
      findByIdMock.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute({ id: 999 })).rejects.toThrow(NotFoundError);
      await expect(useCase.execute({ id: 999 })).rejects.toThrow(
        "Palettier with ID 999 not found"
      );
      expect(deleteMock).not.toHaveBeenCalled();
    });

    it("should throw ValidationError when palettier contains palettes", async () => {
      // Arrange
      const palettier = createMockPalettier(1);
      findByIdMock.mockResolvedValue(palettier);
      countPalettesMock.mockResolvedValue(5);

      // Act & Assert
      const error = await useCase
        .execute({ id: 1 })
        .catch((e: unknown) => e as ValidationError);

      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).code).toBe(
        ErrorCode.DELETION_BLOCKED_PALETTES_EXIST
      );
      expect((error as ValidationError).message).toContain("5 palettes");
      expect((error as ValidationError).details).toEqual({
        palettierName: "Palettier 1",
        paletteCount: 5,
      });
      expect(deleteMock).not.toHaveBeenCalled();
    });

    it("should throw ValidationError with singular form for single palette", async () => {
      // Arrange
      const palettier = createMockPalettier(2);
      findByIdMock.mockResolvedValue(palettier);
      countPalettesMock.mockResolvedValue(1);

      // Act & Assert
      const error = await useCase
        .execute({ id: 2 })
        .catch((e: unknown) => e as ValidationError);

      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).message).toContain("1 palette");
      expect((error as ValidationError).message).not.toContain("1 palettes");
    });
  });
});
