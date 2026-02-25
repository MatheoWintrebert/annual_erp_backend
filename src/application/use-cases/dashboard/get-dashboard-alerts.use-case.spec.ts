import { GetDashboardAlertsUseCase } from "./get-dashboard-alerts.use-case";
import type { ProductRepository } from "@domain/repositories";
import type { PaletteRepository } from "@domain/repositories";
import { AlertEvaluationService } from "@domain/services";

describe("GetDashboardAlertsUseCase", () => {
  let useCase: GetDashboardAlertsUseCase;
  let productRepository: jest.Mocked<
    Pick<ProductRepository, "findAllWithThresholds">
  >;
  let paletteRepository: jest.Mocked<
    Pick<
      PaletteRepository,
      "getStockWithExpiryByProductIds" | "getStockQuantityByProductIds"
    >
  >;
  let alertEvaluationService: AlertEvaluationService;

  beforeEach(() => {
    productRepository = {
      findAllWithThresholds: jest.fn(),
    };

    paletteRepository = {
      getStockWithExpiryByProductIds: jest.fn(),
      getStockQuantityByProductIds: jest.fn(),
    };

    alertEvaluationService = new AlertEvaluationService();

    useCase = new GetDashboardAlertsUseCase(
      productRepository as unknown as ProductRepository,
      paletteRepository as unknown as PaletteRepository,
      alertEvaluationService
    );
  });

  it("should return expiry alerts for products with approaching expiry", async () => {
    productRepository.findAllWithThresholds.mockResolvedValue([
      {
        id: 1,
        name: "Whole Milk",
        reference: "WM-001",
        minimumStock: null,
        expiryAlertThreshold: 30,
        unitOfMeasureName: "units",
      },
    ]);

    paletteRepository.getStockWithExpiryByProductIds.mockResolvedValue([
      {
        productId: 1,
        lotId: 1,
        quantity: 100,
        expiryDate: new Date("2026-02-20"),
      },
    ]);

    const result = await useCase.execute();

    expect(result.expiryAlerts).toHaveLength(1);
    expect(result.expiryAlerts[0].productName).toBe("Whole Milk");
    expect(result.lowStockAlerts).toHaveLength(0);
  });

  it("should return low-stock alerts for products below minimum", async () => {
    productRepository.findAllWithThresholds.mockResolvedValue([
      {
        id: 1,
        name: "Brackets",
        reference: "BR-001",
        minimumStock: 50,
        expiryAlertThreshold: null,
        unitOfMeasureName: "units",
      },
    ]);

    paletteRepository.getStockQuantityByProductIds.mockResolvedValue([
      { productId: 1, totalQuantity: 15 },
    ]);

    const result = await useCase.execute();

    expect(result.lowStockAlerts).toHaveLength(1);
    expect(result.lowStockAlerts[0].deficit).toBe(35);
    expect(result.expiryAlerts).toHaveLength(0);
  });

  it("should return empty arrays when no thresholds configured", async () => {
    productRepository.findAllWithThresholds.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result.expiryAlerts).toHaveLength(0);
    expect(result.lowStockAlerts).toHaveLength(0);
    expect(
      paletteRepository.getStockWithExpiryByProductIds
    ).not.toHaveBeenCalled();
    expect(
      paletteRepository.getStockQuantityByProductIds
    ).not.toHaveBeenCalled();
  });

  it("should return empty arrays when all stock is healthy", async () => {
    productRepository.findAllWithThresholds.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        reference: "M-001",
        minimumStock: 10,
        expiryAlertThreshold: 7,
        unitOfMeasureName: "L",
      },
    ]);

    paletteRepository.getStockWithExpiryByProductIds.mockResolvedValue([
      {
        productId: 1,
        lotId: 1,
        quantity: 100,
        expiryDate: new Date("2027-01-01"),
      },
    ]);

    paletteRepository.getStockQuantityByProductIds.mockResolvedValue([
      { productId: 1, totalQuantity: 100 },
    ]);

    const result = await useCase.execute();

    expect(result.expiryAlerts).toHaveLength(0);
    expect(result.lowStockAlerts).toHaveLength(0);
  });

  it("should handle mixed alerts (some expiry, some low-stock)", async () => {
    productRepository.findAllWithThresholds.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        reference: "M-001",
        minimumStock: null,
        expiryAlertThreshold: 30,
        unitOfMeasureName: "L",
      },
      {
        id: 2,
        name: "Brackets",
        reference: "BR-001",
        minimumStock: 50,
        expiryAlertThreshold: null,
        unitOfMeasureName: "units",
      },
    ]);

    paletteRepository.getStockWithExpiryByProductIds.mockResolvedValue([
      {
        productId: 1,
        lotId: 1,
        quantity: 50,
        expiryDate: new Date("2026-02-25"),
      },
    ]);

    paletteRepository.getStockQuantityByProductIds.mockResolvedValue([
      { productId: 2, totalQuantity: 10 },
    ]);

    const result = await useCase.execute();

    expect(result.expiryAlerts).toHaveLength(1);
    expect(result.lowStockAlerts).toHaveLength(1);
  });

  it("should call repository methods with correct productIds", async () => {
    productRepository.findAllWithThresholds.mockResolvedValue([
      {
        id: 1,
        name: "Product A",
        reference: "A",
        minimumStock: null,
        expiryAlertThreshold: 30,
        unitOfMeasureName: "units",
      },
      {
        id: 2,
        name: "Product B",
        reference: "B",
        minimumStock: 50,
        expiryAlertThreshold: null,
        unitOfMeasureName: "units",
      },
      {
        id: 3,
        name: "Product C",
        reference: "C",
        minimumStock: 100,
        expiryAlertThreshold: 14,
        unitOfMeasureName: "kg",
      },
    ]);

    paletteRepository.getStockWithExpiryByProductIds.mockResolvedValue([]);
    paletteRepository.getStockQuantityByProductIds.mockResolvedValue([]);

    await useCase.execute();

    expect(
      paletteRepository.getStockWithExpiryByProductIds
    ).toHaveBeenCalledWith([1, 3]);
    expect(paletteRepository.getStockQuantityByProductIds).toHaveBeenCalledWith(
      [2, 3]
    );
  });
});
