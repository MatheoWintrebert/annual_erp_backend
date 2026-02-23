import { Injectable } from "@nestjs/common";
import type { ExpiryAlertItem, LowStockAlertItem } from "@domain/types";

export interface ProductWithExpiryThreshold {
  id: number;
  name: string;
  reference: string;
  expiryAlertThreshold: number;
  unitOfMeasureName: string;
}

export interface ProductWithStockThreshold {
  id: number;
  name: string;
  reference: string;
  minimumStock: number;
  unitOfMeasureName: string;
}

export interface StockWithExpiry {
  productId: number;
  lotId: number;
  quantity: number;
  expiryDate: Date | null;
}

export interface StockQuantity {
  productId: number;
  totalQuantity: number;
}

@Injectable()
export class AlertEvaluationService {
  evaluateExpiryAlerts(
    products: ProductWithExpiryThreshold[],
    stockWithExpiry: StockWithExpiry[],
    currentDate: Date
  ): ExpiryAlertItem[] {
    const stockByProduct = new Map<number, StockWithExpiry[]>();
    for (const stock of stockWithExpiry) {
      const existing = stockByProduct.get(stock.productId) ?? [];
      existing.push(stock);
      stockByProduct.set(stock.productId, existing);
    }

    const alerts: ExpiryAlertItem[] = [];

    for (const product of products) {
      const productStock = stockByProduct.get(product.id) ?? [];
      if (productStock.length === 0) {
        continue;
      }

      let nearestExpiryDate: Date | null = null;
      let totalQuantity = 0;

      for (const stock of productStock) {
        totalQuantity += stock.quantity;

        if (stock.expiryDate !== null) {
          if (nearestExpiryDate === null || stock.expiryDate < nearestExpiryDate) {
            nearestExpiryDate = stock.expiryDate;
          }
        }
      }

      if (nearestExpiryDate === null) {
        continue;
      }

      const daysRemaining = this.calculateDaysRemaining(nearestExpiryDate, currentDate);

      if (daysRemaining > product.expiryAlertThreshold) {
        continue;
      }

      const severity = this.calculateSeverity(daysRemaining, product.expiryAlertThreshold);

      alerts.push({
        productId: product.id,
        productName: product.name,
        productReference: product.reference,
        totalQuantity,
        unitOfMeasureName: product.unitOfMeasureName,
        nearestExpiryDate,
        daysRemaining,
        expiryAlertThreshold: product.expiryAlertThreshold,
        severity,
      });
    }

    alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);

    return alerts;
  }

  evaluateLowStockAlerts(
    products: ProductWithStockThreshold[],
    stockQuantities: StockQuantity[]
  ): LowStockAlertItem[] {
    const quantityByProduct = new Map<number, number>();
    for (const stock of stockQuantities) {
      quantityByProduct.set(stock.productId, stock.totalQuantity);
    }

    const alerts: LowStockAlertItem[] = [];

    for (const product of products) {
      const currentQuantity = quantityByProduct.get(product.id) ?? 0;

      if (currentQuantity >= product.minimumStock) {
        continue;
      }

      const deficit = product.minimumStock - currentQuantity;

      alerts.push({
        productId: product.id,
        productName: product.name,
        productReference: product.reference,
        currentQuantity,
        minimumStock: product.minimumStock,
        deficit,
        unitOfMeasureName: product.unitOfMeasureName,
      });
    }

    alerts.sort((a, b) => b.deficit - a.deficit);

    return alerts;
  }

  private calculateDaysRemaining(expiryDate: Date, currentDate: Date): number {
    const expiryStart = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
    const currentStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const diffMs = expiryStart.getTime() - currentStart.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  private calculateSeverity(
    daysRemaining: number,
    threshold: number
  ): "expired" | "critical" | "warning" {
    if (daysRemaining <= 0) {
      return "expired";
    }
    if (daysRemaining <= threshold / 3) {
      return "critical";
    }
    return "warning";
  }
}
