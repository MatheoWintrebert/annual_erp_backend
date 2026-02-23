import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsPositive,
  Min,
  ValidateNested,
} from "class-validator";
import { PaletteContentItemDto } from "./register-palette.request.dto";

export class ConflictGroupRegistrationDto {
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

export class RegisterConflictResolutionRequestDto {
  @ApiProperty({
    type: [ConflictGroupRegistrationDto],
    description: "Groups of products to register at separate positions",
  })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => ConflictGroupRegistrationDto)
  groups!: ConflictGroupRegistrationDto[];
}
