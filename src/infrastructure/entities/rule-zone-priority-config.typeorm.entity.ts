import {
  IRuleZonePriorityConfig,
  IRuleZonePriorityPalettier,
} from "@domain/types";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { RuleTypeormEntity } from "./rule.typeorm.entity";
import { PalettierTypeormEntity } from "./palettier.typeorm.entity";

@Entity("rule_zone_priority_config")
export class RuleZonePriorityConfigTypeormEntity
  extends BaseEntity
  implements IRuleZonePriorityConfig
{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "rule_id", type: "int", unique: true })
  ruleId!: number;

  @Column({ name: "priority_level", type: "int" })
  priorityLevel!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToOne(() => RuleTypeormEntity, (rule) => rule.zonePriorityConfig)
  @JoinColumn({ name: "rule_id" })
  rule!: RuleTypeormEntity;

  @OneToMany(() => RuleZonePriorityPalettierTypeormEntity, (p) => p.config)
  palettiers!: RuleZonePriorityPalettierTypeormEntity[];
}

@Entity("rule_zone_priority_palettier")
export class RuleZonePriorityPalettierTypeormEntity
  extends BaseEntity
  implements IRuleZonePriorityPalettier
{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "config_id", type: "int" })
  configId!: number;

  @Column({ name: "palettier_id", type: "int" })
  palettierId!: number;

  @ManyToOne(
    () => RuleZonePriorityConfigTypeormEntity,
    (config) => config.palettiers
  )
  @JoinColumn({ name: "config_id" })
  config!: RuleZonePriorityConfigTypeormEntity;

  @ManyToOne(() => PalettierTypeormEntity)
  @JoinColumn({ name: "palettier_id" })
  palettier!: PalettierTypeormEntity;
}
