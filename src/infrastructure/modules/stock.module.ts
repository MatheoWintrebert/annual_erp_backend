import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaletteRepository, PalettierRepository } from "@domain/repositories";
import { PlacementEngineService } from "@domain/services";
import {
  CheckOnboardingViolationsUseCase,
  DeletePaletteUseCase,
  GetPalettesUseCase,
  GetPaletteViolationsUseCase,
  UpdatePalettePositionUseCase,
} from "@application/use-cases/stock";
import {
  PaletteTypeormEntity,
  PalettierTypeormEntity,
} from "@infrastructure/entities";
import {
  PaletteMysqlRepository,
  PalettierMysqlRepository,
} from "@infrastructure/repositories";
import { StockController } from "@infrastructure/controllers";
import { RuleModule } from "./rule.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([PaletteTypeormEntity, PalettierTypeormEntity]),
    RuleModule,
  ],
  controllers: [StockController],
  providers: [
    {
      provide: PaletteRepository,
      useClass: PaletteMysqlRepository,
    },
    {
      provide: PalettierRepository,
      useClass: PalettierMysqlRepository,
    },
    PlacementEngineService,
    GetPalettesUseCase,
    GetPaletteViolationsUseCase,
    UpdatePalettePositionUseCase,
    CheckOnboardingViolationsUseCase,
    DeletePaletteUseCase,
  ],
  exports: [PaletteRepository, PalettierRepository],
})
export class StockModule {}
