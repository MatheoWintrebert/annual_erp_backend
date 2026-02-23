import { ApiProperty } from "@nestjs/swagger";
import type { DashboardSummary } from "@domain/types";

export class StockSummaryDto {
  @ApiProperty({ example: 42 })
  totalPalettes!: number;

  @ApiProperty({ example: 15 })
  totalProducts!: number;

  @ApiProperty({ example: 200 })
  totalCapacity!: number;

  @ApiProperty({ description: "0.0 to 1.0", example: 0.21 })
  capacityUtilization!: number;
}

export class IntakeActivityDto {
  @ApiProperty({ example: 5 })
  palettesReceivedToday!: number;

  @ApiProperty({ example: 3 })
  palettesReceivedYesterday!: number;

  @ApiProperty({ enum: ["increasing", "decreasing", "stable"], example: "increasing" })
  trend!: string;
}

export class SetupProgressDto {
  @ApiProperty({ example: true })
  hasPalettiers!: boolean;

  @ApiProperty({ example: true })
  hasProducts!: boolean;

  @ApiProperty({ example: true })
  hasRules!: boolean;

  @ApiProperty({ example: true })
  hasStock!: boolean;

  @ApiProperty({ example: 4 })
  completedSteps!: number;

  @ApiProperty({ example: 4 })
  totalSteps!: number;
}

export class DashboardSummaryResponseDto {
  @ApiProperty({ type: StockSummaryDto })
  stock!: StockSummaryDto;

  @ApiProperty({ type: IntakeActivityDto })
  intake!: IntakeActivityDto;

  @ApiProperty({ type: SetupProgressDto })
  setup!: SetupProgressDto;

  static fromDomain(summary: DashboardSummary): DashboardSummaryResponseDto {
    const dto = new DashboardSummaryResponseDto();

    const stock = new StockSummaryDto();
    stock.totalPalettes = summary.stock.totalPalettes;
    stock.totalProducts = summary.stock.totalProducts;
    stock.totalCapacity = summary.stock.totalCapacity;
    stock.capacityUtilization = summary.stock.capacityUtilization;
    dto.stock = stock;

    const intake = new IntakeActivityDto();
    intake.palettesReceivedToday = summary.intake.palettesReceivedToday;
    intake.palettesReceivedYesterday = summary.intake.palettesReceivedYesterday;
    intake.trend = summary.intake.trend;
    dto.intake = intake;

    const setup = new SetupProgressDto();
    setup.hasPalettiers = summary.setup.hasPalettiers;
    setup.hasProducts = summary.setup.hasProducts;
    setup.hasRules = summary.setup.hasRules;
    setup.hasStock = summary.setup.hasStock;
    setup.completedSteps = summary.setup.completedSteps;
    setup.totalSteps = summary.setup.totalSteps;
    dto.setup = setup;

    return dto;
  }
}
