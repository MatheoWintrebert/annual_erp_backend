import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class UpdatePalettierRequestDto {
  @ApiPropertyOptional({
    example: "Rack A1",
    description: "Name of the palettier",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 1,
    description: "ID of the palettier type. Set to null to remove the type.",
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  palettierTypeId?: number | null;

  @ApiPropertyOptional({
    example: 5,
    description: "Number of slots along the width (x-axis)",
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @ApiPropertyOptional({
    example: 3,
    description: "Number of slots along the depth (y-axis)",
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  depth?: number;

  @ApiPropertyOptional({
    example: 4,
    description: "Number of slots along the height (z-axis)",
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;
}
