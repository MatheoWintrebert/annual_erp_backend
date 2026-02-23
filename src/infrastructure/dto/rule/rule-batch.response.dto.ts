import { ApiProperty } from "@nestjs/swagger";
import { RuleWithConfig } from "@domain/repositories";
import { RuleResponseDto } from "./rule.response.dto";

export class RuleBatchResponseDto {
  @ApiProperty({
    type: [RuleResponseDto],
    description: "Array of created rules",
  })
  rules!: RuleResponseDto[];

  @ApiProperty({
    example: 3,
    description: "Number of rules created",
  })
  count!: number;

  static fromRulesWithConfig(
    rulesWithConfig: RuleWithConfig[]
  ): RuleBatchResponseDto {
    const dto = new RuleBatchResponseDto();
    dto.rules = rulesWithConfig.map((rwc) =>
      RuleResponseDto.fromRuleWithConfig(rwc)
    );
    dto.count = rulesWithConfig.length;
    return dto;
  }
}
