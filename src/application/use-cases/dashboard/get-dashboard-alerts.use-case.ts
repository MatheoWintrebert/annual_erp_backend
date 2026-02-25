import { Injectable } from "@nestjs/common";
import type { QueryUseCase, DashboardAlerts } from "@domain/types";
import { ProductRepository } from "@domain/repositories";
import { PaletteRepository } from "@domain/repositories";
import {
  AlertEvaluationService,
  type ProductWithExpiryThreshold,
  type ProductWithStockThreshold,
} from "@domain/services";

@Injectable()
export class GetDashboardAlertsUseCase implements QueryUseCase<
  void,
  DashboardAlerts
> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly paletteRepository: PaletteRepository,
    private readonly alertEvaluationService: AlertEvaluationService
  ) {}

  async execute(): Promise<DashboardAlerts> {
    const productsWithThresholds =
      await this.productRepository.findAllWithThresholds();

    if (productsWithThresholds.length === 0) {
      return { expiryAlerts: [], lowStockAlerts: [] };
    }

    const expiryProducts: ProductWithExpiryThreshold[] = [];
    const stockProducts: ProductWithStockThreshold[] = [];
    const expiryProductIds: number[] = [];
    const stockProductIds: number[] = [];

    for (const product of productsWithThresholds) {
      if (product.expiryAlertThreshold !== null) {
        expiryProducts.push({
          id: product.id,
          name: product.name,
          reference: product.reference,
          expiryAlertThreshold: product.expiryAlertThreshold,
          unitOfMeasureName: product.unitOfMeasureName,
        });
        expiryProductIds.push(product.id);
      }

      if (product.minimumStock !== null) {
        stockProducts.push({
          id: product.id,
          name: product.name,
          reference: product.reference,
          minimumStock: product.minimumStock,
          unitOfMeasureName: product.unitOfMeasureName,
        });
        stockProductIds.push(product.id);
      }
    }

    const [stockWithExpiry, stockQuantities] = await Promise.all([
      expiryProductIds.length > 0
        ? this.paletteRepository.getStockWithExpiryByProductIds(
            expiryProductIds
          )
        : Promise.resolve([]),
      stockProductIds.length > 0
        ? this.paletteRepository.getStockQuantityByProductIds(stockProductIds)
        : Promise.resolve([]),
    ]);

    const expiryAlerts = this.alertEvaluationService.evaluateExpiryAlerts(
      expiryProducts,
      stockWithExpiry,
      new Date()
    );

    const lowStockAlerts = this.alertEvaluationService.evaluateLowStockAlerts(
      stockProducts,
      stockQuantities
    );

    return { expiryAlerts, lowStockAlerts };
  }
}
