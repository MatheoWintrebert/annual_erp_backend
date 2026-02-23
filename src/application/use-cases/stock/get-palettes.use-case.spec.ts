import { Test, TestingModule } from "@nestjs/testing";
import { GetPalettesUseCase } from "./get-palettes.use-case";
import { PaletteRepository } from "@domain/repositories";
import type { PaletteWithDetails } from "@domain/types";

describe("GetPalettesUseCase", () => {
  let useCase: GetPalettesUseCase;
  let findAllWithDetailsMock: jest.Mock;

  const mockDate = new Date("2026-02-10T08:30:00.000Z");

  const createMockPalette = (
    id: number,
    palettierName: string
  ): PaletteWithDetails => ({
    id,
    palettierId: 1,
    palettierName,
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    createdAt: mockDate,
    items: [
      {
        productId: 1,
        productName: "Whole Milk",
        productReference: "WM-001",
        lotReference: "LOT-2026-0842",
        quantity: 40,
        expiryDate: new Date("2026-03-15"),
        unitOfMeasureName: "units",
      },
    ],
  });

  beforeEach(async () => {
    findAllWithDetailsMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPalettesUseCase,
        {
          provide: PaletteRepository,
          useValue: {
            findAllWithDetails: findAllWithDetailsMock,
          },
        },
      ],
    }).compile();

    useCase = module.get<GetPalettesUseCase>(GetPalettesUseCase);
  });

  it("should return all palettes with nested item details", async () => {
    const palettes = [
      createMockPalette(1, "Cold Storage A"),
      createMockPalette(2, "Dry Storage B"),
    ];
    findAllWithDetailsMock.mockResolvedValue(palettes);

    const result = await useCase.execute({});

    expect(result).toEqual(palettes);
    expect(result).toHaveLength(2);
    expect(result[0].items).toHaveLength(1);
    expect(findAllWithDetailsMock).toHaveBeenCalledWith({
      palettierId: undefined,
      productSearch: undefined,
    });
  });

  it("should pass palettierId filter to repository", async () => {
    findAllWithDetailsMock.mockResolvedValue([]);

    await useCase.execute({ palettierId: 5 });

    expect(findAllWithDetailsMock).toHaveBeenCalledWith({
      palettierId: 5,
      productSearch: undefined,
    });
  });

  it("should escape wildcard characters in search input", async () => {
    findAllWithDetailsMock.mockResolvedValue([]);

    await useCase.execute({ search: "100% milk_fresh\\new" });

    expect(findAllWithDetailsMock).toHaveBeenCalledWith({
      palettierId: undefined,
      productSearch: "100\\% milk\\_fresh\\\\new",
    });
  });

  it("should return empty array when no palettes exist", async () => {
    findAllWithDetailsMock.mockResolvedValue([]);

    const result = await useCase.execute({});

    expect(result).toEqual([]);
    expect(findAllWithDetailsMock).toHaveBeenCalledTimes(1);
  });

  it("should not escape search when search is undefined", async () => {
    findAllWithDetailsMock.mockResolvedValue([]);

    await useCase.execute({ search: undefined });

    expect(findAllWithDetailsMock).toHaveBeenCalledWith({
      palettierId: undefined,
      productSearch: undefined,
    });
  });

  it("should pass both filters when provided", async () => {
    findAllWithDetailsMock.mockResolvedValue([]);

    await useCase.execute({ palettierId: 3, search: "milk" });

    expect(findAllWithDetailsMock).toHaveBeenCalledWith({
      palettierId: 3,
      productSearch: "milk",
    });
  });
});
