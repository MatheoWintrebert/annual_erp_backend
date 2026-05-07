import { Injectable } from "@nestjs/common";
import { RuleRepository } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";
import type { RuleViolation } from "@domain/types";
import { RuleViolationDetectorService } from "@domain/services";

const MAX_RULES_FOR_VIOLATION_SCAN = 1000;

@Injectable()
export class GetPaletteViolationsUseCase implements QueryUseCase<
  void,
  RuleViolation[]
> {
  constructor(
    private readonly ruleRepository: RuleRepository,
    private readonly violationDetector: RuleViolationDetectorService
  ) {}

  async execute(): Promise<RuleViolation[]> {
    const { rules } = await this.ruleRepository.findAll({
      isActive: true,
      limit: MAX_RULES_FOR_VIOLATION_SCAN,
    });

    const settledResults = await Promise.allSettled(
      rules.map((ruleWithConfig) =>
        this.violationDetector.detectViolations(ruleWithConfig.rule.id)
      )
    );

    const rejections = settledResults.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected"
    );

    if (rejections.length > 0) {
      rejections.forEach((r) => {
        console.error("Rule violation check failed:", r.reason);
      });
      if (rejections.length === settledResults.length) {
        throw rejections[0].reason as Error;
      }
    }

    return settledResults
      .filter(
        (result): result is PromiseFulfilledResult<RuleViolation[]> =>
          result.status === "fulfilled"
      )
      .flatMap((result) => result.value);
  }
}
