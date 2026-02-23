import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductRepository } from "@domain/repositories";
import {
  CreateProductUseCase,
  DeleteProductUseCase,
  GetProductByIdUseCase,
  GetProductPaletteCountUseCase,
  GetProductsUseCase,
  UpdateProductUseCase,
} from "@application/use-cases";
import {
  CategoryTypeormEntity,
  LotTypeormEntity,
  PaletteTypeormEntity,
  ProductRuleTypeormEntity,
  ProductTypeormEntity,
  RuleTypeormEntity,
  UnitOfMeasureTypeormEntity,
} from "@infrastructure/entities";
import { ProductMysqlRepository } from "@infrastructure/repositories";
import { ProductController } from "@infrastructure/controllers";
import { RuleModule } from "./rule.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductTypeormEntity,
      ProductRuleTypeormEntity,
      UnitOfMeasureTypeormEntity,
      RuleTypeormEntity,
      CategoryTypeormEntity,
      LotTypeormEntity,
      PaletteTypeormEntity,
    ]),
    RuleModule,
  ],
  controllers: [ProductController],
  providers: [
    {
      provide: ProductRepository,
      useClass: ProductMysqlRepository,
    },
    CreateProductUseCase,
    GetProductsUseCase,
    GetProductByIdUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetProductPaletteCountUseCase,
  ],
  exports: [ProductRepository],
})
export class ProductModule {}
