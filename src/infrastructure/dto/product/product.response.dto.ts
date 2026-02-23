import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { FindProductsResult, ProductWithRules } from "@domain/repositories";

export class ProductResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "REF-001" })
  reference!: string;

  @ApiProperty({ example: "Organic Flour 25kg" })
  name!: string;

  @ApiProperty({ example: 1 })
  unitOfMeasureId!: number;

  @ApiPropertyOptional({ example: 1, nullable: true })
  categoryId!: number | null;

  @ApiPropertyOptional({ example: 10.5, nullable: true })
  minimumStock!: number | null;

  @ApiPropertyOptional({ example: 30, nullable: true })
  expiryAlertThreshold!: number | null;

  @ApiProperty({ type: [Number], example: [1, 2] })
  ruleIds!: number[];

  @ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-20T14:45:00.000Z" })
  updatedAt!: Date;

  static fromProductWithRules(data: ProductWithRules): ProductResponseDto {
    const dto = new ProductResponseDto();
    dto.id = data.product.id;
    dto.reference = data.product.reference;
    dto.name = data.product.name;
    dto.unitOfMeasureId = data.product.unitOfMeasureId;
    dto.categoryId = data.product.categoryId;
    dto.minimumStock = data.product.minimumStock;
    dto.expiryAlertThreshold = data.product.expiryAlertThreshold;
    dto.ruleIds = data.ruleIds;
    dto.createdAt = data.product.createdAt;
    dto.updatedAt = data.product.updatedAt;
    return dto;
  }
}

export class ProductPaginationMetaDto {
  @ApiProperty({ example: 100, description: "Total number of products" })
  total!: number;

  @ApiProperty({ example: 1, description: "Current page number" })
  page!: number;

  @ApiProperty({ example: 20, description: "Number of items per page" })
  limit!: number;

  @ApiProperty({ example: 5, description: "Total number of pages" })
  totalPages!: number;
}

export class ProductsListResponseDto {
  @ApiProperty({
    type: [ProductResponseDto],
    description: "Array of products",
  })
  products!: ProductResponseDto[];

  @ApiProperty({
    type: ProductPaginationMetaDto,
    description: "Pagination metadata",
  })
  meta!: ProductPaginationMetaDto;

  static fromFindProductsResult(
    result: FindProductsResult
  ): ProductsListResponseDto {
    const dto = new ProductsListResponseDto();
    dto.products = result.products.map((p) =>
      ProductResponseDto.fromProductWithRules(p)
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
