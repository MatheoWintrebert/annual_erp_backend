import { Test, TestingModule } from "@nestjs/testing";
import { DashboardController } from "./dashboard.controller";
import {
  GetDashboardAlertsUseCase,
  GetDashboardSummaryUseCase,
} from "@application/use-cases";
import type { DashboardAlerts, DashboardSummary } from "@domain/types";

describe("DashboardController", () => {
  let controller: DashboardController;
  let getDashboardAlertsExecuteMock: jest.Mock;
  let getDashboardSummaryExecuteMock: jest.Mock;

  beforeEach(async () => {
    getDashboardAlertsExecuteMock = jest.fn();
    getDashboardSummaryExecuteMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: GetDashboardAlertsUseCase,
          useValue: { execute: getDashboardAlertsExecuteMock },
        },
        {
          provide: GetDashboardSummaryUseCase,
          useValue: { execute: getDashboardSummaryExecuteMock },
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it("should return 200 with expiry and low-stock alerts", async () => {
    const mockAlerts: DashboardAlerts = {
      expiryAlerts: [
        {
          productId: 1,
          productName: "Whole Milk",
          productReference: "WM-001",
          totalQuantity: 120,
          unitOfMeasureName: "units",
          nearestExpiryDate: new Date("2026-02-20T00:00:00.000Z"),
          daysRemaining: 4,
          expiryAlertThreshold: 7,
          severity: "critical",
        },
      ],
      lowStockAlerts: [
        {
          productId: 5,
          productName: "Mounting Brackets",
          productReference: "MB-005",
          currentQuantity: 15,
          minimumStock: 50,
          deficit: 35,
          unitOfMeasureName: "units",
        },
      ],
    };

    getDashboardAlertsExecuteMock.mockResolvedValue(mockAlerts);

    const result = await controller.getAlerts();

    expect(result.expiryAlerts).toHaveLength(1);
    expect(result.expiryAlerts[0].productName).toBe("Whole Milk");
    expect(result.expiryAlerts[0].nearestExpiryDate).toBe(
      "2026-02-20T00:00:00.000Z"
    );
    expect(result.expiryAlerts[0].severity).toBe("critical");
    expect(result.lowStockAlerts).toHaveLength(1);
    expect(result.lowStockAlerts[0].productName).toBe("Mounting Brackets");
    expect(result.lowStockAlerts[0].deficit).toBe(35);
  });

  it("should return 200 with empty arrays when no alerts", async () => {
    const mockAlerts: DashboardAlerts = {
      expiryAlerts: [],
      lowStockAlerts: [],
    };

    getDashboardAlertsExecuteMock.mockResolvedValue(mockAlerts);

    const result = await controller.getAlerts();

    expect(result.expiryAlerts).toHaveLength(0);
    expect(result.lowStockAlerts).toHaveLength(0);
  });

  it("should return 200 with stock, intake, and setup data", async () => {
    const mockSummary: DashboardSummary = {
      stock: {
        totalPalettes: 42,
        totalProducts: 15,
        totalCapacity: 200,
        capacityUtilization: 0.21,
      },
      intake: {
        palettesReceivedToday: 5,
        palettesReceivedYesterday: 3,
        trend: "increasing",
      },
      setup: {
        hasPalettiers: true,
        hasProducts: true,
        hasRules: true,
        hasStock: true,
        completedSteps: 4,
        totalSteps: 4,
      },
    };

    getDashboardSummaryExecuteMock.mockResolvedValue(mockSummary);

    const result = await controller.getSummary();

    expect(result.stock.totalPalettes).toBe(42);
    expect(result.stock.totalProducts).toBe(15);
    expect(result.stock.capacityUtilization).toBe(0.21);
    expect(result.intake.trend).toBe("increasing");
    expect(result.setup.completedSteps).toBe(4);
  });

  it("should return 200 with zero values when no data exists", async () => {
    const mockSummary: DashboardSummary = {
      stock: {
        totalPalettes: 0,
        totalProducts: 0,
        totalCapacity: 0,
        capacityUtilization: 0,
      },
      intake: {
        palettesReceivedToday: 0,
        palettesReceivedYesterday: 0,
        trend: "stable",
      },
      setup: {
        hasPalettiers: false,
        hasProducts: false,
        hasRules: false,
        hasStock: false,
        completedSteps: 0,
        totalSteps: 4,
      },
    };

    getDashboardSummaryExecuteMock.mockResolvedValue(mockSummary);

    const result = await controller.getSummary();

    expect(result.stock.totalPalettes).toBe(0);
    expect(result.stock.capacityUtilization).toBe(0);
    expect(result.intake.trend).toBe("stable");
    expect(result.setup.completedSteps).toBe(0);
    expect(result.setup.totalSteps).toBe(4);
  });
});
