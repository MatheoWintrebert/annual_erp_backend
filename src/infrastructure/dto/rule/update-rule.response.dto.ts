import { ApiProperty } from "@nestjs/swagger";
import { RuleWithConfig } from "@domain/repositories";
import type { RuleViolation } from "@domain/types";
import { RuleResponseDto } from "./rule.response.dto";
import { RuleViolationResponseDto } from "./rule-violation.response.dto";

export class UpdateRuleResponseDto extends RuleResponseDto {
  @ApiProperty({
    type: [RuleViolationResponseDto],
    description: "Violations detected after rule update (empty if none)",
  })
  violations!: RuleViolationResponseDto[];

  static fromUpdateResult(
    ruleWithConfig: RuleWithConfig,
    violations: RuleViolation[]
  ): UpdateRuleResponseDto {
    const baseDto = RuleResponseDto.fromRuleWithConfig(ruleWithConfig);
    const dto = Object.assign(new UpdateRuleResponseDto(), baseDto);
    dto.violations = violations.map((v) =>
      RuleViolationResponseDto.fromDomain(v)
    );
    return dto;
  }
}
