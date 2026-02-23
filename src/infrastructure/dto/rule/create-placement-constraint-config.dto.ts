import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PlacementConstraintType } from "@domain/types";
import { IsEnum, IsInt, IsOptional, Min, ValidateIf } from "class-validator";

export class CreatePlacementConstraintConfigDto {
  @ApiProperty({
    enum: PlacementConstraintType,
    example: PlacementConstraintType.MAX_HEIGHT,
    description: "Type of placement constraint",
  })
  @IsEnum(PlacementConstraintType)
  constraintType!: PlacementConstraintType;

  @ApiPropertyOptional({
    example: 3,
    description:
      "Maximum height in slots (required when constraintType is 'max_height')",
    minimum: 1,
    nullable: true,
  })
  @ValidateIf(
    (o: CreatePlacementConstraintConfigDto) =>
      o.constraintType === PlacementConstraintType.MAX_HEIGHT
  )
  @IsInt()
  @Min(1)
  @IsOptional()
  maxHeight?: number | null;
}
