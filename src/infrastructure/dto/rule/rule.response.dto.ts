import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  PlacementConstraintType,
  RuleType,
  SelectionMode,
} from "@domain/types";
import { RuleWithConfig } from "@domain/repositories";

export class ZonePriorityConfigResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  priorityLevel!: number;

  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  palettierIds!: number[];

  @ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-20T14:45:00.000Z" })
  updatedAt!: Date;
}

export class ProductIncompatibilityConfigResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  categoryId!: number;

  @ApiProperty({ example: 3 })
  minimumDistance!: number;

  @ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-20T14:45:00.000Z" })
  updatedAt!: Date;
}

export class StorageConditionConfigResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "refrigerated" })
  conditionType!: string;

  @ApiProperty({ enum: SelectionMode, example: SelectionMode.PALETTIER_TYPE })
  selectionMode!: SelectionMode;

  @ApiPropertyOptional({ example: 1, nullable: true })
  palettierTypeId!: number | null;

  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  palettierIds!: number[];

  @ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-20T14:45:00.000Z" })
  updatedAt!: Date;
}

export class PlacementConstraintConfigResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({
    enum: PlacementConstraintType,
    example: PlacementConstraintType.MAX_HEIGHT,
  })
  constraintType!: PlacementConstraintType;

  @ApiPropertyOptional({ example: 3, nullable: true })
  maxHeight!: number | null;

  @ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-20T14:45:00.000Z" })
  updatedAt!: Date;
}

export class RuleResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "Cold Storage Zone" })
  name!: string;

  @ApiPropertyOptional({
    example:
      "Products requiring cold storage must be placed in refrigerated zones",
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({ enum: RuleType, example: RuleType.STORAGE_CONDITION })
  type!: RuleType;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-20T14:45:00.000Z" })
  updatedAt!: Date;

  @ApiPropertyOptional({ type: ZonePriorityConfigResponseDto })
  zonePriorityConfig?: ZonePriorityConfigResponseDto;

  @ApiPropertyOptional({ type: ProductIncompatibilityConfigResponseDto })
  productIncompatibilityConfig?: ProductIncompatibilityConfigResponseDto;

  @ApiPropertyOptional({ type: StorageConditionConfigResponseDto })
  storageConditionConfig?: StorageConditionConfigResponseDto;

  @ApiPropertyOptional({ type: PlacementConstraintConfigResponseDto })
  placementConstraintConfig?: PlacementConstraintConfigResponseDto;

  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2, 3],
    description: "Linked product IDs (only included when requested)",
  })
  productIds?: number[];

  static fromRuleWithConfig(ruleWithConfig: RuleWithConfig): RuleResponseDto {
    const dto = new RuleResponseDto();
    dto.id = ruleWithConfig.rule.id;
    dto.name = ruleWithConfig.rule.name;
    dto.description = ruleWithConfig.rule.description;
    dto.type = ruleWithConfig.rule.type;
    dto.isActive = ruleWithConfig.rule.isActive;
    dto.createdAt = ruleWithConfig.rule.createdAt;
    dto.updatedAt = ruleWithConfig.rule.updatedAt;

    if (ruleWithConfig.zonePriorityConfig) {
      const configDto = new ZonePriorityConfigResponseDto();
      configDto.id = ruleWithConfig.zonePriorityConfig.id;
      configDto.priorityLevel = ruleWithConfig.zonePriorityConfig.priorityLevel;
      configDto.palettierIds = ruleWithConfig.zonePriorityConfig.palettierIds;
      configDto.createdAt = ruleWithConfig.zonePriorityConfig.createdAt;
      configDto.updatedAt = ruleWithConfig.zonePriorityConfig.updatedAt;
      dto.zonePriorityConfig = configDto;
    }

    if (ruleWithConfig.productIncompatibilityConfig) {
      const configDto = new ProductIncompatibilityConfigResponseDto();
      configDto.id = ruleWithConfig.productIncompatibilityConfig.id;
      configDto.categoryId =
        ruleWithConfig.productIncompatibilityConfig.categoryId;
      configDto.minimumDistance =
        ruleWithConfig.productIncompatibilityConfig.minimumDistance;
      configDto.createdAt =
        ruleWithConfig.productIncompatibilityConfig.createdAt;
      configDto.updatedAt =
        ruleWithConfig.productIncompatibilityConfig.updatedAt;
      dto.productIncompatibilityConfig = configDto;
    }

    if (ruleWithConfig.storageConditionConfig) {
      const configDto = new StorageConditionConfigResponseDto();
      configDto.id = ruleWithConfig.storageConditionConfig.id;
      configDto.conditionType =
        ruleWithConfig.storageConditionConfig.conditionType;
      configDto.selectionMode =
        ruleWithConfig.storageConditionConfig.selectionMode;
      configDto.palettierTypeId =
        ruleWithConfig.storageConditionConfig.palettierTypeId;
      configDto.palettierIds =
        ruleWithConfig.storageConditionConfig.palettierIds;
      configDto.createdAt = ruleWithConfig.storageConditionConfig.createdAt;
      configDto.updatedAt = ruleWithConfig.storageConditionConfig.updatedAt;
      dto.storageConditionConfig = configDto;
    }

    if (ruleWithConfig.placementConstraintConfig) {
      const configDto = new PlacementConstraintConfigResponseDto();
      configDto.id = ruleWithConfig.placementConstraintConfig.id;
      configDto.constraintType =
        ruleWithConfig.placementConstraintConfig.constraintType;
      configDto.maxHeight = ruleWithConfig.placementConstraintConfig.maxHeight;
      configDto.createdAt = ruleWithConfig.placementConstraintConfig.createdAt;
      configDto.updatedAt = ruleWithConfig.placementConstraintConfig.updatedAt;
      dto.placementConstraintConfig = configDto;
    }

    if (ruleWithConfig.productIds) {
      dto.productIds = ruleWithConfig.productIds;
    }

    return dto;
  }
}
