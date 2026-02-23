import { ICategory } from "@domain/types";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProductTypeormEntity } from "./product.typeorm.entity";
import { RuleProductIncompatibilityConfigTypeormEntity } from "./rule-product-incompatibility-config.typeorm.entity";

@Entity("category")
export class CategoryTypeormEntity extends BaseEntity implements ICategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 100 })
  name!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt!: Date | null;

  @OneToMany(() => ProductTypeormEntity, (product) => product.category)
  products!: ProductTypeormEntity[];

  @OneToMany(
    () => RuleProductIncompatibilityConfigTypeormEntity,
    (config) => config.category
  )
  productIncompatibilityConfigs!: RuleProductIncompatibilityConfigTypeormEntity[];
}
