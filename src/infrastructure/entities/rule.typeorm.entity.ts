import { IRule, RuleType } from "@domain/types";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProductRuleTypeormEntity } from "./product-rule.typeorm.entity";
import { RuleZonePriorityConfigTypeormEntity } from "./rule-zone-priority-config.typeorm.entity";
import { RuleProductIncompatibilityConfigTypeormEntity } from "./rule-product-incompatibility-config.typeorm.entity";
import { RuleStorageConditionConfigTypeormEntity } from "./rule-storage-condition-config.typeorm.entity";
import { RulePlacementConstraintConfigTypeormEntity } from "./rule-placement-constraint-config.typeorm.entity";

@Entity("rule")
export class RuleTypeormEntity extends BaseEntity implements IRule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "enum", enum: RuleType })
  type!: RuleType;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt!: Date | null;

  @OneToMany(() => ProductRuleTypeormEntity, (pr) => pr.rule)
  productRules!: ProductRuleTypeormEntity[];

  @OneToOne(() => RuleZonePriorityConfigTypeormEntity, (config) => config.rule)
  zonePriorityConfig!: RuleZonePriorityConfigTypeormEntity | null;

  @OneToOne(
    () => RuleProductIncompatibilityConfigTypeormEntity,
    (config) => config.rule
  )
  productIncompatibilityConfig!: RuleProductIncompatibilityConfigTypeormEntity | null;

  @OneToOne(
    () => RuleStorageConditionConfigTypeormEntity,
    (config) => config.rule
  )
  storageConditionConfig!: RuleStorageConditionConfigTypeormEntity | null;

  @OneToOne(
    () => RulePlacementConstraintConfigTypeormEntity,
    (config) => config.rule
  )
  placementConstraintConfig!: RulePlacementConstraintConfigTypeormEntity | null;
}
