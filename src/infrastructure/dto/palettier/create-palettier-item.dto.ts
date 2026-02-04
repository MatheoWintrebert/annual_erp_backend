import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from "class-validator";

export class CreatePalettierItemDto {
  @ApiProperty({
    example: "Rack A1",
    description: "Name of the palettier",
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    example: 1,
    description:
      "ID of an existing palettier type. Either typeId or newTypeName must be provided, but not both.",
  })
  @ValidateIf((o: CreatePalettierItemDto) => o.newTypeName === undefined)
  @IsInt()
  @IsPositive()
  typeId?: number;

  @ApiPropertyOptional({
    example: "Cold Storage",
    description:
      "Name of a new palettier type to create. Either typeId or newTypeName must be provided, but not both.",
    maxLength: 100,
  })
  @ValidateIf((o: CreatePalettierItemDto) => o.typeId === undefined)
  @IsString()
  @MaxLength(100)
  newTypeName?: string;

  @ApiProperty({
    example: 5,
    description: "Number of slots along the width (x-axis)",
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  width!: number;

  @ApiProperty({
    example: 3,
    description: "Number of slots along the depth (y-axis)",
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  depth!: number;

  @ApiProperty({
    example: 4,
    description: "Number of slots along the height (z-axis)",
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  height!: number;
}
