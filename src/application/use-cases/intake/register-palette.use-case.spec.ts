import { Test, TestingModule } from "@nestjs/testing";
import {
  RegisterPaletteUseCase,
  RegisterPaletteInput,
} from "./register-palette.use-case";
import {
  LotRepository,
  PaletteRepository,
  PaletteLotRepository,
  PalettierRepository,
  ProductRepository,
} from "@domain/repositories";
import {
  LotEntity,
  PaletteEntity,
  PaletteLotEntity,
  PalettierEntity,
  ProductEntity,
} from "@domain/entities";
import {
  PalettierNotFoundError,
  PositionOccupiedError,
  PositionOutOfBoundsError,
  ProductNotFoundError,
} from "@domain/errors";

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
  unitOfMeasureId: 2,
  categoryId: 20,
  minimumStock: null,
  expiryAlertThreshold: null,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});

const mockPalettier = new PalettierEntity({
  id: 1,
  name: "Rack A",
  palettierTypeId: 1,
  width: 3,
  depth: 2,
  height: 2,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});

const mockPalette = new PaletteEntity({
  id: 1,
  palettierId: 1,
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});

const mockLot = new LotEntity({
  id: 1,
  productId: 1,
  reference: "LOT-20260209-0001",
  supplierName: "",
  totalQuantity: 100,
  arrivalDate: now,
  expirationDate: null,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});

const mockLot2 = new LotEntity({
  id: 2,
  productId: 2,
  reference: "LOT-20260209-0002",
  supplierName: "",
  totalQuantity: 50,
  arrivalDate: now,
  expirationDate: null,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});

const mockPaletteLot = new PaletteLotEntity({
  id: 1,
  paletteId: 1,
  lotId: 1,
  quantity: 100,
  createdAt: now,
  updatedAt: now,
});

const mockPaletteLot2 = new PaletteLotEntity({
  id: 2,
  paletteId: 1,
  lotId: 2,
  quantity: 50,
  createdAt: now,
  updatedAt: now,
});

describe("RegisterPaletteUseCase", () => {
  let useCase: RegisterPaletteUseCase;
  let mockProductRepo: Record<string, jest.Mock>;
  let mockPalettierRepo: Record<string, jest.Mock>;
  let mockPaletteRepo: Record<string, jest.Mock>;
  let mockLotRepo: Record<string, jest.Mock>;
  let mockPaletteLotRepo: Record<string, jest.Mock>;

  const defaultInput: RegisterPaletteInput = {
    palettierId: 1,
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    items: [
      {
        productId: 1,
        lotReference: null,
        expiryDate: null,
        quantity: 100,
      },
    ],
  };

  beforeEach(async () => {
    mockProductRepo = {
      findByIds: jest
        .fn()
        .mockResolvedValue([{ product: mockProduct, ruleIds: [] }]),
    };
    mockPalettierRepo = {
      findById: jest.fn().mockResolvedValue(mockPalettier),
    };
    mockPaletteRepo = {
      findByPalettierIdAndPosition: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(mockPalette),
    };
    mockLotRepo = {
      create: jest.fn().mockResolvedValue(mockLot),
      generateReference: jest.fn().mockResolvedValue("LOT-20260209-0001"),
    };
    mockPaletteLotRepo = {
      create: jest.fn().mockResolvedValue(mockPaletteLot),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterPaletteUseCase,
        { provide: ProductRepository, useValue: mockProductRepo },
        { provide: PalettierRepository, useValue: mockPalettierRepo },
        { provide: PaletteRepository, useValue: mockPaletteRepo },
        { provide: LotRepository, useValue: mockLotRepo },
        { provide: PaletteLotRepository, useValue: mockPaletteLotRepo },
      ],
    }).compile();

    useCase = module.get<RegisterPaletteUseCase>(RegisterPaletteUseCase);
  });

  it("should register a palette with a single item and auto-generated lot reference", async () => {
    const result = await useCase.execute(defaultInput);

    expect(result.palette).toEqual(mockPalette);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].lot).toEqual(mockLot);
    expect(result.items[0].paletteLot).toEqual(mockPaletteLot);
    expect(result.items[0].productName).toBe("Widget A");
    expect(result.palettierName).toBe("Rack A");
    expect(mockLotRepo.generateReference).toHaveBeenCalledWith(1);
  });

  it("should register a palette with multiple items", async () => {
    mockProductRepo.findByIds.mockResolvedValue([
      { product: mockProduct, ruleIds: [] },
      { product: mockProduct2, ruleIds: [] },
    ]);
    mockLotRepo.create
      .mockResolvedValueOnce(mockLot)
      .mockResolvedValueOnce(mockLot2);
    mockLotRepo.generateReference
      .mockResolvedValueOnce("LOT-20260209-0001")
      .mockResolvedValueOnce("LOT-20260209-0002");
    mockPaletteLotRepo.create
      .mockResolvedValueOnce(mockPaletteLot)
      .mockResolvedValueOnce(mockPaletteLot2);

    const multiInput: RegisterPaletteInput = {
      ...defaultInput,
      items: [
        { productId: 1, lotReference: null, expiryDate: null, quantity: 100 },
        { productId: 2, lotReference: null, expiryDate: null, quantity: 50 },
      ],
    };

    const result = await useCase.execute(multiInput);

    expect(result.palette).toEqual(mockPalette);
    expect(result.items).toHaveLength(2);
    expect(result.items[0].productName).toBe("Widget A");
    expect(result.items[1].productName).toBe("Widget B");
    expect(mockPaletteRepo.create).toHaveBeenCalledTimes(1);
    expect(mockLotRepo.create).toHaveBeenCalledTimes(2);
    expect(mockPaletteLotRepo.create).toHaveBeenCalledTimes(2);
  });

  it("should use provided lot reference when given", async () => {
    const input: RegisterPaletteInput = {
      ...defaultInput,
      items: [
        {
          productId: 1,
          lotReference: "MANUAL-LOT-001",
          expiryDate: null,
          quantity: 100,
        },
      ],
    };

    await useCase.execute(input);

    expect(mockLotRepo.generateReference).not.toHaveBeenCalled();
    expect(mockLotRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ reference: "MANUAL-LOT-001" })
    );
  });

  it("should throw when product is not found", async () => {
    mockProductRepo.findByIds.mockResolvedValue([]);

    await expect(useCase.execute(defaultInput)).rejects.toThrow(
      ProductNotFoundError
    );
  });

  it("should throw PositionOutOfBoundsError when position exceeds dimensions", async () => {
    const outOfBoundsInput: RegisterPaletteInput = {
      ...defaultInput,
      positionX: 5,
      positionY: 0,
      positionZ: 0,
    };

    await expect(useCase.execute(outOfBoundsInput)).rejects.toThrow(
      PositionOutOfBoundsError
    );
  });

  it("should throw when palettier is not found", async () => {
    mockPalettierRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(defaultInput)).rejects.toThrow(
      PalettierNotFoundError
    );
  });

  it("should throw PositionOccupiedError when position is taken", async () => {
    mockPaletteRepo.findByPalettierIdAndPosition.mockResolvedValue(mockPalette);

    await expect(useCase.execute(defaultInput)).rejects.toThrow(
      PositionOccupiedError
    );
  });

  it("should pass expiry date to lot creation when provided", async () => {
    const input: RegisterPaletteInput = {
      ...defaultInput,
      items: [
        {
          productId: 1,
          lotReference: null,
          expiryDate: "2026-12-31",
          quantity: 100,
        },
      ],
    };

    await useCase.execute(input);

    expect(mockLotRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        expirationDate: new Date("2026-12-31"),
      })
    );
  });
});
