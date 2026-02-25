import { AlertEvaluationService } from "./alert-evaluation.service";
import type {
  ProductWithExpiryThreshold,
  ProductWithStockThreshold,
  StockWithExpiry,
  StockQuantity,
} from "./alert-evaluation.service";

describe("AlertEvaluationService", () => {
  let service: AlertEvaluationService;
  const currentDate = new Date("2026-02-16");

  beforeEach(() => {
    service = new AlertEvaluationService();
  });

  describe("evaluateExpiryAlerts", () => {
    const makeProduct = (
      overrides: Partial<ProductWithExpiryThreshold> = {}
    ): ProductWithExpiryThreshold => ({
      id: 1,
      name: "Whole Milk",
      reference: "WM-001",
      expiryAlertThreshold: 30,
      unitOfMeasureName: "units",
      ...overrides,
    });

    const makeStock = (
      overrides: Partial<StockWithExpiry> = {}
    ): StockWithExpiry => ({
      productId: 1,
      lotId: 1,
      quantity: 100,
      expiryDate: new Date("2026-03-01"),
      ...overrides,
    });

    it("should return expiry alert when product stock nears expiry threshold", () => {
      const products = [makeProduct({ expiryAlertThreshold: 30 })];
      const stock = [makeStock({ expiryDate: new Date("2026-03-10") })]; // 22 days remaining

      const alerts = service.evaluateExpiryAlerts(products, stock, currentDate);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].productName).toBe("Whole Milk");
      expect(alerts[0].daysRemaining).toBe(22);
      expect(alerts[0].severity).toBe("warning");
    });

    it("should return no expiry alert when stock is outside threshold", () => {
      const products = [makeProduct({ expiryAlertThreshold: 7 })];
      const stock = [makeStock({ expiryDate: new Date("2026-06-01") })]; // far away

      const alerts = service.evaluateExpiryAlerts(products, stock, currentDate);

      expect(alerts).toHaveLength(0);
    });

    it("should return severity expired when daysRemaining <= 0", () => {
      const products = [makeProduct()];
      const stock = [makeStock({ expiryDate: new Date("2026-02-15") })]; // -1 day

      const alerts = service.evaluateExpiryAlerts(products, stock, currentDate);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].severity).toBe("expired");
      expect(alerts[0].daysRemaining).toBe(-1);
    });

    it("should return severity critical when daysRemaining <= threshold / 3", () => {
      const products = [makeProduct({ expiryAlertThreshold: 30 })];
      // threshold / 3 = 10, so 8 days remaining should be critical
      const stock = [makeStock({ expiryDate: new Date("2026-02-24") })]; // 8 days

      const alerts = service.evaluateExpiryAlerts(products, stock, currentDate);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].severity).toBe("critical");
      expect(alerts[0].daysRemaining).toBe(8);
    });

    it("should return severity warning when daysRemaining > threshold / 3 but <= threshold", () => {
      const products = [makeProduct({ expiryAlertThreshold: 30 })];
      // threshold / 3 = 10, so 15 days remaining should be warning
      const stock = [makeStock({ expiryDate: new Date("2026-03-03") })]; // 15 days

      const alerts = service.evaluateExpiryAlerts(products, stock, currentDate);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].severity).toBe("warning");
    });

    it("should aggregate quantity across multiple lots for same product", () => {
      const products = [makeProduct()];
      const stock = [
        makeStock({
          lotId: 1,
          quantity: 50,
          expiryDate: new Date("2026-03-01"),
        }),
        makeStock({
          lotId: 2,
          quantity: 75,
          expiryDate: new Date("2026-03-05"),
        }),
      ];

      const alerts = service.evaluateExpiryAlerts(products, stock, currentDate);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].totalQuantity).toBe(125);
      expect(alerts[0].nearestExpiryDate).toEqual(new Date("2026-03-01"));
    });

    it("should sort expiry alerts by daysRemaining ascending", () => {
      const products = [
        makeProduct({ id: 1, name: "Product A", expiryAlertThreshold: 30 }),
        makeProduct({ id: 2, name: "Product B", expiryAlertThreshold: 30 }),
        makeProduct({ id: 3, name: "Product C", expiryAlertThreshold: 30 }),
      ];
      const stock = [
        makeStock({ productId: 1, expiryDate: new Date("2026-03-10") }), // 22 days
        makeStock({ productId: 2, expiryDate: new Date("2026-02-20") }), // 4 days
        makeStock({ productId: 3, expiryDate: new Date("2026-03-01") }), // 13 days
      ];

      const alerts = service.evaluateExpiryAlerts(products, stock, currentDate);

      expect(alerts).toHaveLength(3);
      expect(alerts[0].productName).toBe("Product B");
      expect(alerts[1].productName).toBe("Product C");
      expect(alerts[2].productName).toBe("Product A");
    });

    it("should ignore products without stock", () => {
      const products = [makeProduct()];
      const stock: StockWithExpiry[] = [];

      const alerts = service.evaluateExpiryAlerts(products, stock, currentDate);

      expect(alerts).toHaveLength(0);
    });

    it("should ignore stock with null expiry date", () => {
      const products = [makeProduct()];
      const stock = [makeStock({ expiryDate: null })];

      const alerts = service.evaluateExpiryAlerts(products, stock, currentDate);

      expect(alerts).toHaveLength(0);
    });

    it("should handle zero stock (quantity 0 with threshold set)", () => {
      const products = [makeProduct()];
      const stock = [
        makeStock({ quantity: 0, expiryDate: new Date("2026-02-20") }),
      ];

      const alerts = service.evaluateExpiryAlerts(products, stock, currentDate);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].totalQuantity).toBe(0);
    });

    it("should use nearest expiry date among multiple lots", () => {
      const products = [makeProduct({ expiryAlertThreshold: 30 })];
      const stock = [
        makeStock({ lotId: 1, expiryDate: new Date("2026-03-15") }),
        makeStock({ lotId: 2, expiryDate: new Date("2026-02-25") }),
        makeStock({ lotId: 3, expiryDate: new Date("2026-04-01") }),
      ];

      const alerts = service.evaluateExpiryAlerts(products, stock, currentDate);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].nearestExpiryDate).toEqual(new Date("2026-02-25"));
      expect(alerts[0].daysRemaining).toBe(9);
    });
  });

  describe("evaluateLowStockAlerts", () => {
    const makeProduct = (
      overrides: Partial<ProductWithStockThreshold> = {}
    ): ProductWithStockThreshold => ({
      id: 1,
      name: "Mounting Brackets",
      reference: "MB-005",
      minimumStock: 50,
      unitOfMeasureName: "units",
      ...overrides,
    });

    const makeQuantity = (
      overrides: Partial<StockQuantity> = {}
    ): StockQuantity => ({
      productId: 1,
      totalQuantity: 30,
      ...overrides,
    });

    it("should return low-stock alert when current quantity < minimum stock", () => {
      const products = [makeProduct()];
      const quantities = [makeQuantity({ totalQuantity: 30 })];

      const alerts = service.evaluateLowStockAlerts(products, quantities);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].productName).toBe("Mounting Brackets");
      expect(alerts[0].currentQuantity).toBe(30);
      expect(alerts[0].deficit).toBe(20);
    });

    it("should return no low-stock alert when quantity >= minimum stock", () => {
      const products = [makeProduct({ minimumStock: 50 })];
      const quantities = [makeQuantity({ totalQuantity: 50 })];

      const alerts = service.evaluateLowStockAlerts(products, quantities);

      expect(alerts).toHaveLength(0);
    });

    it("should calculate deficit correctly", () => {
      const products = [makeProduct({ minimumStock: 100 })];
      const quantities = [makeQuantity({ totalQuantity: 35 })];

      const alerts = service.evaluateLowStockAlerts(products, quantities);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].deficit).toBe(65);
    });

    it("should sort low-stock alerts by deficit descending", () => {
      const products = [
        makeProduct({ id: 1, name: "Product A", minimumStock: 100 }),
        makeProduct({ id: 2, name: "Product B", minimumStock: 50 }),
        makeProduct({ id: 3, name: "Product C", minimumStock: 200 }),
      ];
      const quantities = [
        makeQuantity({ productId: 1, totalQuantity: 80 }), // deficit 20
        makeQuantity({ productId: 2, totalQuantity: 10 }), // deficit 40
        makeQuantity({ productId: 3, totalQuantity: 50 }), // deficit 150
      ];

      const alerts = service.evaluateLowStockAlerts(products, quantities);

      expect(alerts).toHaveLength(3);
      expect(alerts[0].productName).toBe("Product C");
      expect(alerts[0].deficit).toBe(150);
      expect(alerts[1].productName).toBe("Product B");
      expect(alerts[1].deficit).toBe(40);
      expect(alerts[2].productName).toBe("Product A");
      expect(alerts[2].deficit).toBe(20);
    });

    it("should handle product with no active stock at all (quantity 0)", () => {
      const products = [makeProduct({ minimumStock: 50 })];
      const quantities: StockQuantity[] = []; // no stock entries

      const alerts = service.evaluateLowStockAlerts(products, quantities);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].currentQuantity).toBe(0);
      expect(alerts[0].deficit).toBe(50);
    });

    it("should handle zero stock explicitly provided", () => {
      const products = [makeProduct({ minimumStock: 50 })];
      const quantities = [makeQuantity({ totalQuantity: 0 })];

      const alerts = service.evaluateLowStockAlerts(products, quantities);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].currentQuantity).toBe(0);
      expect(alerts[0].deficit).toBe(50);
    });
  });
});
