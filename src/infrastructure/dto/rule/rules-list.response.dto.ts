import { ApiProperty } from "@nestjs/swagger";
import { FindRulesResult } from "@domain/repositories";
import { RuleResponseDto } from "./rule.response.dto";

export class PaginationMetaDto {
  @ApiProperty({ example: 100, description: "Total number of items" })
  total!: number;

  @ApiProperty({ example: 1, description: "Current page number" })
  page!: number;

  @ApiProperty({ example: 20, description: "Number of items per page" })
  limit!: number;

  @ApiProperty({ example: 5, description: "Total number of pages" })
  totalPages!: number;
}

export class RulesListResponseDto {
  @ApiProperty({
    type: [RuleResponseDto],
    description: "Array of rules",
  })
  rules!: RuleResponseDto[];

  @ApiProperty({
    type: PaginationMetaDto,
    description: "Pagination metadata",
  })
  meta!: PaginationMetaDto;

  static fromFindRulesResult(result: FindRulesResult): RulesListResponseDto {
    const dto = new RulesListResponseDto();
    dto.rules = result.rules.map((rwc) =>
      RuleResponseDto.fromRuleWithConfig(rwc)
    );
    dto.meta = {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
    return dto;
  }
}
