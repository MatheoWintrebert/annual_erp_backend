import { GetDashboardSummaryUseCase } from "./get-dashboard-summary.use-case";
import type { PaletteRepository, PalettierRepository, ProductRepository, RuleRepository } from "@domain/repositories";

describe("GetDashboardSummaryUseCase", () => {
  let useCase: GetDashboardSummaryUseCase;
  let paletteRepository: jest.Mocked<
    Pick<PaletteRepository, "countActivePalettes" | "countPalettesCreatedBetween">
  >;
  let productRepository: jest.Mocked<Pick<ProductRepository, "countActiveProducts">>;
  let palettierRepository: jest.Mocked<Pick<PalettierRepository, "getCapacitySummary">>;
  let ruleRepository: jest.Mocked<Pick<RuleRepository, "countActiveRules">>;

  beforeEach(() => {
    paletteRepository = {
      countActivePalettes: jest.fn().mockResolvedValue(0),
      countPalettesCreatedBetween: jest.fn().mockResolvedValue(0),
    };

    productRepository = {
      countActiveProducts: jest.fn().mockResolvedValue(0),
    };

    palettierRepository = {
      getCapacitySummary: jest.fn().mockResolvedValue({ count: 0, totalCapacity: 0 }),
    };

    ruleRepository = {
      countActiveRules: jest.fn().mockResolvedValue(0),
    };

    useCase = new GetDashboardSummaryUseCase(
      paletteRepository as unknown as PaletteRepository,
      productRepository as unknown as ProductRepository,
      palettierRepository as unknown as PalettierRepository,
      ruleRepository as unknown as RuleRepository
    );
  });

  it("should return correct stock summary with palettes and products", async () => {
    paletteRepository.countActivePalettes.mockResolvedValue(42);
    productRepository.countActiveProducts.mockResolvedValue(15);
    palettierRepository.getCapacitySummary.mockResolvedValue({ count: 2, totalCapacity: 120 });

    const result = await useCase.execute();

    expect(result.stock.totalPalettes).toBe(42);
    expect(result.stock.totalProducts).toBe(15);
    expect(result.stock.totalCapacity).toBe(120);
    expect(result.stock.capacityUtilization).toBeCloseTo(42 / 120);
  });

  it("should return capacityUtilization = 0 when no palettiers exist", async () => {
    palettierRepository.getCapacitySummary.mockResolvedValue({ count: 0, totalCapacity: 0 });

    const result = await useCase.execute();

    expect(result.stock.totalCapacity).toBe(0);
    expect(result.stock.capacityUtilization).toBe(0);
  });

  it("should return capacityUtilization = 0 when totalCapacity is 0", async () => {
    palettierRepository.getCapacitySummary.mockResolvedValue({ count: 1, totalCapacity: 0 });

    const result = await useCase.execute();

    expect(result.stock.totalCapacity).toBe(0);
    expect(result.stock.capacityUtilization).toBe(0);
  });

  it("should return correct intake counts for today and yesterday", async () => {
    paletteRepository.countPalettesCreatedBetween
      .mockResolvedValueOnce(5) // today
      .mockResolvedValueOnce(3); // yesterday

    const result = await useCase.execute();

    expect(result.intake.palettesReceivedToday).toBe(5);
    expect(result.intake.palettesReceivedYesterday).toBe(3);
  });

  it("should return trend 'increasing' when today > yesterday", async () => {
    paletteRepository.countPalettesCreatedBetween
      .mockResolvedValueOnce(5) // today
      .mockResolvedValueOnce(3); // yesterday

    const result = await useCase.execute();

    expect(result.intake.trend).toBe("increasing");
  });

  it("should return trend 'decreasing' when today < yesterday", async () => {
    paletteRepository.countPalettesCreatedBetween
      .mockResolvedValueOnce(2) // today
      .mockResolvedValueOnce(7); // yesterday

    const result = await useCase.execute();

    expect(result.intake.trend).toBe("decreasing");
  });

  it("should return trend 'stable' when today = yesterday", async () => {
    paletteRepository.countPalettesCreatedBetween
      .mockResolvedValueOnce(4) // today
      .mockResolvedValueOnce(4); // yesterday

    const result = await useCase.execute();

    expect(result.intake.trend).toBe("stable");
  });

  it("should correctly identify completed setup steps", async () => {
    paletteRepository.countActivePalettes.mockResolvedValue(10);
    productRepository.countActiveProducts.mockResolvedValue(5);
    palettierRepository.getCapacitySummary.mockResolvedValue({ count: 1, totalCapacity: 40 });
    ruleRepository.countActiveRules.mockResolvedValue(3);

    const result = await useCase.execute();

    expect(result.setup.hasPalettiers).toBe(true);
    expect(result.setup.hasProducts).toBe(true);
    expect(result.setup.hasRules).toBe(true);
    expect(result.setup.hasStock).toBe(true);
    expect(result.setup.completedSteps).toBe(4);
    expect(result.setup.totalSteps).toBe(4);
  });

  it("should return all zeros gracefully when no data exists", async () => {
    const result = await useCase.execute();

    expect(result.stock.totalPalettes).toBe(0);
    expect(result.stock.totalProducts).toBe(0);
    expect(result.stock.totalCapacity).toBe(0);
    expect(result.stock.capacityUtilization).toBe(0);
    expect(result.intake.palettesReceivedToday).toBe(0);
    expect(result.intake.palettesReceivedYesterday).toBe(0);
    expect(result.intake.trend).toBe("stable");
    expect(result.setup.hasPalettiers).toBe(false);
    expect(result.setup.hasProducts).toBe(false);
    expect(result.setup.hasRules).toBe(false);
    expect(result.setup.hasStock).toBe(false);
    expect(result.setup.completedSteps).toBe(0);
    expect(result.setup.totalSteps).toBe(4);
  });
});
