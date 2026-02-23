import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  LotRepository,
  PaletteRepository,
  PaletteLotRepository,
  PalettierRepository,
} from "@domain/repositories";
import { PlacementEngineService } from "@domain/services";
import {
  RecommendPlacementUseCase,
  RegisterConflictResolutionUseCase,
  RegisterPaletteUseCase,
} from "@application/use-cases";
import {
  LotTypeormEntity,
  PaletteTypeormEntity,
  PaletteLotTypeormEntity,
  PalettierTypeormEntity,
} from "@infrastructure/entities";
import {
  LotMysqlRepository,
  PaletteMysqlRepository,
  PaletteLotMysqlRepository,
  PalettierMysqlRepository,
} from "@infrastructure/repositories";
import { IntakeController } from "@infrastructure/controllers";
import { RuleModule } from "./rule.module";
import { ProductModule } from "./product.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaletteTypeormEntity,
      LotTypeormEntity,
      PaletteLotTypeormEntity,
      PalettierTypeormEntity,
    ]),
    RuleModule,
    ProductModule,
  ],
  controllers: [IntakeController],
  providers: [
    {
      provide: PaletteRepository,
      useClass: PaletteMysqlRepository,
    },
    {
      provide: LotRepository,
      useClass: LotMysqlRepository,
    },
    {
      provide: PaletteLotRepository,
      useClass: PaletteLotMysqlRepository,
    },
    {
      provide: PalettierRepository,
      useClass: PalettierMysqlRepository,
    },
    PlacementEngineService,
    RecommendPlacementUseCase,
    RegisterConflictResolutionUseCase,
    RegisterPaletteUseCase,
  ],
})
export class IntakeModule {}
