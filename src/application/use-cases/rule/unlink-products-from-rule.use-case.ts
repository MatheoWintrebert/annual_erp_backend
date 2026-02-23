import { Injectable } from "@nestjs/common";
import { RuleNotFoundError } from "@domain/errors";
import { RuleRepository } from "@domain/repositories";
import { CommandUseCase } from "@domain/types";

export interface UnlinkProductsFromRuleInput {
  ruleId: number;
  productIds: number[];
}

@Injectable()
export class UnlinkProductsFromRuleUseCase implements CommandUseCase<UnlinkProductsFromRuleInput> {
  constructor(private readonly ruleRepository: RuleRepository) {}

  async execute(input: UnlinkProductsFromRuleInput): Promise<void> {
    const rule = await this.ruleRepository.findById(input.ruleId);

    if (!rule) {
      throw new RuleNotFoundError(input.ruleId);
    }

    await this.ruleRepository.unlinkProducts(input.ruleId, input.productIds);
  }
}
