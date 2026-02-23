import { ApiPropertyOptional } from "@nestjs/swagger";
import { PlacementConstraintType, SelectionMode } from "@domain/types";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

export class UpdateZonePriorityConfigDto {
  @ApiPropertyOptional({
    example: 1,
    description: "Priority level (lower number = higher priority)",
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  priorityLevel?: number;

  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2, 3],
    description: "Array of palettier IDs to assign to this zone",
    minItems: 1,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  palettierIds?: number[];
}

export class UpdateProductIncompatibilityConfigDto {
  @ApiPropertyOptional({
    example: 1,
    description: "ID of the incompatibility category",
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  categoryId?: number;

  @ApiPropertyOptional({
    example: 3,
    description:
      "Minimum distance (in palettier slots) required between incompatible products",
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minimumDistance?: number;
}

export class UpdateStorageConditionConfigDto {
  @ApiPropertyOptional({
    example: "refrigerated",
    description: "Type of storage condition required",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  conditionType?: string;

  @ApiPropertyOptional({
    enum: SelectionMode,
    example: SelectionMode.PALETTIER_TYPE,
    description:
      "How palettiers are selected: by type or specific palettier IDs",
  })
  @IsOptional()
  @IsEnum(SelectionMode)
  selectionMode?: SelectionMode;

  @ApiPropertyOptional({
    example: 1,
    description:
      "ID of the palettier type (used when selectionMode is 'palettier_type')",
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  palettierTypeId?: number | null;

  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2, 3],
    description:
      "Array of specific palettier IDs (used when selectionMode is 'specific_palettier')",
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  palettierIds?: number[];
}

export class UpdatePlacementConstraintConfigDto {
  @ApiPropertyOptional({
    enum: PlacementConstraintType,
    example: PlacementConstraintType.MAX_HEIGHT,
    description: "Type of placement constraint",
  })
  @IsOptional()
  @IsEnum(PlacementConstraintType)
  constraintType?: PlacementConstraintType;

  @ApiPropertyOptional({
    example: 3,
    description:
      "Maximum height in slots (required when constraintType is 'max_height')",
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxHeight?: number | null;
}

export class UpdateRuleRequestDto {
  @ApiPropertyOptional({
    example: "Cold Storage Zone",
    description: "Name of the rule",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example:
      "Products requiring cold storage must be placed in refrigerated zones",
    description: "Description of the rule",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the rule is active",
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: UpdateZonePriorityConfigDto,
    description: "Configuration update for zone_priority rules",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateZonePriorityConfigDto)
  zonePriorityConfig?: UpdateZonePriorityConfigDto;

  @ApiPropertyOptional({
    type: UpdateProductIncompatibilityConfigDto,
    description: "Configuration update for product_incompatibility rules",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProductIncompatibilityConfigDto)
  productIncompatibilityConfig?: UpdateProductIncompatibilityConfigDto;

  @ApiPropertyOptional({
    type: UpdateStorageConditionConfigDto,
    description: "Configuration update for storage_condition rules",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateStorageConditionConfigDto)
  storageConditionConfig?: UpdateStorageConditionConfigDto;

  @ApiPropertyOptional({
    type: UpdatePlacementConstraintConfigDto,
    description: "Configuration update for placement_constraint rules",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePlacementConstraintConfigDto)
  placementConstraintConfig?: UpdatePlacementConstraintConfigDto;
}
