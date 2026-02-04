import { IUnitOfMeasure } from "@domain/types";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProductTypeormEntity } from "./product.typeorm.entity";

@Entity("unit_of_measure")
export class UnitOfMeasureTypeormEntity
  extends BaseEntity
  implements IUnitOfMeasure
{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 50 })
  name!: string;

  @Column({ type: "varchar", length: 10 })
  abbreviation!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => ProductTypeormEntity, (product) => product.unitOfMeasure)
  products!: ProductTypeormEntity[];
}
