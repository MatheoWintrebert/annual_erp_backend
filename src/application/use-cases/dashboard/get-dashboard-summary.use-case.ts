import { Injectable } from "@nestjs/common";
import type { QueryUseCase, DashboardSummary } from "@domain/types";
import {
  PaletteRepository,
  PalettierRepository,
  ProductRepository,
  RuleRepository,
} from "@domain/repositories";

@Injectable()
export class GetDashboardSummaryUseCase
  implements QueryUseCase<void, DashboardSummary>
{
  constructor(
    private readonly paletteRepository: PaletteRepository,
    private readonly productRepository: ProductRepository,
    private readonly palettierRepository: PalettierRepository,
    private readonly ruleRepository: RuleRepository
  ) {}

  async execute(): Promise<DashboardSummary> {
    const now = new Date();

    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    const todayEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
    );
    const yesterdayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1)
    );

    const [
      totalPalettes,
      totalProducts,
      capacitySummary,
      palettesReceivedToday,
      palettesReceivedYesterday,
      ruleCount,
    ] = await Promise.all([
      this.paletteRepository.countActivePalettes(),
      this.productRepository.countActiveProducts(),
      this.palettierRepository.getCapacitySummary(),
      this.paletteRepository.countPalettesCreatedBetween(todayStart, todayEnd),
      this.paletteRepository.countPalettesCreatedBetween(
        yesterdayStart,
        todayStart
      ),
      this.ruleRepository.countActiveRules(),
    ]);

    const { count: palettierCount, totalCapacity } = capacitySummary;
    const capacityUtilization =
      totalCapacity > 0 ? totalPalettes / totalCapacity : 0;

    let trend: "increasing" | "decreasing" | "stable";
    if (palettesReceivedToday > palettesReceivedYesterday) {
      trend = "increasing";
    } else if (palettesReceivedToday < palettesReceivedYesterday) {
      trend = "decreasing";
    } else {
      trend = "stable";
    }

    const hasPalettiers = palettierCount > 0;
    const hasProducts = totalProducts > 0;
    const hasRules = ruleCount > 0;
    const hasStock = totalPalettes > 0;
    const completedSteps = [hasPalettiers, hasProducts, hasRules, hasStock].filter(Boolean).length;

    return {
      stock: {
        totalPalettes,
        totalProducts,
        totalCapacity,
        capacityUtilization,
      },
      intake: {
        palettesReceivedToday,
        palettesReceivedYesterday,
        trend,
      },
      setup: {
        hasPalettiers,
        hasProducts,
        hasRules,
        hasStock,
        completedSteps,
        totalSteps: 4,
      },
    };
  }
}
