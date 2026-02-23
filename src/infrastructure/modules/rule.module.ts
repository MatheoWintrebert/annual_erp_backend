import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RuleRepository } from "@domain/repositories";
import { RuleViolationDetectorService } from "@domain/services";
import {
  CreateRulesBatchUseCase,
  DeleteRuleUseCase,
  GetActiveViolationsUseCase,
  GetRuleByIdUseCase,
  GetRulesUseCase,
  LinkProductsToRuleUseCase,
  UnlinkProductsFromRuleUseCase,
  UpdateRuleUseCase,
} from "@application/use-cases";
import {
  CategoryTypeormEntity,
  PalettierTypeormEntity,
  PalettierTypeTypeormEntity,
  ProductRuleTypeormEntity,
  ProductTypeormEntity,
  RulePlacementConstraintConfigTypeormEntity,
  RuleProductIncompatibilityConfigTypeormEntity,
  RuleStorageConditionConfigTypeormEntity,
  RuleStorageConditionPalettierTypeormEntity,
  RuleTypeormEntity,
  RuleZonePriorityConfigTypeormEntity,
  RuleZonePriorityPalettierTypeormEntity,
} from "@infrastructure/entities";
import { RuleMysqlRepository } from "@infrastructure/repositories";
import { RuleController } from "@infrastructure/controllers";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RuleTypeormEntity,
      RuleZonePriorityConfigTypeormEntity,
      RuleZonePriorityPalettierTypeormEntity,
      RuleProductIncompatibilityConfigTypeormEntity,
      RuleStorageConditionConfigTypeormEntity,
      RuleStorageConditionPalettierTypeormEntity,
      RulePlacementConstraintConfigTypeormEntity,
      ProductRuleTypeormEntity,
      PalettierTypeormEntity,
      ProductTypeormEntity,
      PalettierTypeTypeormEntity,
      CategoryTypeormEntity,
    ]),
  ],
  controllers: [RuleController],
  providers: [
    {
      provide: RuleRepository,
      useClass: RuleMysqlRepository,
    },
    RuleViolationDetectorService,
    CreateRulesBatchUseCase,
    GetRulesUseCase,
    GetRuleByIdUseCase,
    UpdateRuleUseCase,
    DeleteRuleUseCase,
    LinkProductsToRuleUseCase,
    UnlinkProductsFromRuleUseCase,
    GetActiveViolationsUseCase,
  ],
  exports: [RuleRepository, RuleViolationDetectorService],
})
export class RuleModule {}
