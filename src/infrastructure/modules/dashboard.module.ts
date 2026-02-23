import { Module } from "@nestjs/common";
import { AlertEvaluationService } from "@domain/services";
import {
  GetDashboardAlertsUseCase,
  GetDashboardSummaryUseCase,
} from "@application/use-cases";
import { DashboardController } from "@infrastructure/controllers";
import { ProductModule } from "./product.module";
import { StockModule } from "./stock.module";
import { RuleModule } from "./rule.module";

@Module({
  imports: [ProductModule, StockModule, RuleModule],
  controllers: [DashboardController],
  providers: [
    AlertEvaluationService,
    GetDashboardAlertsUseCase,
    GetDashboardSummaryUseCase,
  ],
})
export class DashboardModule {}
