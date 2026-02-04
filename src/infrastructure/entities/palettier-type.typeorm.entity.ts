import { IPalettierType } from "@domain/types";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PalettierTypeormEntity } from "./palettier.typeorm.entity";

@Entity("palettier_type")
export class PalettierTypeTypeormEntity
  extends BaseEntity
  implements IPalettierType
{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(
    () => PalettierTypeormEntity,
    (palettier) => palettier.palettierType
  )
  palettiers!: PalettierTypeormEntity[];
}
