import { ApiProperty } from "@nestjs/swagger";
import type { PlacementViolationWarning } from "@domain/types";

export class PlacementViolationWarningResponseDto {
  @ApiProperty({
    example: "Cold Storage Required",
    description: "Name of the placement rule that is violated",
  })
  ruleName!: string;

  @ApiProperty({
    example: "STORAGE_CONDITION",
    description:
      "Type of the rule (STORAGE_CONDITION, PLACEMENT_CONSTRAINT, PRODUCT_INCOMPATIBILITY)",
  })
  ruleType!: string;

  @ApiProperty({
    example:
      "Product 'Whole Milk' requires cold storage, but palettier 'Dry Storage B' is dry storage type",
    description: "Human-readable explanation of the violation",
  })
  reason!: string;

  static fromDomain(
    warning: PlacementViolationWarning,
  ): PlacementViolationWarningResponseDto {
    const dto = new PlacementViolationWarningResponseDto();
    dto.ruleName = warning.ruleName;
    dto.ruleType = warning.ruleType;
    dto.reason = warning.reason;
    return dto;
  }
}
