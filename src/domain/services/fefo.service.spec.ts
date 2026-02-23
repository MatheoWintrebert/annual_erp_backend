import { FefoService } from "./fefo.service";
import { PaletteRepository } from "@domain/repositories";
import { PaletteLotFefoData, PickRouteInput } from "@domain/types";

describe("FefoService", () => {
  let service: FefoService;
  let paletteRepository: jest.Mocked<PaletteRepository>;

  beforeEach(() => {
    paletteRepository = {
      getPaletteLotsByProductIdsForFefo: jest.fn(),
    } as unknown as jest.Mocked<PaletteRepository>;

    service = new FefoService(paletteRepository);
  });

  function createPaletteLot(
    overrides: Partial<PaletteLotFefoData> = {}
  ): PaletteLotFefoData {
    return {
      paletteLotId: 1,
      paletteId: 1,
      palettierId: 1,
      palettierName: "Cold Storage A",
      positionX: 1,
      positionY: 1,
      positionZ: 1,
      lotId: 1,
      lotReference: "LOT-001",
      expiryDate: new Date("2026-03-01"),
      quantity: 100,
      productId: 1,
      productName: "Whole Milk",
      productReference: "WM-001",
      ...overrides,
    };
  }

  it("should generate a single pick item when product is on one palette", async () => {
    const items: PickRouteInput[] = [{ productId: 1, requestedQuantity: 20 }];
    const itemIds = new Map([[1, 10]]);

    paletteRepository.getPaletteLotsByProductIdsForFefo.mockResolvedValue([
      createPaletteLot({ quantity: 100 }),
    ]);

    const result = await service.generatePickRoute(itemIds, items);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        pickingListItemId: 10,
        productId: 1,
        productName: "Whole Milk",
        quantityToPick: 20,
        palettierName: "Cold Storage A",
      })
    );
  });

  it("should split across multiple palettes in FEFO order (nearest expiry first)", async () => {
    const items: PickRouteInput[] = [{ productId: 1, requestedQuantity: 50 }];
    const itemIds = new Map([[1, 10]]);

    paletteRepository.getPaletteLotsByProductIdsForFefo.mockResolvedValue([
      createPaletteLot({
        paletteLotId: 1,
        paletteId: 5,
        quantity: 30,
        expiryDate: new Date("2026-02-20"),
        lotReference: "LOT-001",
      }),
      createPaletteLot({
        paletteLotId: 2,
        paletteId: 7,
        quantity: 40,
        expiryDate: new Date("2026-03-15"),
        lotReference: "LOT-002",
      }),
    ]);

    const result = await service.generatePickRoute(itemIds, items);

    expect(result).toHaveLength(2);
    expect(result[0].quantityToPick).toBe(30);
    expect(result[0].expiryDate).toEqual(new Date("2026-02-20"));
    expect(result[1].quantityToPick).toBe(20);
    expect(result[1].expiryDate).toEqual(new Date("2026-03-15"));
  });

  it("should handle products with NULL expiry (treated as last in FEFO order)", async () => {
    const items: PickRouteInput[] = [{ productId: 1, requestedQuantity: 25 }];
    const itemIds = new Map([[1, 10]]);

    // The repository returns rows already ordered: non-null first, null last
    paletteRepository.getPaletteLotsByProductIdsForFefo.mockResolvedValue([
      createPaletteLot({
        paletteLotId: 1,
        quantity: 10,
        expiryDate: new Date("2026-03-01"),
      }),
      createPaletteLot({
        paletteLotId: 2,
        paletteId: 2,
        quantity: 50,
        expiryDate: null,
      }),
    ]);

    const result = await service.generatePickRoute(itemIds, items);

    expect(result).toHaveLength(2);
    expect(result[0].quantityToPick).toBe(10);
    expect(result[0].expiryDate).toEqual(new Date("2026-03-01"));
    expect(result[1].quantityToPick).toBe(15);
    expect(result[1].expiryDate).toBeNull();
  });

  it("should handle empty items array (returns empty array)", async () => {
    const result = await service.generatePickRoute(new Map(), []);

    expect(result).toEqual([]);
    expect(
      paletteRepository.getPaletteLotsByProductIdsForFefo
    ).not.toHaveBeenCalled();
  });

  it("should maintain FEFO per product for multi-product route", async () => {
    const items: PickRouteInput[] = [
      { productId: 1, requestedQuantity: 10 },
      { productId: 2, requestedQuantity: 5 },
    ];
    const itemIds = new Map([
      [1, 10],
      [2, 11],
    ]);

    paletteRepository.getPaletteLotsByProductIdsForFefo.mockResolvedValue([
      createPaletteLot({
        paletteLotId: 1,
        productId: 1,
        productName: "Whole Milk",
        quantity: 50,
        expiryDate: new Date("2026-03-01"),
      }),
      createPaletteLot({
        paletteLotId: 2,
        productId: 2,
        productName: "Cable Ties",
        productReference: "CT-100",
        quantity: 30,
        expiryDate: null,
      }),
    ]);

    const result = await service.generatePickRoute(itemIds, items);

    expect(result).toHaveLength(2);
    expect(result[0].productId).toBe(1);
    expect(result[0].quantityToPick).toBe(10);
    expect(result[1].productId).toBe(2);
    expect(result[1].quantityToPick).toBe(5);
  });
});
