import { ApiProperty } from "@nestjs/swagger";
import { UnitOfMeasureEntity } from "@domain/entities";
import { FindUnitsOfMeasureResult } from "@domain/repositories";

export class UnitOfMeasureResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "Kilogram" })
  name!: string;

  @ApiProperty({ example: "kg" })
  abbreviation!: string;

  @ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-20T14:45:00.000Z" })
  updatedAt!: Date;

  static fromEntity(entity: UnitOfMeasureEntity): UnitOfMeasureResponseDto {
    const dto = new UnitOfMeasureResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.abbreviation = entity.abbreviation;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}

export class UnitOfMeasurePaginationMetaDto {
  @ApiProperty({
    example: 100,
    description: "Total number of units of measure",
  })
  total!: number;

  @ApiProperty({ example: 1, description: "Current page number" })
  page!: number;

  @ApiProperty({ example: 20, description: "Number of items per page" })
  limit!: number;

  @ApiProperty({ example: 5, description: "Total number of pages" })
  totalPages!: number;
}

export class UnitsOfMeasureListResponseDto {
  @ApiProperty({
    type: [UnitOfMeasureResponseDto],
    description: "Array of units of measure",
  })
  unitsOfMeasure!: UnitOfMeasureResponseDto[];

  @ApiProperty({
    type: UnitOfMeasurePaginationMetaDto,
    description: "Pagination metadata",
  })
  meta!: UnitOfMeasurePaginationMetaDto;

  static fromFindUnitsOfMeasureResult(
    result: FindUnitsOfMeasureResult
  ): UnitsOfMeasureListResponseDto {
    const dto = new UnitsOfMeasureListResponseDto();
    dto.unitsOfMeasure = result.unitsOfMeasure.map((u) =>
      UnitOfMeasureResponseDto.fromEntity(u)
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
