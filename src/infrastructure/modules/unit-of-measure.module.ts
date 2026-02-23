import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UnitOfMeasureRepository } from "@domain/repositories";
import {
  CreateUnitOfMeasureUseCase,
  DeleteUnitOfMeasureUseCase,
  GetUnitOfMeasureByIdUseCase,
  GetUnitsOfMeasureUseCase,
  UpdateUnitOfMeasureUseCase,
} from "@application/use-cases";
import { UnitOfMeasureTypeormEntity } from "@infrastructure/entities";
import { UnitOfMeasureMysqlRepository } from "@infrastructure/repositories";
import { UnitOfMeasureController } from "@infrastructure/controllers";

@Module({
  imports: [TypeOrmModule.forFeature([UnitOfMeasureTypeormEntity])],
  controllers: [UnitOfMeasureController],
  providers: [
    {
      provide: UnitOfMeasureRepository,
      useClass: UnitOfMeasureMysqlRepository,
    },
    CreateUnitOfMeasureUseCase,
    GetUnitsOfMeasureUseCase,
    GetUnitOfMeasureByIdUseCase,
    UpdateUnitOfMeasureUseCase,
    DeleteUnitOfMeasureUseCase,
  ],
  exports: [UnitOfMeasureRepository],
})
export class UnitOfMeasureModule {}
