import { IRuleProductIncompatibilityConfig } from "@domain/types";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { RuleTypeormEntity } from "./rule.typeorm.entity";
import { CategoryTypeormEntity } from "./category.typeorm.entity";

@Entity("rule_product_incompatibility_config")
export class RuleProductIncompatibilityConfigTypeormEntity
  extends BaseEntity
  implements IRuleProductIncompatibilityConfig
{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "rule_id", type: "int", unique: true })
  ruleId!: number;

  @Column({ name: "category_id", type: "int" })
  categoryId!: number;

  @Column({ name: "minimum_distance", type: "int" })
  minimumDistance!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToOne(
    () => RuleTypeormEntity,
    (rule) => rule.productIncompatibilityConfig
  )
  @JoinColumn({ name: "rule_id" })
  rule!: RuleTypeormEntity;

  @ManyToOne(
    () => CategoryTypeormEntity,
    (category) => category.productIncompatibilityConfigs
  )
  @JoinColumn({ name: "category_id" })
  category!: CategoryTypeormEntity;
}
