import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  GetDashboardAlertsUseCase,
  GetDashboardSummaryUseCase,
} from "@application/use-cases";
import {
  DashboardAlertsResponseDto,
  DashboardSummaryResponseDto,
} from "@infrastructure/dto";

@ApiTags("Dashboard")
@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly getDashboardAlertsUseCase: GetDashboardAlertsUseCase,
    private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase
  ) {}

  @Get("alerts")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get dashboard expiry and low-stock alerts" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Dashboard alerts retrieved successfully",
    type: DashboardAlertsResponseDto,
  })
  async getAlerts(): Promise<DashboardAlertsResponseDto> {
    const alerts = await this.getDashboardAlertsUseCase.execute();
    return DashboardAlertsResponseDto.fromDomain(alerts);
  }

  @Get("summary")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "Get dashboard stock summary, intake activity, and setup progress",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Dashboard summary retrieved successfully",
    type: DashboardSummaryResponseDto,
  })
  async getSummary(): Promise<DashboardSummaryResponseDto> {
    const summary = await this.getDashboardSummaryUseCase.execute();
    return DashboardSummaryResponseDto.fromDomain(summary);
  }
}
