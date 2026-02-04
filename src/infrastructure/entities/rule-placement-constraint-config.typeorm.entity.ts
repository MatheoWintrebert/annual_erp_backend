import {
  IRulePlacementConstraintConfig,
  PlacementConstraintType,
} from "@domain/types";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { RuleTypeormEntity } from "./rule.typeorm.entity";

@Entity("rule_placement_constraint_config")
export class RulePlacementConstraintConfigTypeormEntity
  extends BaseEntity
  implements IRulePlacementConstraintConfig
{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "rule_id", type: "int", unique: true })
  ruleId!: number;

  @Column({
    name: "constraint_type",
    type: "enum",
    enum: PlacementConstraintType,
  })
  constraintType!: PlacementConstraintType;

  @Column({ name: "max_height", type: "int", nullable: true })
  maxHeight!: number | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToOne(() => RuleTypeormEntity, (rule) => rule.placementConstraintConfig)
  @JoinColumn({ name: "rule_id" })
  rule!: RuleTypeormEntity;
}
