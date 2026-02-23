import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RuleType } from "@domain/types";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { CreateZonePriorityConfigDto } from "./create-zone-priority-config.dto";
import { CreateProductIncompatibilityConfigDto } from "./create-product-incompatibility-config.dto";
import { CreateStorageConditionConfigDto } from "./create-storage-condition-config.dto";
import { CreatePlacementConstraintConfigDto } from "./create-placement-constraint-config.dto";

export class CreateRuleItemDto {
  @ApiProperty({
    example: "Cold Storage Zone",
    description: "Name of the rule",
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    example:
      "Products requiring cold storage must be placed in refrigerated zones",
    description: "Description of the rule",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    enum: RuleType,
    example: RuleType.STORAGE_CONDITION,
    description: "Type of the rule",
  })
  @IsEnum(RuleType)
  type!: RuleType;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the rule is active (defaults to true)",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2, 3],
    description: "Array of product IDs to link to this rule",
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @ArrayMinSize(1)
  productIds?: number[];

  @ApiPropertyOptional({
    type: CreateZonePriorityConfigDto,
    description: "Configuration for zone_priority rules",
  })
  @ValidateIf((o: CreateRuleItemDto) => o.type === RuleType.ZONE_PRIORITY)
  @ValidateNested()
  @Type(() => CreateZonePriorityConfigDto)
  zonePriorityConfig?: CreateZonePriorityConfigDto;

  @ApiPropertyOptional({
    type: CreateProductIncompatibilityConfigDto,
    description: "Configuration for product_incompatibility rules",
  })
  @ValidateIf(
    (o: CreateRuleItemDto) => o.type === RuleType.PRODUCT_INCOMPATIBILITY
  )
  @ValidateNested()
  @Type(() => CreateProductIncompatibilityConfigDto)
  productIncompatibilityConfig?: CreateProductIncompatibilityConfigDto;

  @ApiPropertyOptional({
    type: CreateStorageConditionConfigDto,
    description: "Configuration for storage_condition rules",
  })
  @ValidateIf((o: CreateRuleItemDto) => o.type === RuleType.STORAGE_CONDITION)
  @ValidateNested()
  @Type(() => CreateStorageConditionConfigDto)
  storageConditionConfig?: CreateStorageConditionConfigDto;

  @ApiPropertyOptional({
    type: CreatePlacementConstraintConfigDto,
    description: "Configuration for placement_constraint rules",
  })
  @ValidateIf(
    (o: CreateRuleItemDto) => o.type === RuleType.PLACEMENT_CONSTRAINT
  )
  @ValidateNested()
  @Type(() => CreatePlacementConstraintConfigDto)
  placementConstraintConfig?: CreatePlacementConstraintConfigDto;
}
