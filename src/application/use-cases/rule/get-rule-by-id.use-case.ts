import { Injectable } from "@nestjs/common";
import { RuleNotFoundError } from "@domain/errors";
import { RuleRepository, RuleWithConfig } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

export interface GetRuleByIdInput {
  id: number;
  includeProducts?: boolean;
}

@Injectable()
export class GetRuleByIdUseCase implements QueryUseCase<
  GetRuleByIdInput,
  RuleWithConfig
> {
  constructor(private readonly ruleRepository: RuleRepository) {}

  async execute(input: GetRuleByIdInput): Promise<RuleWithConfig> {
    const rule = await this.ruleRepository.findById(input.id, {
      includeProducts: input.includeProducts ?? false,
    });

    if (!rule) {
      throw new RuleNotFoundError(input.id);
    }

    return rule;
  }
}
