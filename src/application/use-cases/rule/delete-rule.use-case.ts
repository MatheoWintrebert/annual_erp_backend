import { Injectable } from "@nestjs/common";
import { RuleNotFoundError } from "@domain/errors";
import { RuleRepository } from "@domain/repositories";
import { CommandUseCase } from "@domain/types";

export interface DeleteRuleInput {
  id: number;
}

@Injectable()
export class DeleteRuleUseCase implements CommandUseCase<DeleteRuleInput> {
  constructor(private readonly ruleRepository: RuleRepository) {}

  async execute(input: DeleteRuleInput): Promise<void> {
    const rule = await this.ruleRepository.findById(input.id);

    if (!rule) {
      throw new RuleNotFoundError(input.id);
    }

    await this.ruleRepository.softDelete(input.id);
  }
}
