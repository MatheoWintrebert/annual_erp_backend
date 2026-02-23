export interface ExpiryAlertItem {
  productId: number;
  productName: string;
  productReference: string;
  totalQuantity: number;
  unitOfMeasureName: string;
  nearestExpiryDate: Date;
  daysRemaining: number;
  expiryAlertThreshold: number;
  severity: "expired" | "critical" | "warning";
}

export interface LowStockAlertItem {
  productId: number;
  productName: string;
  productReference: string;
  currentQuantity: number;
  minimumStock: number;
  deficit: number;
  unitOfMeasureName: string;
}

export interface DashboardAlerts {
  expiryAlerts: ExpiryAlertItem[];
  lowStockAlerts: LowStockAlertItem[];
}

export interface StockSummary {
  totalPalettes: number;
  totalProducts: number;
  totalCapacity: number;
  capacityUtilization: number;
}

export interface IntakeActivity {
  palettesReceivedToday: number;
  palettesReceivedYesterday: number;
  trend: "increasing" | "decreasing" | "stable";
}

export interface SetupProgress {
  hasPalettiers: boolean;
  hasProducts: boolean;
  hasRules: boolean;
  hasStock: boolean;
  completedSteps: number;
  totalSteps: number;
}

export interface DashboardSummary {
  stock: StockSummary;
  intake: IntakeActivity;
  setup: SetupProgress;
}
