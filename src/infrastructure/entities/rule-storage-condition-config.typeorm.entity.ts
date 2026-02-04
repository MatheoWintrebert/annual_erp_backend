import {
  IRuleStorageConditionConfig,
  IRuleStorageConditionPalettier,
  SelectionMode,
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
import { PalettierTypeTypeormEntity } from "./palettier-type.typeorm.entity";
import { PalettierTypeormEntity } from "./palettier.typeorm.entity";

@Entity("rule_storage_condition_config")
export class RuleStorageConditionConfigTypeormEntity
  extends BaseEntity
  implements IRuleStorageConditionConfig
{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "rule_id", type: "int", unique: true })
  ruleId!: number;

  @Column({ name: "condition_type", type: "varchar", length: 100 })
  conditionType!: string;

  @Column({ name: "selection_mode", type: "enum", enum: SelectionMode })
  selectionMode!: SelectionMode;

  @Column({ name: "palettier_type_id", type: "int", nullable: true })
  palettierTypeId!: number | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToOne(() => RuleTypeormEntity, (rule) => rule.storageConditionConfig)
  @JoinColumn({ name: "rule_id" })
  rule!: RuleTypeormEntity;

  @ManyToOne(() => PalettierTypeTypeormEntity)
  @JoinColumn({ name: "palettier_type_id" })
  palettierType!: PalettierTypeTypeormEntity | null;

  @OneToMany(() => RuleStorageConditionPalettierTypeormEntity, (p) => p.config)
  palettiers!: RuleStorageConditionPalettierTypeormEntity[];
}

@Entity("rule_storage_condition_palettier")
export class RuleStorageConditionPalettierTypeormEntity
  extends BaseEntity
  implements IRuleStorageConditionPalettier
{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "config_id", type: "int" })
  configId!: number;

  @Column({ name: "palettier_id", type: "int" })
  palettierId!: number;

  @ManyToOne(
    () => RuleStorageConditionConfigTypeormEntity,
    (config) => config.palettiers
  )
  @JoinColumn({ name: "config_id" })
  config!: RuleStorageConditionConfigTypeormEntity;

  @ManyToOne(() => PalettierTypeormEntity)
  @JoinColumn({ name: "palettier_id" })
  palettier!: PalettierTypeormEntity;
}
