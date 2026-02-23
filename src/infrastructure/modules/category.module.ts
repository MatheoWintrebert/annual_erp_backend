import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryRepository } from "@domain/repositories";
import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  GetCategoriesUseCase,
  GetCategoryByIdUseCase,
  UpdateCategoryUseCase,
} from "@application/use-cases";
import { CategoryTypeormEntity } from "@infrastructure/entities";
import { CategoryMysqlRepository } from "@infrastructure/repositories";
import { CategoryController } from "@infrastructure/controllers";

@Module({
  imports: [TypeOrmModule.forFeature([CategoryTypeormEntity])],
  controllers: [CategoryController],
  providers: [
    {
      provide: CategoryRepository,
      useClass: CategoryMysqlRepository,
    },
    CreateCategoryUseCase,
    GetCategoriesUseCase,
    GetCategoryByIdUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
  ],
  exports: [CategoryRepository],
})
export class CategoryModule {}
