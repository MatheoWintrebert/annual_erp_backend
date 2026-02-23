import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class UpdateProductRequestDto {
  @ApiPropertyOptional({
    example: "REF-002",
    description: "Unique product reference",
    maxLength: 100,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @ApiPropertyOptional({
    example: "Organic Flour 50kg",
    description: "Product name",
    maxLength: 255,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: 2,
    description: "ID of the unit of measure",
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  unitOfMeasureId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "ID of the category",
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  categoryId?: number | null;

  @ApiPropertyOptional({
    example: 20,
    description: "Minimum stock threshold",
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: "minimumStock must be 0 or greater" })
  minimumStock?: number | null;

  @ApiPropertyOptional({
    example: 30,
    description: "Expiry alert threshold in days",
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  expiryAlertThreshold?: number | null;

  @ApiPropertyOptional({
    type: [Number],
    example: [1, 3],
    description:
      "IDs of rules to link to this product (replaces existing links)",
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  ruleIds?: number[];
}
