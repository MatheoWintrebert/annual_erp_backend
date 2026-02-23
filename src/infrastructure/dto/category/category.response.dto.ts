import { ApiProperty } from "@nestjs/swagger";
import { CategoryEntity } from "@domain/entities";
import { FindCategoriesResult } from "@domain/repositories";

export class CategoryResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "Hazardous" })
  name!: string;

  @ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-20T14:45:00.000Z" })
  updatedAt!: Date;

  static fromEntity(entity: CategoryEntity): CategoryResponseDto {
    const dto = new CategoryResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}

export class CategoryPaginationMetaDto {
  @ApiProperty({ example: 100, description: "Total number of categories" })
  total!: number;

  @ApiProperty({ example: 1, description: "Current page number" })
  page!: number;

  @ApiProperty({ example: 20, description: "Number of items per page" })
  limit!: number;

  @ApiProperty({ example: 5, description: "Total number of pages" })
  totalPages!: number;
}

export class CategoriesListResponseDto {
  @ApiProperty({
    type: [CategoryResponseDto],
    description: "Array of categories",
  })
  categories!: CategoryResponseDto[];

  @ApiProperty({
    type: CategoryPaginationMetaDto,
    description: "Pagination metadata",
  })
  meta!: CategoryPaginationMetaDto;

  static fromFindCategoriesResult(
    result: FindCategoriesResult
  ): CategoriesListResponseDto {
    const dto = new CategoriesListResponseDto();
    dto.categories = result.categories.map((c) =>
      CategoryResponseDto.fromEntity(c)
    );
    dto.meta = {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
    return dto;
  }
}
