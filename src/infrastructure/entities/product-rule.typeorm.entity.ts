import { IProductRule } from "@domain/types";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductTypeormEntity } from "./product.typeorm.entity";
import { RuleTypeormEntity } from "./rule.typeorm.entity";

@Entity("product_rule")
@Index(["productId", "ruleId"], { unique: true })
export class ProductRuleTypeormEntity
  extends BaseEntity
  implements IProductRule
{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "product_id", type: "int" })
  productId!: number;

  @Column({ name: "rule_id", type: "int" })
  ruleId!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @ManyToOne(() => ProductTypeormEntity, (product) => product.productRules)
  @JoinColumn({ name: "product_id" })
  product!: ProductTypeormEntity;

  @ManyToOne(() => RuleTypeormEntity, (rule) => rule.productRules)
  @JoinColumn({ name: "rule_id" })
  rule!: RuleTypeormEntity;
}
