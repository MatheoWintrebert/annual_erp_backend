import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class PaletteContentItemDto {
  @ApiProperty({ example: 1, description: "Product ID" })
  @IsInt()
  @IsPositive()
  productId!: number;

  @ApiPropertyOptional({
    example: "LOT-20260209-0001",
    description: "Lot reference (auto-generated if omitted)",
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lotReference?: string;

  @ApiPropertyOptional({
    example: "2026-12-31",
    description: "Expiry date in ISO format",
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ example: 100, description: "Quantity" })
  @IsNumber()
  @IsPositive()
  quantity!: number;
}

export class RegisterPaletteRequestDto {
  @ApiProperty({ example: 1, description: "Target palettier ID" })
  @IsInt()
  @IsPositive()
  palettierId!: number;

  @ApiProperty({ example: 0, description: "Position X (column)" })
  @IsInt()
  @Min(0)
  positionX!: number;

  @ApiProperty({ example: 0, description: "Position Y (row)" })
  @IsInt()
  @Min(0)
  positionY!: number;

  @ApiProperty({ example: 0, description: "Position Z (level)" })
  @IsInt()
  @Min(0)
  positionZ!: number;

  @ApiProperty({
    type: [PaletteContentItemDto],
    description: "Products to register on this palette",
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PaletteContentItemDto)
  items!: PaletteContentItemDto[];
}
