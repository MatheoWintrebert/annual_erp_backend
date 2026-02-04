import { IProduct } from "@domain/types";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UnitOfMeasureTypeormEntity } from "./unit-of-measure.typeorm.entity";
import { LotTypeormEntity } from "./lot.typeorm.entity";
import { ProductRuleTypeormEntity } from "./product-rule.typeorm.entity";

@Entity("product")
export class ProductTypeormEntity extends BaseEntity implements IProduct {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 100 })
  reference!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ name: "unit_of_measure_id", type: "int" })
  unitOfMeasureId!: number;

  @Column({
    name: "minimum_stock",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  minimumStock!: number | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt!: Date | null;

  @ManyToOne(() => UnitOfMeasureTypeormEntity, (unit) => unit.products)
  @JoinColumn({ name: "unit_of_measure_id" })
  unitOfMeasure!: UnitOfMeasureTypeormEntity;

  @OneToMany(() => LotTypeormEntity, (lot) => lot.product)
  lots!: LotTypeormEntity[];

  @OneToMany(() => ProductRuleTypeormEntity, (pr) => pr.product)
  productRules!: ProductRuleTypeormEntity[];
}
