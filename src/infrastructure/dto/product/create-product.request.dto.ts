import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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

export class CreateProductRequestDto {
  @ApiProperty({
    example: "REF-001",
    description: "Unique product reference",
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  reference!: string;

  @ApiProperty({
    example: "Organic Flour 25kg",
    description: "Product name",
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    example: 1,
    description: "ID of the unit of measure",
  })
  @IsInt()
  @IsPositive()
  unitOfMeasureId!: number;

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
    example: 10.5,
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
    example: [1, 2],
    description: "IDs of rules to link to this product",
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  ruleIds?: number[];
}
