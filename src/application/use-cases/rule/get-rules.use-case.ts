import { Injectable } from "@nestjs/common";
import { FindRulesResult, RuleRepository } from "@domain/repositories";
import { QueryUseCase, RuleType } from "@domain/types";

export interface GetRulesInput {
  type?: RuleType;
  isActive?: boolean;
  includeProducts?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class GetRulesUseCase implements QueryUseCase<
  GetRulesInput,
  FindRulesResult
> {
  constructor(private readonly ruleRepository: RuleRepository) {}

  async execute(input: GetRulesInput): Promise<FindRulesResult> {
    return this.ruleRepository.findAll({
      type: input.type,
      isActive: input.isActive ?? true,
      includeProducts: input.includeProducts ?? false,
      page: input.page ?? 1,
      limit: input.limit ?? 20,
    });
  }
}
