import { ApiProperty } from "@nestjs/swagger";
import type { RuleViolation } from "@domain/types";

export class RuleViolationResponseDto {
  @ApiProperty({ example: 1 })
  paletteId!: number;

  @ApiProperty({ example: "Rack A1" })
  palettierName!: string;

  @ApiProperty({ example: 0 })
  positionX!: number;

  @ApiProperty({ example: 0 })
  positionY!: number;

  @ApiProperty({ example: 3 })
  positionZ!: number;

  @ApiProperty({ example: "Fragile Product" })
  productName!: string;

  @ApiProperty({ example: "Ground Only Rule" })
  ruleName!: string;

  @ApiProperty({ example: "placement_constraint" })
  ruleType!: string;

  @ApiProperty({
    example: "Palette must be on ground level (position Z=0), currently at Z=3",
  })
  violationReason!: string;

  static fromDomain(violation: RuleViolation): RuleViolationResponseDto {
    const dto = new RuleViolationResponseDto();
    dto.paletteId = violation.paletteId;
    dto.palettierName = violation.palettierName;
    dto.positionX = violation.positionX;
    dto.positionY = violation.positionY;
    dto.positionZ = violation.positionZ;
    dto.productName = violation.productName;
    dto.ruleName = violation.ruleName;
    dto.ruleType = violation.ruleType;
    dto.violationReason = violation.violationReason;
    return dto;
  }
}
