import { IRule, RuleType } from "@domain/types";

export class RuleEntity implements IRule {
  public readonly id: number;
  public readonly name: string;
  public readonly description: string | null;
  public readonly type: RuleType;
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt: Date | null;

  constructor(params: IRule) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.type = params.type;
    this.isActive = params.isActive;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.deletedAt = params.deletedAt;
  }
}
