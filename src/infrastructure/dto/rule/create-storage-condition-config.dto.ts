import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SelectionMode } from "@domain/types";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
} from "class-validator";

export class CreateStorageConditionConfigDto {
  @ApiProperty({
    example: "refrigerated",
    description: "Type of storage condition required",
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  conditionType!: string;

  @ApiProperty({
    enum: SelectionMode,
    example: SelectionMode.PALETTIER_TYPE,
    description:
      "How palettiers are selected: by type or specific palettier IDs",
  })
  @IsEnum(SelectionMode)
  selectionMode!: SelectionMode;

  @ApiPropertyOptional({
    example: 1,
    description:
      "ID of the palettier type (required when selectionMode is 'palettier_type')",
    nullable: true,
  })
  @ValidateIf(
    (o: CreateStorageConditionConfigDto) =>
      o.selectionMode === SelectionMode.PALETTIER_TYPE
  )
  @IsInt()
  @IsPositive()
  palettierTypeId?: number | null;

  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2, 3],
    description:
      "Array of specific palettier IDs (required when selectionMode is 'specific_palettier')",
  })
  @ValidateIf(
    (o: CreateStorageConditionConfigDto) =>
      o.selectionMode === SelectionMode.SPECIFIC_PALETTIER
  )
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsOptional()
  palettierIds?: number[];
}
