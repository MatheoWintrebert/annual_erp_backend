import { GetAvailableStockUseCase } from "./get-available-stock.use-case";
import { PaletteRepository } from "@domain/repositories";
import { ProductStock } from "@domain/types";

describe("GetAvailableStockUseCase", () => {
  let useCase: GetAvailableStockUseCase;
  let paletteRepository: jest.Mocked<PaletteRepository>;

  beforeEach(() => {
    paletteRepository = {
      getAvailableStockByProductIds: jest.fn(),
    } as unknown as jest.Mocked<PaletteRepository>;

    useCase = new GetAvailableStockUseCase(paletteRepository);
  });

  it("should return available stock for multiple products", async () => {
    const mockStock: ProductStock[] = [
      {
        productId: 1,
        productName: "Whole Milk",
        productReference: "WM-001",
        availableQuantity: 150,
        unitOfMeasureName: "L",
      },
      {
        productId: 2,
        productName: "Cable Ties",
        productReference: "CT-100",
        availableQuantity: 45,
        unitOfMeasureName: "pcs",
      },
    ];

    paletteRepository.getAvailableStockByProductIds.mockResolvedValue(
      mockStock
    );

    const result = await useCase.execute([1, 2]);

    expect(result).toEqual(mockStock);
    expect(
      paletteRepository.getAvailableStockByProductIds
    ).toHaveBeenCalledWith([1, 2]);
  });

  it("should return empty array for empty productIds input", async () => {
    const result = await useCase.execute([]);

    expect(result).toEqual([]);
    expect(
      paletteRepository.getAvailableStockByProductIds
    ).not.toHaveBeenCalled();
  });

  it("should return 0 quantity for products with no stock", async () => {
    const mockStock: ProductStock[] = [
      {
        productId: 1,
        productName: "Whole Milk",
        productReference: "WM-001",
        availableQuantity: 0,
        unitOfMeasureName: "L",
      },
    ];

    paletteRepository.getAvailableStockByProductIds.mockResolvedValue(
      mockStock
    );

    const result = await useCase.execute([1]);

    expect(result).toHaveLength(1);
    expect(result[0].availableQuantity).toBe(0);
  });

  it("should correctly aggregate across multiple palettes", async () => {
    const mockStock: ProductStock[] = [
      {
        productId: 1,
        productName: "Whole Milk",
        productReference: "WM-001",
        availableQuantity: 300,
        unitOfMeasureName: "L",
      },
    ];

    paletteRepository.getAvailableStockByProductIds.mockResolvedValue(
      mockStock
    );

    const result = await useCase.execute([1]);

    expect(result).toHaveLength(1);
    expect(result[0].availableQuantity).toBe(300);
    expect(
      paletteRepository.getAvailableStockByProductIds
    ).toHaveBeenCalledWith([1]);
  });
});
