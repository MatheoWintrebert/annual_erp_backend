import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  PickingListTypeormEntity,
  PickingListItemTypeormEntity,
  PaletteTypeormEntity,
  LotTypeormEntity,
  PaletteLotTypeormEntity,
  PalettierTypeormEntity,
} from "@infrastructure/entities";
import { PickingController } from "@infrastructure/controllers";
import { PaletteRepository, PickingListRepository } from "@domain/repositories";
import {
  PaletteMysqlRepository,
  PickingListMysqlRepository,
} from "@infrastructure/repositories";
import {
  GetAvailableStockUseCase,
  CreatePickingListUseCase,
  GeneratePickRouteUseCase,
  CompletePickingListUseCase,
  CancelPickingListUseCase,
} from "@application/use-cases";
import { FefoService } from "@domain/services";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PickingListTypeormEntity,
      PickingListItemTypeormEntity,
      PaletteTypeormEntity,
      LotTypeormEntity,
      PaletteLotTypeormEntity,
      PalettierTypeormEntity,
    ]),
  ],
  controllers: [PickingController],
  providers: [
    {
      provide: PickingListRepository,
      useClass: PickingListMysqlRepository,
    },
    {
      provide: PaletteRepository,
      useClass: PaletteMysqlRepository,
    },
    FefoService,
    GetAvailableStockUseCase,
    CreatePickingListUseCase,
    GeneratePickRouteUseCase,
    CompletePickingListUseCase,
    CancelPickingListUseCase,
  ],
})
export class PickingModule {}
