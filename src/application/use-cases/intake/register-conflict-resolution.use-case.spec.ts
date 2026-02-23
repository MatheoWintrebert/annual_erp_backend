import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import {
  RegisterConflictResolutionUseCase,
  RegisterConflictResolutionInput,
} from "./register-conflict-resolution.use-case";
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

const mockPalettier1 = new PalettierEntity({
  id: 1,
  name: "Cold Storage A",
  palettierTypeId: 2,
  width: 3,
  depth: 2,
  height: 2,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});

const mockPalettier2 = new PalettierEntity({
  id: 2,
  name: "Dry Storage B",
  palettierTypeId: 1,
  width: 3,
  depth: 2,
  height: 2,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});

const mockProduct1 = new ProductEntity({
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

const mockPalette1 = new PaletteEntity({
  id: 42,
  palettierId: 1,
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});

const mockPalette2 = new PaletteEntity({
  id: 43,
  palettierId: 2,
  positionX: 1,
  positionY: 0,
  positionZ: 0,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});

const mockLot1 = new LotEntity({
  id: 1,
  productId: 1,
  reference: "LOT-20260210-0001",
  supplierName: "",
  totalQuantity: 10,
  arrivalDate: now,
  expirationDate: null,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});

const mockLot2 = new LotEntity({
  id: 2,
  productId: 2,
  reference: "LOT-20260210-0002",
  supplierName: "",
  totalQuantity: 20,
  arrivalDate: now,
  expirationDate: null,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});

const mockPaletteLot1 = new PaletteLotEntity({
  id: 1,
  paletteId: 42,
  lotId: 1,
  quantity: 10,
  createdAt: now,
  updatedAt: now,
});

const mockPaletteLot2 = new PaletteLotEntity({
  id: 2,
  paletteId: 43,
  lotId: 2,
  quantity: 20,
  createdAt: now,
  updatedAt: now,
});

describe("RegisterConflictResolutionUseCase", () => {
  let useCase: RegisterConflictResolutionUseCase;
  let mockProductRepo: Record<string, jest.Mock>;
  let mockPalettierRepo: Record<string, jest.Mock>;
  let mockPaletteRepo: Record<string, jest.Mock>;
  let mockLotRepo: Record<string, jest.Mock>;
  let mockPaletteLotRepo: Record<string, jest.Mock>;
  let mockDataSource: { transaction: jest.Mock };

  const defaultInput: RegisterConflictResolutionInput = {
    groups: [
      {
        palettierId: 1,
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        items: [
          {
            productId: 1,
            lotReference: null,
            expiryDate: null,
            quantity: 10,
          },
        ],
      },
      {
        palettierId: 2,
        positionX: 1,
        positionY: 0,
        positionZ: 0,
        items: [
          {
            productId: 2,
            lotReference: null,
            expiryDate: null,
            quantity: 20,
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    mockProductRepo = {
      findByIds: jest.fn().mockResolvedValue([
        { product: mockProduct1, ruleIds: [] },
        { product: mockProduct2, ruleIds: [] },
      ]),
    };
    mockPalettierRepo = {
      findByIds: jest
        .fn()
        .mockResolvedValue([mockPalettier1, mockPalettier2]),
    };
    mockPaletteRepo = {
      findOccupiedPositionsByPalettierIds: jest
        .fn()
        .mockResolvedValue(new Map()),
      create: jest
        .fn()
        .mockResolvedValueOnce(mockPalette1)
        .mockResolvedValueOnce(mockPalette2),
    };
    mockLotRepo = {
      create: jest
        .fn()
        .mockResolvedValueOnce(mockLot1)
        .mockResolvedValueOnce(mockLot2),
      generateReference: jest
        .fn()
        .mockResolvedValueOnce("LOT-20260210-0001")
        .mockResolvedValueOnce("LOT-20260210-0002"),
    };
    mockPaletteLotRepo = {
      create: jest
        .fn()
        .mockResolvedValueOnce(mockPaletteLot1)
        .mockResolvedValueOnce(mockPaletteLot2),
    };

    // Transaction mock: executes the callback immediately (no real DB)
    mockDataSource = {
      transaction: jest.fn().mockImplementation(
        async <T>(fn: (manager: unknown) => Promise<T>): Promise<T> =>
          fn({})
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterConflictResolutionUseCase,
        { provide: ProductRepository, useValue: mockProductRepo },
        { provide: PalettierRepository, useValue: mockPalettierRepo },
        { provide: PaletteRepository, useValue: mockPaletteRepo },
        { provide: LotRepository, useValue: mockLotRepo },
        { provide: PaletteLotRepository, useValue: mockPaletteLotRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    useCase = module.get<RegisterConflictResolutionUseCase>(
      RegisterConflictResolutionUseCase
    );
  });

  it("should successfully register 2 groups with 2 separate palettes", async () => {
    const result = await useCase.execute(defaultInput);

    expect(result.palettes).toHaveLength(2);
    expect(result.palettes[0].palette).toEqual(mockPalette1);
    expect(result.palettes[0].palettierName).toBe("Cold Storage A");
    expect(result.palettes[0].items).toHaveLength(1);
    expect(result.palettes[0].items[0].productName).toBe("Widget A");
    expect(result.palettes[1].palette).toEqual(mockPalette2);
    expect(result.palettes[1].palettierName).toBe("Dry Storage B");
    expect(result.palettes[1].items).toHaveLength(1);
    expect(result.palettes[1].items[0].productName).toBe("Widget B");

    expect(mockPaletteRepo.create).toHaveBeenCalledTimes(2);
    expect(mockLotRepo.create).toHaveBeenCalledTimes(2);
    expect(mockPaletteLotRepo.create).toHaveBeenCalledTimes(2);
  });

  it("should throw PalettierNotFoundError when palettier not found for one group", async () => {
    mockPalettierRepo.findByIds.mockResolvedValue([mockPalettier1]);

    await expect(useCase.execute(defaultInput)).rejects.toThrow(
      PalettierNotFoundError
    );
  });

  it("should throw PositionOccupiedError when position occupied for one group", async () => {
    mockPaletteRepo.findOccupiedPositionsByPalettierIds.mockResolvedValue(
      new Map([
        [2, [{ positionX: 1, positionY: 0, positionZ: 0 }]],
      ])
    );

    await expect(useCase.execute(defaultInput)).rejects.toThrow(
      PositionOccupiedError
    );
  });

  it("should throw PositionOutOfBoundsError when position out of bounds", async () => {
    const outOfBoundsInput: RegisterConflictResolutionInput = {
      groups: [
        { ...defaultInput.groups[0], positionX: 99 },
        defaultInput.groups[1],
      ],
    };

    await expect(useCase.execute(outOfBoundsInput)).rejects.toThrow(
      PositionOutOfBoundsError
    );
  });

  it("should throw PositionOccupiedError when two groups target same position", async () => {
    const samePositionInput: RegisterConflictResolutionInput = {
      groups: [
        defaultInput.groups[0],
        { ...defaultInput.groups[1], palettierId: 1, positionX: 0, positionY: 0, positionZ: 0 },
      ],
    };

    await expect(useCase.execute(samePositionInput)).rejects.toThrow(
      PositionOccupiedError
    );
  });

  it("should throw ProductNotFoundError when product not found", async () => {
    mockProductRepo.findByIds.mockResolvedValue([
      { product: mockProduct1, ruleIds: [] },
    ]);

    await expect(useCase.execute(defaultInput)).rejects.toThrow(
      ProductNotFoundError
    );
  });

  it("should handle multiple items per group with lot generation for each", async () => {
    const mockProduct3 = new ProductEntity({
      id: 3,
      reference: "REF-003",
      name: "Widget C",
      unitOfMeasureId: 1,
      categoryId: 10,
      minimumStock: null,
      expiryAlertThreshold: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

    const mockLot3 = new LotEntity({
      id: 3,
      productId: 3,
      reference: "LOT-20260210-0003",
      supplierName: "",
      totalQuantity: 5,
      arrivalDate: now,
      expirationDate: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

    const mockPaletteLot3 = new PaletteLotEntity({
      id: 3,
      paletteId: 42,
      lotId: 3,
      quantity: 5,
      createdAt: now,
      updatedAt: now,
    });

    mockProductRepo.findByIds.mockResolvedValue([
      { product: mockProduct1, ruleIds: [] },
      { product: mockProduct2, ruleIds: [] },
      { product: mockProduct3, ruleIds: [] },
    ]);

    mockLotRepo.create
      .mockReset()
      .mockResolvedValueOnce(mockLot1)
      .mockResolvedValueOnce(mockLot3)
      .mockResolvedValueOnce(mockLot2);
    mockLotRepo.generateReference
      .mockReset()
      .mockResolvedValueOnce("LOT-20260210-0001")
      .mockResolvedValueOnce("LOT-20260210-0003")
      .mockResolvedValueOnce("LOT-20260210-0002");
    mockPaletteLotRepo.create
      .mockReset()
      .mockResolvedValueOnce(mockPaletteLot1)
      .mockResolvedValueOnce(mockPaletteLot3)
      .mockResolvedValueOnce(mockPaletteLot2);
    mockPaletteRepo.create
      .mockReset()
      .mockResolvedValueOnce(mockPalette1)
      .mockResolvedValueOnce(mockPalette2);

    const multiItemInput: RegisterConflictResolutionInput = {
      groups: [
        {
          palettierId: 1,
          positionX: 0,
          positionY: 0,
          positionZ: 0,
          items: [
            { productId: 1, lotReference: null, expiryDate: null, quantity: 10 },
            { productId: 3, lotReference: null, expiryDate: null, quantity: 5 },
          ],
        },
        {
          palettierId: 2,
          positionX: 1,
          positionY: 0,
          positionZ: 0,
          items: [
            { productId: 2, lotReference: null, expiryDate: null, quantity: 20 },
          ],
        },
      ],
    };

    const result = await useCase.execute(multiItemInput);

    expect(result.palettes).toHaveLength(2);
    expect(result.palettes[0].items).toHaveLength(2);
    expect(result.palettes[0].items[0].productName).toBe("Widget A");
    expect(result.palettes[0].items[1].productName).toBe("Widget C");
    expect(result.palettes[1].items).toHaveLength(1);
    expect(mockLotRepo.create).toHaveBeenCalledTimes(3);
    expect(mockPaletteLotRepo.create).toHaveBeenCalledTimes(3);
  });

  it("should use provided lotReference instead of generating one", async () => {
    const inputWithLotRef: RegisterConflictResolutionInput = {
      groups: [
        {
          palettierId: 1,
          positionX: 0,
          positionY: 0,
          positionZ: 0,
          items: [
            {
              productId: 1,
              lotReference: "CUSTOM-LOT-001",
              expiryDate: null,
              quantity: 10,
            },
          ],
        },
        {
          palettierId: 2,
          positionX: 1,
          positionY: 0,
          positionZ: 0,
          items: [
            {
              productId: 2,
              lotReference: null,
              expiryDate: null,
              quantity: 20,
            },
          ],
        },
      ],
    };

    await useCase.execute(inputWithLotRef);

    // First item used provided reference, second was auto-generated
    expect(mockLotRepo.generateReference).toHaveBeenCalledTimes(1);
    expect(mockLotRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ reference: "CUSTOM-LOT-001" }),
      expect.anything()
    );
  });

  it("should parse expiryDate string into Date when provided", async () => {
    const inputWithExpiry: RegisterConflictResolutionInput = {
      groups: [
        {
          palettierId: 1,
          positionX: 0,
          positionY: 0,
          positionZ: 0,
          items: [
            {
              productId: 1,
              lotReference: null,
              expiryDate: "2026-12-31",
              quantity: 10,
            },
          ],
        },
        defaultInput.groups[1],
      ],
    };

    await useCase.execute(inputWithExpiry);

    expect(mockLotRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        expirationDate: expect.any(Date) as Date,
      }),
      expect.anything()
    );
  });

  it("should wrap creation in a transaction", async () => {
    await useCase.execute(defaultInput);

    expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
  });
});
