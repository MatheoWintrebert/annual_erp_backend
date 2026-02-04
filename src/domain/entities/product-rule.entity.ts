import { IProductRule } from "@domain/types";

export class ProductRuleEntity implements IProductRule {
  public readonly id: number;
  public readonly productId: number;
  public readonly ruleId: number;
  public readonly createdAt: Date;

  constructor(params: IProductRule) {
    this.id = params.id;
    this.productId = params.productId;
    this.ruleId = params.ruleId;
    this.createdAt = params.createdAt;
  }
}
