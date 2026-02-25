import { ITable } from "@domain/types";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class TableTypeormEntity extends BaseEntity implements ITable {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "last_name", nullable: true, type: "varchar" })
  name!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
