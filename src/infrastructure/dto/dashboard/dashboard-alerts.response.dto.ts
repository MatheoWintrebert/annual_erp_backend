import { ApiProperty } from "@nestjs/swagger";
import type { DashboardAlerts } from "@domain/types";

export class ExpiryAlertDto {
  @ApiProperty({ example: 1 })
  productId!: number;

  @ApiProperty({ example: "Whole Milk" })
  productName!: string;

  @ApiProperty({ example: "WM-001" })
  productReference!: string;

  @ApiProperty({ example: 120 })
  totalQuantity!: number;

  @ApiProperty({ example: "units" })
  unitOfMeasureName!: string;

  @ApiProperty({ example: "2026-02-20T00:00:00.000Z" })
  nearestExpiryDate!: string;

  @ApiProperty({ example: 4 })
  daysRemaining!: number;

  @ApiProperty({ example: 7 })
  expiryAlertThreshold!: number;

  @ApiProperty({ enum: ["expired", "critical", "warning"], example: "critical" })
  severity!: string;
}

export class LowStockAlertDto {
  @ApiProperty({ example: 5 })
  productId!: number;

  @ApiProperty({ example: "Mounting Brackets" })
  productName!: string;

  @ApiProperty({ example: "MB-005" })
  productReference!: string;

  @ApiProperty({ example: 15 })
  currentQuantity!: number;

  @ApiProperty({ example: 50 })
  minimumStock!: number;

  @ApiProperty({ example: 35 })
  deficit!: number;

  @ApiProperty({ example: "units" })
  unitOfMeasureName!: string;
}

export class DashboardAlertsResponseDto {
  @ApiProperty({ type: [ExpiryAlertDto] })
  expiryAlerts!: ExpiryAlertDto[];

  @ApiProperty({ type: [LowStockAlertDto] })
  lowStockAlerts!: LowStockAlertDto[];

  static fromDomain(alerts: DashboardAlerts): DashboardAlertsResponseDto {
    const dto = new DashboardAlertsResponseDto();
    dto.expiryAlerts = alerts.expiryAlerts.map((a) => ({
      ...a,
      nearestExpiryDate: a.nearestExpiryDate.toISOString(),
    }));
    dto.lowStockAlerts = alerts.lowStockAlerts;
    return dto;
  }
}
