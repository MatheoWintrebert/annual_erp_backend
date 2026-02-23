import { ApiProperty } from "@nestjs/swagger";
import { ProductWithRules } from "@domain/repositories";
import type { RuleViolation } from "@domain/types";
import { ProductResponseDto } from "./product.response.dto";
import { RuleViolationResponseDto } from "../rule/rule-violation.response.dto";

export class UpdateProductResponseDto extends ProductResponseDto {
  @ApiProperty({
    type: [RuleViolationResponseDto],
    description:
      "Violations detected after product rule changes (empty if none)",
  })
  violations!: RuleViolationResponseDto[];

  static fromUpdateResult(
    productWithRules: ProductWithRules,
    violations: RuleViolation[]
  ): UpdateProductResponseDto {
    const baseDto = ProductResponseDto.fromProductWithRules(productWithRules);
    const dto = Object.assign(new UpdateProductResponseDto(), baseDto);
    dto.violations = violations.map((v) =>
      RuleViolationResponseDto.fromDomain(v)
    );
    return dto;
  }
}
